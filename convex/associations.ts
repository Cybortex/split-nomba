import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./auth";

/**
 * Create an association (STUDENT_AFFAIRS only).
 * Associations represent official student groups at faculty or department level.
 */
export const createAssociation = mutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.string(),
    slug: v.string(),
    type: v.union(v.literal("sug"), v.literal("faculty"), v.literal("department")),
    facultyId: v.optional(v.string()),
    departmentId: v.optional(v.string()),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "STUDENT_AFFAIRS", {
      institutionId: args.institutionId as any,
    });

    if (!args.slug.trim()) {
      throw new Error("Association slug is required");
    }

    // Check for duplicate slug within type
    const existing = await ctx.db
      .query("associations")
      .filter((q) =>
        q.and(
          q.eq(q.field("slug"), args.slug.trim().toUpperCase()),
          q.eq(q.field("type"), args.type),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();

    if (existing) {
      throw new Error(`Association with slug "${args.slug}" and type "${args.type}" already exists`);
    }

    // Auto-generate entityId from slug if not provided
    const entityId = args.entityId || `${args.type}-${args.slug.trim().toUpperCase()}`;

    const associationId = await ctx.db.insert("associations", {
      institutionId: args.institutionId,
      name: args.name,
      slug: args.slug.trim().toUpperCase(),
      type: args.type,
      facultyId: args.facultyId,
      departmentId: args.departmentId,
      entityId,
      staffAdvisorClerkId: undefined,
      studentExcoClerkIds: [],
      isActive: true,
      createdAt: Date.now(),
    });

    // Determine wallet type based on association type
    const walletType = args.type === "sug" ? "association" : args.type === "faculty" ? "faculty" : "department";

    // Also create the wallet for this association
    const walletId = await ctx.db.insert("wallets", {
      institutionId: args.institutionId,
      type: walletType as any,
      entityId,
      name: args.name,
      associationId,
      totalCollected: 0,
      availableBalance: 0,
      minimumBalance: 0,
      transactionCount: 0,
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "ASSOCIATION_CREATED",
      entity: "associations",
      entityId: associationId,
      newValue: JSON.stringify({
        name: args.name,
        slug: args.slug,
        type: args.type,
        entityId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { associationId, walletId };
  },
});

/**
 * Create the SUG association for an institution (STUDENT_AFFAIRS or INSTITUTION_ADMIN).
 * There should be exactly one SUG per institution.
 */
export const createSUG = mutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "STUDENT_AFFAIRS", {
      institutionId: args.institutionId as any,
    });

    // Check if SUG already exists
    const existing = await ctx.db
      .query("associations")
      .filter((q) =>
        q.and(
          q.eq(q.field("type"), "sug"),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();

    if (existing) {
      throw new Error("SUG association already exists for this institution");
    }

    const sugName = args.name || "Student Union Government";
    const slug = "SUG";
    const entityId = `sug-${slug}`;

    const associationId = await ctx.db.insert("associations", {
      institutionId: args.institutionId,
      name: sugName,
      slug,
      type: "sug",
      entityId,
      staffAdvisorClerkId: undefined,
      studentExcoClerkIds: [],
      isActive: true,
      createdAt: Date.now(),
    });

    // Create SUG wallet
    const walletId = await ctx.db.insert("wallets", {
      institutionId: args.institutionId,
      type: "association",
      entityId,
      name: sugName,
      associationId,
      totalCollected: 0,
      availableBalance: 0,
      minimumBalance: 0,
      transactionCount: 0,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "ASSOCIATION_CREATED",
      entity: "associations",
      entityId: associationId,
      newValue: JSON.stringify({
        name: sugName,
        slug: "SUG",
        type: "sug",
        entityId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { associationId, walletId };
  },
});

/**
 * Assign a Staff Advisor to an association (STUDENT_AFFAIRS or DEAN).
 */
export const assignStaffAdvisor = mutation({
  args: {
    associationId: v.id("associations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db
      .query("associations")
      .filter((q) => q.eq(q.field("_id"), args.associationId as any))
      .first();

    if (!association) throw new Error("Association not found");

    const user = await requirePermission(ctx, "STUDENT_AFFAIRS", {
      institutionId: association.institutionId as any,
    });

    // Verify the staff advisor user exists
    const advisorUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!advisorUser) throw new Error("Staff Advisor user not found in system");
    if (!advisorUser.roles.includes("STAFF_ADVISOR")) {
      throw new Error("User is not a STAFF_ADVISOR");
    }

    // Update the advisor's permissions to include this association
    await ctx.db.patch(advisorUser._id, {
      permissions: [...new Set([...advisorUser.permissions, association.entityId])],
    });

    // Update the association
    await ctx.db.patch(args.associationId, {
      staffAdvisorClerkId: args.clerkId,
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: association.institutionId,
      userId: user.clerkId,
      action: "ASSOCIATION_ASSIGNED",
      entity: "associations",
      entityId: args.associationId,
      newValue: JSON.stringify({
        staffAdvisorClerkId: args.clerkId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { assigned: true };
  },
});

/**
 * Assign a Student Exco to an association (STUDENT_AFFAIRS or DEAN).
 */
export const assignStudentExco = mutation({
  args: {
    associationId: v.id("associations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db
      .query("associations")
      .filter((q) => q.eq(q.field("_id"), args.associationId as any))
      .first();

    if (!association) throw new Error("Association not found");

    const user = await requirePermission(ctx, "STUDENT_AFFAIRS", {
      institutionId: association.institutionId as any,
    });

    // Verify user exists with role STUDENT_EXCO
    const excoUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!excoUser) throw new Error("Student Exco user not found in system");
    if (!excoUser.roles.includes("STUDENT_EXCO")) {
      throw new Error("User is not a STUDENT_EXCO");
    }

    // Update the exco's permissions
    await ctx.db.patch(excoUser._id, {
      permissions: [...new Set([...excoUser.permissions, association.entityId])],
    });

    // Update the association
    await ctx.db.patch(args.associationId, {
      studentExcoClerkIds: [...new Set([...association.studentExcoClerkIds, args.clerkId])],
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: association.institutionId,
      userId: user.clerkId,
      action: "ASSOCIATION_ASSIGNED",
      entity: "associations",
      entityId: args.associationId,
      newValue: JSON.stringify({
        assignedStudentExco: args.clerkId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { assigned: true };
  },
});

/**
 * Remove a Student Exco from an association (STUDENT_AFFAIRS).
 */
export const removeStudentExco = mutation({
  args: {
    associationId: v.id("associations"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const association = await ctx.db
      .query("associations")
      .filter((q) => q.eq(q.field("_id"), args.associationId as any))
      .first();

    if (!association) throw new Error("Association not found");

    const user = await requirePermission(ctx, "STUDENT_AFFAIRS", {
      institutionId: association.institutionId as any,
    });

    await ctx.db.patch(args.associationId, {
      studentExcoClerkIds: association.studentExcoClerkIds.filter(
        (id) => id !== args.clerkId
      ),
    });

    // Remove permission from the user
    const excoUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (excoUser) {
      await ctx.db.patch(excoUser._id, {
        permissions: excoUser.permissions.filter((p) => p !== association.entityId),
      });
    }

    await ctx.db.insert("auditLogs", {
      institutionId: association.institutionId,
      userId: user.clerkId,
      action: "ASSOCIATION_ASSIGNED",
      entity: "associations",
      entityId: args.associationId,
      newValue: JSON.stringify({ removedStudentExco: args.clerkId }),
      timestamp: Date.now(),
      success: true,
    });
  },
});

/**
 * List associations for an institution (STUDENT_AFFAIRS+).
 */
export const listAssociations = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "STUDENT_AFFAIRS", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("associations")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .collect();
  },
});

/**
 * Get an association by entityId (STUDENT_EXCO+ or assigned staff).
 */
export const getAssociationByEntityId = query({
  args: { entityId: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    // Allow broader access for association members
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user) throw new Error("User not found");

    const association = await ctx.db
      .query("associations")
      .filter((q) =>
        q.and(
          q.eq(q.field("entityId"), args.entityId),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();

    if (!association) return null;

    // Only return if user has permission
    if (
      user.roles.includes("SUPER_ADMIN") ||
      user.roles.includes("INSTITUTION_ADMIN") ||
      user.roles.includes("FINANCE") ||
      user.roles.includes("STUDENT_AFFAIRS") ||
      user.roles.includes("DEAN") ||
      (user.roles.includes("STAFF_ADVISOR") &&
        association.staffAdvisorClerkId === user.clerkId) ||
      (user.roles.includes("STUDENT_EXCO") &&
        association.studentExcoClerkIds.includes(user.clerkId))
    ) {
      return association;
    }

    return null;
  },
});
