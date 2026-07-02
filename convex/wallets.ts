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
 * Get student view — aggregate totals, no RBAC but institution-scoped.
 */
export const getStudentView = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    // Student view is public within an institution
    const allWallets = await ctx.db
      .query("wallets")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .collect();

    const totalCollected = allWallets.reduce(
      (sum, w) => sum + w.totalCollected,
      0
    );
    const totalTransactions = allWallets.reduce(
      (sum, w) => sum + w.transactionCount,
      0
    );

    return {
      totalCollected,
      totalTransactions,
      walletCount: allWallets.length,
    };
  },
});

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
