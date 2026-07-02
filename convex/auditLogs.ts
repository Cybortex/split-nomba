import { v } from "convex/values";
import { query } from "./_generated/server";
import { requirePermission } from "./auth";

/**
 * Get audit logs by user (SUPER_ADMIN or INSTITUTION_ADMIN).
 */
export const getByUser = query({
  args: { userId: v.string(), institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    if (args.institutionId) {
      return await ctx.db
        .query("auditLogs")
        .filter((q) =>
          q.and(
            q.eq(q.field("userId"), args.userId),
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("auditLogs")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Get audit logs by action type.
 */
export const getByAction = query({
  args: { action: v.string(), institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "SUPER_ADMIN");

    if (args.institutionId) {
      return await ctx.db
        .query("auditLogs")
        .filter((q) =>
          q.and(
            q.eq(q.field("action"), args.action),
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
        )
        .order("desc")
        .collect();
    }

    return await ctx.db
      .query("auditLogs")
      .filter((q) => q.eq(q.field("action"), args.action))
      .order("desc")
      .collect();
  },
});

/**
 * Get all audit logs (SUPER_ADMIN) or scoped by institution (INSTITUTION_ADMIN).
 */
export const getAll = query({
  args: { institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    if (args.institutionId) {
      return await ctx.db
        .query("auditLogs")
        .filter((q) =>
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
        .order("desc")
        .collect();
    }

    return await ctx.db.query("auditLogs").order("desc").collect();
  },
});

/**
 * Get recent audit logs.
 */
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
    institutionId: v.optional(v.id("institutions")),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    let logs;
    if (args.institutionId) {
      logs = await ctx.db
        .query("auditLogs")
        .filter((q) =>
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
        .order("desc")
        .collect();
    } else {
      logs = await ctx.db.query("auditLogs").order("desc").collect();
    }

    return logs.slice(0, args.limit ?? 50);
  },
});
