import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requirePermission, ROLE_HIERARCHY, ALL_ROLES } from "./auth";

/**
 * Set user roles (INSTITUTION_ADMIN+).
 * Replaces all roles at once.
 */
export const setUserRoles = mutation({
  args: {
    userId: v.id("users"),
    roles: v.array(v.string()),
    permissions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requirePermission(ctx, "INSTITUTION_ADMIN");

    const target = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("_id"), args.userId as any))
      .first();

    if (!target) throw new Error("User not found");

    if (
      !admin.roles.includes("SUPER_ADMIN") &&
      admin.institutionId?.toString() !== target.institutionId?.toString()
    ) {
      throw new Error("Cannot modify users outside your institution");
    }

    // Validate all roles
    for (const role of args.roles) {
      if (!ALL_ROLES.includes(role)) {
        throw new Error(`Invalid role: ${role}`);
      }
    }

    // INSTITUTION_ADMIN restrictions
    if (!admin.roles.includes("SUPER_ADMIN")) {
      if (
        args.roles.includes("SUPER_ADMIN") ||
        args.roles.includes("INSTITUTION_ADMIN")
      ) {
        throw new Error("Cannot assign SUPER_ADMIN or INSTITUTION_ADMIN roles");
      }
    }

    const oldRoles = target.roles;

    await ctx.db.patch(args.userId, {
      roles: args.roles,
      activeRole: args.roles[0] || target.activeRole,
      permissions: args.permissions,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: target.institutionId as any,
      userId: admin.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: args.userId,
      oldValue: JSON.stringify({ roles: oldRoles }),
      newValue: JSON.stringify({ roles: args.roles, permissions: args.permissions }),
      timestamp: Date.now(),
      success: true,
    });

    return target;
  },
});

/**
 * List users — SUPER_ADMIN sees all, INSTITUTION_ADMIN sees their institution.
 */
export const listUsers = query({
  args: { institutionId: v.optional(v.id("institutions")) },
  handler: async (ctx, args) => {
    const admin = await requirePermission(ctx, "INSTITUTION_ADMIN");

    if (admin.roles.includes("SUPER_ADMIN")) {
      if (args.institutionId) {
        return await ctx.db
          .query("users")
          .filter((q) =>
            q.eq(q.field("institutionId"), args.institutionId as any)
          )
          .collect();
      }
      return await ctx.db.query("users").collect();
    }

    return await ctx.db
      .query("users")
      .filter((q) =>
        q.eq(q.field("institutionId"), admin.institutionId as any)
      )
      .collect();
  },
});

/**
 * Get current user with their role info and institution details.
 */
export const getMyProfile = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || !user.isActive) return null;

    let institutionName = null;
    if (user.institutionId) {
      const inst = await ctx.db
        .query("institutions")
        .filter((q) => q.eq(q.field("_id"), user.institutionId as any))
        .first();
      institutionName = inst?.name ?? null;
    }

    return {
      _id: user._id,
      clerkId: user.clerkId,
      email: identity.email ?? user.email,
      name: identity.name ?? user.email,
      roles: user.roles,
      activeRole: user.activeRole || user.roles[0],
      institutionId: user.institutionId,
      institutionName,
      permissions: user.permissions,
      isActive: user.isActive,
    };
  },
});

/**
 * Get user by their Clerk ID.
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();
  },
});
