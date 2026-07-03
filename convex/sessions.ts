import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requirePermission } from "./auth";

/**
 * Get all sessions for an institution (INSTITUTION_ADMIN+).
 */
export const listSessions = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("academicSessions")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .order("desc")
      .collect();
  },
});

/**
 * Get the active session for an institution (STUDENT+).
 */
export const getActiveSession = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "STUDENT", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("academicSessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();
  },
});

/**
 * Create a new academic session (INSTITUTION_ADMIN+).
 * If `isActive` is true, deactivates any current active session first.
 */
export const createSession = mutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    if (!args.name.trim()) {
      throw new Error("Session name is required");
    }
    if (args.startDate >= args.endDate) {
      throw new Error("End date must be after start date");
    }

    // Check for duplicate name
    const existing = await ctx.db
      .query("academicSessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("name"), args.name.trim())
        )
      )
      .first();

    if (existing) {
      throw new Error(`Session "${args.name.trim()}" already exists`);
    }

    // If activating, deactivate current active session
    if (args.isActive) {
      const currentActive = await ctx.db
        .query("academicSessions")
        .filter((q) =>
          q.and(
            q.eq(q.field("institutionId"), args.institutionId as any),
            q.eq(q.field("isActive"), true)
          )
        )
        .first();

      if (currentActive) {
        await ctx.db.patch(currentActive._id, { isActive: false });
      }
    }

    const sessionId = await ctx.db.insert("academicSessions", {
      institutionId: args.institutionId,
      name: args.name.trim(),
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: args.isActive,
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: args.isActive ? "SESSION_CREATED" : "SESSION_CREATED",
      entity: "academicSessions",
      entityId: sessionId,
      newValue: JSON.stringify({
        name: args.name.trim(),
        startDate: args.startDate,
        endDate: args.endDate,
        isActive: args.isActive,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { sessionId, name: args.name.trim(), isActive: args.isActive };
  },
});

/**
 * Activate a session (INSTITUTION_ADMIN+).
 * Deactivates any current active session, then activates the specified one.
 */
export const activateSession = mutation({
  args: {
    institutionId: v.id("institutions"),
    sessionId: v.id("academicSessions"),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    const session = await ctx.db
      .query("academicSessions")
      .filter((q) => q.eq(q.field("_id"), args.sessionId as any))
      .first();

    if (!session) throw new Error("Session not found");
    if (session.isActive) throw new Error("Session is already active");

    // Deactivate any currently active session
    const currentActive = await ctx.db
      .query("academicSessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    if (currentActive) {
      await ctx.db.patch(currentActive._id, { isActive: false });
    }

    // Activate the requested session
    await ctx.db.patch(args.sessionId, { isActive: true });

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "SESSION_ACTIVATED",
      entity: "academicSessions",
      entityId: args.sessionId,
      oldValue: currentActive
        ? JSON.stringify({ wasActive: currentActive.name })
        : undefined,
      newValue: JSON.stringify({ nowActive: session.name }),
      timestamp: Date.now(),
      success: true,
    });

    return { activated: session.name };
  },
});
