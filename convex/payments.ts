import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./auth";

// ============================================================================
// ROUTE PAYMENT — Distribute to 4 wallets using feeConfig categories
// ============================================================================

/**
 * Helper: credit a wallet with funds and log the immutable transaction.
 */
async function creditWallet(
  ctx: any,
  walletId: any,
  institutionId: any,
  paymentReference: string,
  amount: number,
  reason: string
) {
  const wallet = await ctx.db
    .query("wallets")
    .filter((q: any) => q.eq(q.field("_id"), walletId))
    .first();

  if (!wallet) return;

  await ctx.db.patch(walletId, {
    availableBalance: (wallet.availableBalance || 0) + amount,
    totalCollected: (wallet.totalCollected || 0) + amount,
    transactionCount: (wallet.transactionCount || 0) + 1,
  });

  await ctx.db.insert("walletTransactions", {
    walletId: walletId,
    institutionId: institutionId,
    paymentReference,
    amount,
    direction: "credit",
    reason,
    timestamp: Date.now(),
  });
}

/**
 * Route a completed payment to the 4 designated wallets:
 * 1. Institution wallet (tuition)
 * 2. SUG wallet (sug_dues)
 * 3. Student's Faculty wallet (faculty_dues)
 * 4. Student's Department wallet (department_dues)
 *
 * Uses association slugs to look up the correct wallets.
 * No more allocationRules — amounts come directly from feeConfig categories.
 */
export const routePayment = mutation({
  args: {
    institutionId: v.id("institutions"),
    paymentId: v.id("payments"),
    nombaTransactionId: v.string(),
    feeBreakdown: v.object({
      tuition: v.number(),
      sugDues: v.number(),
      facultyDues: v.number(),
      departmentDues: v.number(),
    }),
    facultySlug: v.string(),
    departmentSlug: v.string(),
    platformFee: v.number(),
  },
  handler: async (ctx, args) => {
    const allocation: Record<string, { amount: number; name: string }> = {};

    // 1. Institution wallet — always exists (created on institution setup)
    const instWallet = await ctx.db
      .query("wallets")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("type"), "institution"),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();

    if (instWallet && args.feeBreakdown.tuition > 0) {
      await creditWallet(
        ctx,
        instWallet._id,
        args.institutionId,
        args.nombaTransactionId,
        args.feeBreakdown.tuition,
        "tuition_received"
      );
      allocation[instWallet.name] = { amount: args.feeBreakdown.tuition, name: instWallet.name };
    }

    // 2. SUG wallet — find by association type "sug"
    if (args.feeBreakdown.sugDues > 0) {
      const sugAssociation = await ctx.db
        .query("associations")
        .filter((q: any) =>
          q.and(
            q.eq(q.field("type"), "sug"),
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
        )
        .first();

      if (sugAssociation) {
        const sugWallet = await ctx.db
          .query("wallets")
          .filter((q: any) =>
            q.eq(q.field("associationId"), sugAssociation._id as any)
          )
          .first();

        if (sugWallet) {
          await creditWallet(
            ctx,
            sugWallet._id,
            args.institutionId,
            args.nombaTransactionId,
            args.feeBreakdown.sugDues,
            "sug_dues_received"
          );
          allocation[sugWallet.name] = { amount: args.feeBreakdown.sugDues, name: sugWallet.name };
        }
      }
    }

    // 3. Faculty wallet — find association by type="faculty" + slug
    if (args.feeBreakdown.facultyDues > 0 && args.facultySlug) {
      const facultyAssociation = await ctx.db
        .query("associations")
        .filter((q: any) =>
          q.and(
            q.eq(q.field("type"), "faculty"),
            q.eq(q.field("slug"), args.facultySlug.toUpperCase()),
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
        )
        .first();

      if (facultyAssociation) {
        const facultyWallet = await ctx.db
          .query("wallets")
          .filter((q: any) =>
            q.and(
              q.eq(q.field("associationId"), facultyAssociation._id as any),
              q.eq(q.field("institutionId"), args.institutionId as any)
            )
          )
          .first();

        if (facultyWallet) {
          await creditWallet(
            ctx,
            facultyWallet._id,
            args.institutionId,
            args.nombaTransactionId,
            args.feeBreakdown.facultyDues,
            "faculty_dues_received"
          );
          allocation[facultyWallet.name] = { amount: args.feeBreakdown.facultyDues, name: facultyWallet.name };
        }
      }
    }

    // 4. Department wallet — find association by type="department" + slug
    if (args.feeBreakdown.departmentDues > 0 && args.departmentSlug) {
      const deptAssociation = await ctx.db
        .query("associations")
        .filter((q: any) =>
          q.and(
            q.eq(q.field("type"), "department"),
            q.eq(q.field("slug"), args.departmentSlug.toUpperCase()),
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
        )
        .first();

      if (deptAssociation) {
        const deptWallet = await ctx.db
          .query("wallets")
          .filter((q: any) =>
            q.and(
              q.eq(q.field("associationId"), deptAssociation._id as any),
              q.eq(q.field("institutionId"), args.institutionId as any)
            )
          )
          .first();

        if (deptWallet) {
          await creditWallet(
            ctx,
            deptWallet._id,
            args.institutionId,
            args.nombaTransactionId,
            args.feeBreakdown.departmentDues,
            "department_dues_received"
          );
          allocation[deptWallet.name] = { amount: args.feeBreakdown.departmentDues, name: deptWallet.name };
        }
      }
    }

    // 5. Platform fee — credit to institution wallet if exists, or just log
    if (args.platformFee > 0 && instWallet) {
      await creditWallet(
        ctx,
        instWallet._id,
        args.institutionId,
        args.nombaTransactionId,
        args.platformFee,
        "platform_fee"
      );
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
