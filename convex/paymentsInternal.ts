import { v } from "convex/values";
import { mutation, internalMutation, internalQuery } from "./_generated/server";

// ============================================================================
// STUDENT VALIDATION (Internal)
// ============================================================================

export const validateStudent = internalQuery({
  args: { matric: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentRecords")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("matric"), args.matric),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();
  },
});

export const getByMatricAndStatus = internalQuery({
  args: { matric: v.string(), status: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q: any) =>
        q.and(
          q.eq(q.field("studentMatric"), args.matric),
          q.eq(q.field("status"), args.status),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();
  },
});

export const getByReference = internalQuery({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("payments")
      .filter((q: any) => q.eq(q.field("reference"), args.reference))
      .first();
  },
});

// ============================================================================
// ALLOCATION RULES (Internal)
// ============================================================================

export const getRulesForInstitution = internalQuery({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("allocationRules")
      .filter((q: any) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .order("asc")
      .collect();
  },
});

// ============================================================================
// CREATE PAYMENT (Internal)
// ============================================================================

export const createPayment = internalMutation({
  args: {
    institutionId: v.id("institutions"),
    nombaTransactionId: v.string(),
    reference: v.string(),
    studentMatric: v.string(),
    faculty: v.string(),
    department: v.string(),
    level: v.number(),
    amount: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("payments", {
      institutionId: args.institutionId,
      nombaTransactionId: args.nombaTransactionId,
      reference: args.reference,
      studentMatric: args.studentMatric,
      faculty: args.faculty,
      department: args.department,
      level: args.level,
      amount: args.amount,
      status: args.status as "pending" | "completed" | "failed" | "cancelled",
      createdAt: Date.now(),
    });
  },
});

// ============================================================================
// AUDIT LOGGING (Internal)
// ============================================================================

export const logAudit = mutation({
  args: {
    institutionId: v.optional(v.id("institutions")),
    action: v.string(),
    entityId: v.string(),
    newValue: v.any(),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    return await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: identity?.subject ?? "SYSTEM",
      action: args.action as any,
      entity: "payments",
      entityId: args.entityId,
      oldValue: undefined,
      newValue: JSON.stringify(args.newValue),
      timestamp: Date.now(),
      success: args.success,
    });
  },
});
