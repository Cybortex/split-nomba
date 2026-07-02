import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./auth";

// ============================================================================
// ALLOCATION CONFIGURATION
// ============================================================================

/**
 * Get allocation rules for an institution (FINANCE+).
 */
export const getAllocationRules = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("allocationRules")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .order("asc")
      .collect();
  },
});

/**
 * Save allocation rules for an institution (FINANCE+).
 * Replaces all existing rules atomically.
 * Every account receives a fixed amount — no percentages.
 */
export const saveAllocationRules = mutation({
  args: {
    institutionId: v.id("institutions"),
    rules: v.array(
      v.object({
        walletType: v.union(v.literal("institution"), v.literal("faculty"), v.literal("department"), v.literal("association"), v.literal("ict")),
        entityKey: v.string(),
        amount: v.number(), // fixed amount in Naira
        targetEntityId: v.string(),
        targetName: v.string(),
        priority: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    // Delete existing rules
    const existingRules = await ctx.db
      .query("allocationRules")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .collect();

    for (const rule of existingRules) {
      await ctx.db.delete(rule._id);
    }

    // Insert new rules (all fixed amounts)
    for (const rule of args.rules) {
      await ctx.db.insert("allocationRules", {
        institutionId: args.institutionId,
        walletType: rule.walletType,
        entityKey: rule.entityKey,
        amount: rule.amount,
        targetEntityId: rule.targetEntityId,
        targetName: rule.targetName,
        priority: rule.priority,
      });
    }

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "ALLOCATION_RULES_UPDATED",
      entity: "allocationRules",
      entityId: args.institutionId,
      newValue: JSON.stringify({ rulesCount: args.rules.length }),
      timestamp: Date.now(),
      success: true,
    });

    return { updated: args.rules.length };
  },
});

/**
 * Calculate allocation from rules for a given amount.
 * Every account receives a fixed amount — no percentages.
 */
function calculateAllocationFromRules(
  amount: number,
  rules: Array<{
    amount: number;
    targetEntityId: string;
    targetName: string;
    priority: number;
  }>
) {
  const allocation: Record<string, { amount: number; name: string }> = {};
  let remainingAmount = amount;

  // Sort by priority
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sortedRules) {
    // Fixed allocation: cap at remaining if amount exceeds what's left
    const allocatedAmount = Math.min(rule.amount, remainingAmount);

    allocation[rule.targetEntityId] = {
      amount: allocatedAmount,
      name: rule.targetName,
    };

    remainingAmount -= allocatedAmount;
  }

  return { allocation, remainder: remainingAmount };
}

// ============================================================================
// ROUTE PAYMENT — Distribute to wallets using configurable rules
// ============================================================================

export const routePayment = mutation({
  args: {
    institutionId: v.id("institutions"),
    paymentId: v.id("payments"),
    nombaTransactionId: v.string(),
    amount: v.number(),
    faculty: v.string(),
    department: v.string(),
  },
  handler: async (ctx, args) => {
    // Get allocation rules for this institution
    const rules = await ctx.db
      .query("allocationRules")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .order("asc")
      .collect();

    if (rules.length === 0) {
      throw new Error("No allocation rules configured for this institution");
    }

    // Calculate allocation
    const { allocation, remainder } = calculateAllocationFromRules(
      args.amount,
      rules
    );

    // Credit each wallet
    for (const [entityId, alloc] of Object.entries(allocation)) {
      if (alloc.amount <= 0) continue;

      // Get or create wallet
      let wallet = await ctx.db
        .query("wallets")
        .filter((q) =>
          q.and(
            q.eq(q.field("entityId"), entityId),
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
        )
        .first();

      if (!wallet) {
        const walletId = await ctx.db.insert("wallets", {
          institutionId: args.institutionId,
          type: "institution",
          entityId,
          name: alloc.name,
          totalCollected: 0,
          availableBalance: 0,
          minimumBalance: 0,
          transactionCount: 0,
        });

        wallet = (await ctx.db
          .query("wallets")
          .filter((q) =>
            q.and(
              q.eq(q.field("entityId"), entityId),
              q.eq(q.field("institutionId"), args.institutionId as any)
            )
          )
          .first())!;
      }

      // Update wallet
      await ctx.db.patch(wallet._id, {
        availableBalance: (wallet.availableBalance || 0) + alloc.amount,
        totalCollected: (wallet.totalCollected || 0) + alloc.amount,
        transactionCount: (wallet.transactionCount || 0) + 1,
      });

      // Log in immutable ledger
      await ctx.db.insert("walletTransactions", {
        walletId: wallet._id,
        institutionId: args.institutionId,
        paymentReference: args.nombaTransactionId,
        amount: alloc.amount,
        direction: "credit",
        reason: "payment_received",
        timestamp: Date.now(),
      });
    }

    // Handle remainder
    if (remainder > 0) {
      const firstRule = rules[0];
      const instWallet = await ctx.db
        .query("wallets")
        .filter((q) =>
          q.and(
            q.eq(q.field("entityId"), firstRule.targetEntityId),
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
        )
        .first();

      if (instWallet) {
        await ctx.db.patch(instWallet._id, {
          availableBalance: (instWallet.availableBalance || 0) + remainder,
          totalCollected: (instWallet.totalCollected || 0) + remainder,
        });

        await ctx.db.insert("walletTransactions", {
          walletId: instWallet._id,
          institutionId: args.institutionId,
          paymentReference: args.nombaTransactionId,
          amount: remainder,
          direction: "credit",
          reason: "rounding_adjustment",
          timestamp: Date.now(),
        });
      }
    }

    // Mark payment completed
    await ctx.db.patch(args.paymentId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: "SYSTEM",
      action: "PAYMENT_VERIFIED",
      entity: "payments",
      entityId: args.paymentId,
      newValue: JSON.stringify({ allocation, nombaTransactionId: args.nombaTransactionId }),
      timestamp: Date.now(),
      success: true,
    });

    return allocation;
  },
});

// ============================================================================
// PUBLIC QUERIES
// ============================================================================

/**
 * Get full receipt data for a payment (payment + student details).
 * Institution-scoped: only returns data if the payment belongs to the
 * caller's institution — prevents cross-institution receipt lookups.
 * SUPER_ADMIN bypass: Super Admins can view any receipt (for auditing).
 */
export const getReceipt = query({
  args: {
    paymentId: v.id("payments"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("_id"), args.paymentId as any))
      .first();

    if (!payment) return null;

    // SUPER_ADMIN bypass — they can view any receipt for auditing
    let isSuperAdmin = false;
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), identity.subject))
        .first();
      isSuperAdmin = !!(user && user.roles.includes("SUPER_ADMIN"));
    }

    // Non-SUPER_ADMIN: enforce institution scoping
    if (
      !isSuperAdmin &&
      (!payment.institutionId ||
        payment.institutionId.toString() !== args.institutionId.toString())
    ) {
      return null;
    }

    const student = await ctx.db
      .query("studentRecords")
      .filter((q) => q.eq(q.field("matric"), payment.studentMatric))
      .first();

    const institution = await ctx.db
      .query("institutions")
      .filter((q) => q.eq(q.field("_id"), payment.institutionId as any))
      .first();

    return {
      payment: {
        id: payment._id,
        reference: payment.reference,
        nombaTransactionId: payment.nombaTransactionId,
        amount: payment.amount,
        status: payment.status,
        matric: payment.studentMatric,
        faculty: payment.faculty,
        department: payment.department,
        level: payment.level,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
      },
      student: student
        ? {
            matric: student.matric,
            email: student.email,
            faculty: student.faculty,
            department: student.department,
            level: student.level,
          }
        : null,
      institution: institution ? { name: institution.name } : null,
    };
  },
});

export const getPaymentByReference = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q) => q.eq(q.field("reference"), args.reference))
      .first();
  },
});

export const listPayments = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("payments")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .order("desc")
      .collect();
  },
});
