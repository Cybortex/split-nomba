import { v } from "convex/values";
import { query } from "./_generated/server";
import { requirePermission } from "./auth";

// ============================================================================
// GLOBAL STATS (SUPER_ADMIN Only)
// ============================================================================

/**
 * Get global platform statistics (SUPER_ADMIN only).
 * Aggregates data across ALL institutions.
 */
export const getGlobalStats = query({
  handler: async (ctx) => {
    await requirePermission(ctx, "SUPER_ADMIN");

    const [allInstitutions, allUsers, allPayments] = await Promise.all([
      ctx.db.query("institutions").collect(),
      ctx.db.query("users").collect(),
      ctx.db.query("payments").collect(),
    ]);

    const totalPaymentVolume = allPayments.reduce(
      (sum, p) => sum + (p.status === "completed" ? p.amount : 0),
      0
    );

    const totalPlatformFees = allPayments.reduce(
      (sum, p) => sum + (p.status === "completed" ? (p.platformFee || 0) : 0),
      0
    );

    const completedPayments = allPayments.filter(
      (p) => p.status === "completed"
    ).length;

    return {
      institutions: allInstitutions.length,
      users: allUsers.filter((u) => u.isActive).length,
      totalUsers: allUsers.length,
      payments: allPayments.length,
      completedPayments,
      paymentVolume: totalPaymentVolume,
      platformFees: totalPlatformFees,
    };
  },
});

/**
 * Get per-institution summaries (SUPER_ADMIN only).
 * Returns name, user count, payment stats for each institution.
 */
export const getInstitutionSummaries = query({
  handler: async (ctx) => {
    await requirePermission(ctx, "SUPER_ADMIN");

    const [allInstitutions, allUsers, allPayments, allWallets] =
      await Promise.all([
        ctx.db.query("institutions").collect(),
        ctx.db.query("users").collect(),
        ctx.db.query("payments").collect(),
        ctx.db.query("wallets").collect(),
      ]);

    const summaries = [];

    for (const inst of allInstitutions) {
      const instId = inst._id.toString();

      const instUsers = allUsers.filter(
        (u) => u.institutionId?.toString() === instId
      );
      const instPayments = allPayments.filter(
        (p) => p.institutionId?.toString() === instId
      );
      const instWallets = allWallets.filter(
        (w) => w.institutionId?.toString() === instId
      );

      const completedVolume = instPayments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);

      summaries.push({
        _id: inst._id,
        name: inst.name,
        createdAt: inst.createdAt,
        userCount: instUsers.filter((u) => u.isActive).length,
        paymentCount: instPayments.length,
        completedPaymentCount: instPayments.filter(
          (p) => p.status === "completed"
        ).length,
        paymentVolume: completedVolume,
        walletCount: instWallets.length,
        totalCollected: instWallets.reduce(
          (sum, w) => sum + w.totalCollected,
          0
        ),
      });
    }

    return summaries.sort(
      (a, b) => b.paymentVolume - a.paymentVolume
    );
  },
});

/**
 * Get recent global audit logs (SUPER_ADMIN only).
 */
export const getRecentAuditLogs = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "SUPER_ADMIN");

    const logs = await ctx.db
      .query("auditLogs")
      .order("desc")
      .collect();

    return logs.slice(0, args.limit ?? 50);
  },
});
