import { v } from "convex/values";
import { query, mutation, internalMutation, internalQuery } from "./_generated/server";
import { requirePermission } from "./auth";

/**
 * Get wallet by entity ID (institution-scoped RBAC).
 */
export const getByEntityId = query({
  args: { entityId: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "STUDENT", {
      institutionId: args.institutionId as any,
      entityId: args.entityId,
    });

    return await ctx.db
      .query("wallets")
      .filter((q) =>
        q.and(
          q.eq(q.field("entityId"), args.entityId),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();
  },
});

/**
 * List all wallets (FINANCE+ for an institution).
 */
export const listAll = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });
    return await ctx.db
      .query("wallets")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .collect();
  },
});

/**
 * List wallets by type.
 */
export const listByType = query({
  args: { type: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });
    return await ctx.db
      .query("wallets")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), args.type),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .collect();
  },
});

/**
 * Get wallet transactions (immutable ledger).
 */
export const getTransactions = query({
  args: { walletEntityId: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "STUDENT", {
      institutionId: args.institutionId as any,
      entityId: args.walletEntityId,
    });

    const wallet = await ctx.db
      .query("wallets")
      .filter((q) =>
        q.and(
          q.eq(q.field("entityId"), args.walletEntityId),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();

    if (!wallet) return [];

    return await ctx.db
      .query("walletTransactions")
      .filter((q) => q.eq(q.field("walletId"), wallet._id as any))
      .order("desc")
      .collect();
  },
});

/**
 * Get dean view — faculty wallet + departments (DEAN scoped).
 */
export const getDeanView = query({
  args: { entityId: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "DEAN", {
      institutionId: args.institutionId as any,
      entityId: args.entityId,
    });

    const facultyWallet = await ctx.db
      .query("wallets")
      .filter((q) =>
        q.and(
          q.eq(q.field("entityId"), args.entityId),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();

    if (!facultyWallet) return { faculty: null, departments: [] };

    const allWallets = await ctx.db
      .query("wallets")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .collect();

    const departments = allWallets.filter(
      (w) =>
        w.type === "department" && w.entityId.startsWith(args.entityId)
    );

    return { faculty: facultyWallet, departments };
  },
});

/**
 * Get all wallets the current user has access to, with their access level.
 * This replaces the old getStudentView which showed aggregate totals.
 * Each role sees only the wallets they are scoped to.
 */
export const getMyAccessibleWallets = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || !user.institutionId) return [];

    const allWallets = await ctx.db
      .query("wallets")
      .filter((q: any) => q.eq(q.field("institutionId"), user.institutionId as any))
      .collect();

    const allAssociations = await ctx.db
      .query("associations")
      .filter((q: any) => q.eq(q.field("institutionId"), user.institutionId as any))
      .collect();

    const accessible: Array<{
      wallet: any;
      access: "view" | "transact";
      association?: any;
    }> = [];

    for (const wallet of allWallets) {
      const access = await getWalletAccess(ctx, user, wallet, allAssociations);
      if (access) {
        const association = wallet.associationId
          ? allAssociations.find((a: any) => a._id.toString() === (wallet.associationId as any).toString())
          : undefined;
        accessible.push({ wallet, access, association });
      }
    }

    return accessible;
  },
});

/**
 * Determine what access (if any) a user has to a specific wallet.
 */
async function getWalletAccess(
  ctx: any,
  user: any,
  wallet: any,
  allAssociations: any[]
): Promise<"view" | "transact" | null> {
  // SUPER_ADMIN, INSTITUTION_ADMIN, FINANCE: can view and transact all wallets
  if (["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE"].some((r) => user.roles.includes(r))) {
    return "transact";
  }

  // STUDENT_AFFAIRS: view-only on SUG wallet (type="association" linked to a "sug" association)
  if (user.roles.includes("STUDENT_AFFAIRS") && wallet.associationId) {
    const assoc = allAssociations.find(
      (a: any) => a._id.toString() === wallet.associationId.toString()
    );
    if (assoc && assoc.type === "sug") {
      return "view";
    }
  }

  // DEAN: view-only on "faculty" wallet where entityId matches their permissions
  if (user.roles.includes("DEAN") && wallet.type === "faculty") {
    if (user.permissions.includes(wallet.entityId)) {
      return "view";
    }
    // Also check if entityId starts with any of their permissions (faculty prefix)
    if (user.permissions.some((p: string) => wallet.entityId.startsWith(p))) {
      return "view";
    }
  }

  // HOD: view-only on "department" wallet where entityId matches their permissions
  if (user.roles.includes("HOD") && wallet.type === "department") {
    if (user.permissions.includes(wallet.entityId)) {
      return "view";
    }
  }

  // STAFF_ADVISOR or STUDENT_EXCO: check if assigned to this wallet's association
  if (
    (user.roles.includes("STAFF_ADVISOR") || user.roles.includes("STUDENT_EXCO")) &&
    wallet.associationId
  ) {
    const assoc = allAssociations.find(
      (a: any) => a._id.toString() === wallet.associationId.toString()
    );
    if (assoc) {
      const isAdvisor =
        user.roles.includes("STAFF_ADVISOR") &&
        assoc.staffAdvisorClerkId === user.clerkId;
      const isExco =
        user.roles.includes("STUDENT_EXCO") &&
        assoc.studentExcoClerkIds.includes(user.clerkId);

      if (isAdvisor) return "view";
      if (isExco) return "transact";
    }
  }

  return null;
}

/**
 * Get association wallet (STUDENT_EXCO, STAFF_ADVISOR, FINANCE+).
 */
export const getAssociationWallet = query({
  args: { associationId: v.id("associations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const association = await ctx.db
      .query("associations")
      .filter((q) => q.eq(q.field("_id"), args.associationId as any))
      .first();

    if (!association) throw new Error("Association not found");

    // RBAC check
    const hasAccess =
      user.roles.includes("SUPER_ADMIN") ||
      user.roles.includes("INSTITUTION_ADMIN") ||
      user.roles.includes("FINANCE") ||
      user.roles.includes("STUDENT_AFFAIRS") ||
      (user.roles.includes("STAFF_ADVISOR") &&
        association.staffAdvisorClerkId === user.clerkId) ||
      (user.roles.includes("STUDENT_EXCO") &&
        association.studentExcoClerkIds.includes(user.clerkId));

    if (!hasAccess) {
      throw new Error("You don't have access to this association wallet");
    }

    return await ctx.db
      .query("wallets")
      .filter((q) =>
        q.and(
          q.eq(q.field("associationId"), args.associationId as any),
          q.eq(q.field("institutionId"), user.institutionId as any)
        )
      )
      .first();
  },
});

/**
 * Create wallet (internal, used by import and routing).
 */
export const createWallet = internalMutation({
  args: {
    institutionId: v.id("institutions"),
    type: v.string(),
    entityId: v.string(),
    name: v.string(),
    totalCollected: v.number(),
    availableBalance: v.number(),
    transactionCount: v.number(),
    associationId: v.optional(v.id("associations")),
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountName: v.optional(v.string()),
    accountRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("wallets", {
      institutionId: args.institutionId,
      type: args.type as "faculty" | "department" | "association" | "institution",
      entityId: args.entityId,
      name: args.name,
      associationId: args.associationId,
      totalCollected: args.totalCollected,
      availableBalance: args.availableBalance,
      minimumBalance: 0,
      transactionCount: args.transactionCount,
      bankName: args.bankName,
      accountNumber: args.accountNumber,
      accountName: args.accountName,
      accountRef: args.accountRef,
    });
  },
});

/**
 * Get wallet by entityId (internal, no RBAC).
 */
export const getByEntityIdInternal = internalQuery({
  args: { entityId: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .filter((q) =>
        q.and(
          q.eq(q.field("entityId"), args.entityId),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();
  },
});

/**
 * Credit a wallet directly (used for direct bank transfer simulation and webhooks).
 */
export const creditWalletDirectly = mutation({
  args: {
    walletId: v.id("wallets"),
    amount: v.number(),
    paymentReference: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const wallet = await ctx.db.get(args.walletId);
    if (!wallet) throw new Error("Wallet not found");

    await ctx.db.patch(args.walletId, {
      availableBalance: (wallet.availableBalance || 0) + args.amount,
      totalCollected: (wallet.totalCollected || 0) + args.amount,
      transactionCount: (wallet.transactionCount || 0) + 1,
    });

    await ctx.db.insert("walletTransactions", {
      walletId: args.walletId,
      institutionId: wallet.institutionId,
      paymentReference: args.paymentReference,
      amount: args.amount,
      direction: "credit",
      reason: args.reason,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get wallet by virtual account number.
 */
export const getWalletByAccountNumber = query({
  args: { accountNumber: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("wallets")
      .filter((q) => q.eq(q.field("accountNumber"), args.accountNumber))
      .first();
  },
});
