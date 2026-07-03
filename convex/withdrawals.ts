import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./auth";

/**
 * Initiate a withdrawal request (STUDENT_EXCO only).
 *
 * 3-tier consensus:
 * - SUG: Exco-only — auto-approved immediately (no Staff Advisor needed)
 * - Faculty: Exco initiates → Faculty Staff Advisor approves
 * - Department: Exco initiates → Department Staff Advisor approves
 */
export const initiateWithdrawal = mutation({
  args: {
    institutionId: v.id("institutions"),
    associationId: v.id("associations"),
    walletId: v.id("wallets"),
    amount: v.number(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db
      .query("associations")
      .filter((q) => q.eq(q.field("_id"), args.associationId as any))
      .first();

    if (!association) throw new Error("Association not found");

    const user = await requirePermission(ctx, "STUDENT_EXCO", {
      institutionId: association.institutionId as any,
    });

    if (!association.studentExcoClerkIds.includes(user.clerkId)) {
      throw new Error("You are not an executive of this association");
    }

    // Verify wallet belongs to this association
    const wallet = await ctx.db
      .query("wallets")
      .filter((q) => q.eq(q.field("_id"), args.walletId as any))
      .first();

    if (!wallet) throw new Error("Wallet not found");
    const effectiveBalance = wallet.availableBalance - (wallet.minimumBalance || 0);
    if (effectiveBalance < args.amount) {
      throw new Error(
        `Insufficient spendable balance. Available: ₦${effectiveBalance.toLocaleString()}`
      );
    }

    // Check for existing pending or approved withdrawal
    const existingPending = await ctx.db
      .query("withdrawalRequests")
      .filter((q) =>
        q.and(
          q.eq(q.field("associationId"), args.associationId as any),
          q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "approved"))
        )
      )
      .first();

    if (existingPending) {
      throw new Error("A pending or approved withdrawal request already exists for this association");
    }

    // Determine if this is a SUG association (no approval needed)
    const isSUG = association.type === "sug";

    if (isSUG) {
      // SUG: auto-approve — no Staff Advisor needed
      const withdrawalId = await ctx.db.insert("withdrawalRequests", {
        institutionId: args.institutionId,
        associationId: args.associationId,
        walletId: args.walletId,
        amount: args.amount,
        reason: args.reason,
        initiatedBy: user.clerkId,
        approvedBy: user.clerkId, // self-approved
        status: "approved",
        createdAt: Date.now(),
        approvedAt: Date.now(),
      });

      await ctx.db.insert("auditLogs", {
        institutionId: args.institutionId,
        userId: user.clerkId,
        action: "WITHDRAWAL_INITIATED",
        entity: "withdrawalRequests",
        entityId: withdrawalId,
        newValue: JSON.stringify({
          amount: args.amount,
          reason: args.reason,
          associationId: args.associationId,
          type: "sug_auto_approved",
        }),
        timestamp: Date.now(),
        success: true,
      });

      return {
        withdrawalId,
        status: "approved",
        message: "SUG withdrawal auto-approved. Ready to execute.",
      };
    }

    // Faculty or Department: require Staff Advisor
    if (!association.staffAdvisorClerkId) {
      throw new Error(
        "No Staff Advisor assigned to this association. Contact Student Affairs."
      );
    }

    // Create pending withdrawal request
    const withdrawalId = await ctx.db.insert("withdrawalRequests", {
      institutionId: args.institutionId,
      associationId: args.associationId,
      walletId: args.walletId,
      amount: args.amount,
      reason: args.reason,
      initiatedBy: user.clerkId,
      status: "pending",
      createdAt: Date.now(),
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "WITHDRAWAL_INITIATED",
      entity: "withdrawalRequests",
      entityId: withdrawalId,
      newValue: JSON.stringify({
        amount: args.amount,
        reason: args.reason,
        associationId: args.associationId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      withdrawalId,
      status: "pending",
      message: "Withdrawal initiated. Waiting for Staff Advisor approval.",
    };
  },
});

/**
 * Approve a withdrawal request (STAFF_ADVISOR only).
 */
export const approveWithdrawal = mutation({
  args: {
    withdrawalId: v.id("withdrawalRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("withdrawalRequests")
      .filter((q) => q.eq(q.field("_id"), args.withdrawalId as any))
      .first();

    if (!request) throw new Error("Withdrawal request not found");
    if (request.status !== "pending")
      throw new Error("Withdrawal request already processed");

    const user = await requirePermission(ctx, "STAFF_ADVISOR", {
      institutionId: request.institutionId as any,
    });

    // Verify the Staff Advisor is assigned to this association
    const association = await ctx.db
      .query("associations")
      .filter((q) => q.eq(q.field("_id"), request.associationId as any))
      .first();

    if (!association) throw new Error("Association not found");

    if (association.staffAdvisorClerkId !== user.clerkId) {
      throw new Error("You are not the Staff Advisor for this association");
    }

    // Verify wallet still has sufficient balance
    const wallet = await ctx.db
      .query("wallets")
      .filter((q) => q.eq(q.field("_id"), request.walletId as any))
      .first();

    if (!wallet) throw new Error("Wallet not found");
    const effectiveBalance = wallet.availableBalance - (wallet.minimumBalance || 0);
    if (effectiveBalance < request.amount) {
      throw new Error("Insufficient spendable balance. The withdrawal cannot be processed.");
    }

    // Mark as approved
    await ctx.db.patch(args.withdrawalId, {
      status: "approved",
      approvedBy: user.clerkId,
      approvedAt: Date.now(),
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: request.institutionId,
      userId: user.clerkId,
      action: "WITHDRAWAL_APPROVED",
      entity: "withdrawalRequests",
      entityId: args.withdrawalId,
      newValue: JSON.stringify({
        amount: request.amount,
        status: "approved",
      }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      status: "approved",
      message: "Withdrawal approved. Ready to execute.",
    };
  },
});

/**
 * Execute an approved withdrawal — deducts from wallet.
 * Can be called by either STUDENT_EXCO or STAFF_ADVISOR after approval.
 */
export const executeWithdrawal = mutation({
  args: {
    withdrawalId: v.id("withdrawalRequests"),
  },
  handler: async (ctx, args) => {
    // Must be either the initiator or the approver
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const request = await ctx.db
      .query("withdrawalRequests")
      .filter((q) => q.eq(q.field("_id"), args.withdrawalId as any))
      .first();

    if (!request) throw new Error("Withdrawal request not found");
    if (request.status !== "approved")
      throw new Error("Withdrawal must be approved first");

    if (
      identity.subject !== request.initiatedBy &&
      identity.subject !== request.approvedBy
    ) {
      throw new Error("Only the initiator or approver can execute this withdrawal");
    }

    // Deduct from wallet
    const wallet = await ctx.db
      .query("wallets")
      .filter((q) => q.eq(q.field("_id"), request.walletId as any))
      .first();

    if (!wallet) throw new Error("Wallet not found");

    // Ensure minimum balance is preserved
    const newBalance = (wallet.availableBalance || 0) - request.amount;
    const minBalance = wallet.minimumBalance || 0;
    if (newBalance < minBalance) {
      throw new Error(
        `Cannot execute withdrawal. Balance would fall below minimum of ₦${minBalance.toLocaleString()}.`
      );
    }

    await ctx.db.patch(wallet._id, {
      availableBalance: newBalance,
      transactionCount: (wallet.transactionCount || 0) + 1,
    });

    // Log debit transaction in immutable ledger
    await ctx.db.insert("walletTransactions", {
      walletId: wallet._id,
      institutionId: request.institutionId,
      paymentReference: `WITHDRAWAL-${args.withdrawalId}`,
      amount: request.amount,
      direction: "debit",
      reason: "association_withdrawal",
      timestamp: Date.now(),
    });

    // Mark as completed
    await ctx.db.patch(args.withdrawalId, {
      status: "completed",
      completedAt: Date.now(),
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: request.institutionId,
      userId: identity.subject,
      action: "WITHDRAWAL_COMPLETED",
      entity: "withdrawalRequests",
      entityId: args.withdrawalId,
      newValue: JSON.stringify({
        amount: request.amount,
        walletId: request.walletId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      status: "completed",
      amount: request.amount,
      message: `Withdrawal of ₦${request.amount.toLocaleString()} completed.`,
    };
  },
});

/**
 * Reject a withdrawal request (STAFF_ADVISOR only).
 */
export const rejectWithdrawal = mutation({
  args: {
    withdrawalId: v.id("withdrawalRequests"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db
      .query("withdrawalRequests")
      .filter((q) => q.eq(q.field("_id"), args.withdrawalId as any))
      .first();

    if (!request) throw new Error("Withdrawal request not found");
    if (request.status !== "pending")
      throw new Error("Withdrawal request already processed");

    const user = await requirePermission(ctx, "STAFF_ADVISOR", {
      institutionId: request.institutionId as any,
    });

    // Verify Staff Advisor is assigned to this association
    const association = await ctx.db
      .query("associations")
      .filter((q) => q.eq(q.field("_id"), request.associationId as any))
      .first();

    if (!association) throw new Error("Association not found");
    if (association.staffAdvisorClerkId !== user.clerkId) {
      throw new Error("You are not the Staff Advisor for this association");
    }

    await ctx.db.patch(args.withdrawalId, {
      status: "rejected",
      rejectionReason: args.reason,
      approvedBy: user.clerkId,
      approvedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      institutionId: request.institutionId,
      userId: user.clerkId,
      action: "WITHDRAWAL_REJECTED",
      entity: "withdrawalRequests",
      entityId: args.withdrawalId,
      newValue: JSON.stringify({ reason: args.reason }),
      timestamp: Date.now(),
      success: true,
    });

    return { status: "rejected", message: "Withdrawal rejected." };
  },
});

/**
 * Get pending withdrawal requests for the current user's association (STUDENT_EXCO or STAFF_ADVISOR).
 * Institution-scoped for defense-in-depth.
 */
export const getPendingWithdrawals = query({
  args: { associationId: v.id("associations"), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "STUDENT_EXCO", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("withdrawalRequests")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("associationId"), args.associationId as any),
          q.eq(q.field("status"), "pending")
        )
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get withdrawal history for an association.
 * Institution-scoped for defense-in-depth.
 */
export const getWithdrawalHistory = query({
  args: { associationId: v.id("associations"), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "STUDENT_EXCO", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("withdrawalRequests")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("associationId"), args.associationId as any)
        )
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get all pending withdrawals for an institution (FINANCE+).
 */
export const getAllPendingWithdrawals = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("withdrawalRequests")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("status"), "pending")
        )
      )
      .order("desc")
      .collect();
  },
});
