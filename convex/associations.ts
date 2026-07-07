import { v } from "convex/values";
import { mutation, query, action, internalMutation } from "./_generated/server";
import { requirePermission } from "./auth";
import { api as anyApi, internal as anyInternal } from "./_generated/api";
const api = anyApi as any;
const internal = anyInternal as any;

/**
 * Internal mutation: Create an association and its wallet.
 */
export const createAssociationInternal = internalMutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.string(),
    slug: v.string(),
    type: v.union(v.literal("sug"), v.literal("faculty"), v.literal("department")),
    facultyId: v.optional(v.string()),
    departmentId: v.optional(v.string()),
    entityId: v.optional(v.string()),
    bankName: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    accountRef: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
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

    // Create the wallet for this association
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
      bankName: args.bankName,
      accountNumber: args.accountNumber,
      accountName: args.accountName,
      accountRef: args.accountRef,
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: args.clerkId,
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
 * Create an association (STUDENT_AFFAIRS only) - now a Convex action.
 * Generates a real-time Nomba Dedicated Virtual Account.
 */
export const createAssociation = action({
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
    // 1. Verify permission
    const user = await ctx.runQuery(api.auth.checkActionPermission, {
      requiredRole: "STUDENT_AFFAIRS",
      scope: { institutionId: args.institutionId.toString() },
    });

    // 2. Generate Nomba Virtual Account details
    const accountRef = `REF-VA-${args.type.toUpperCase()}-${args.slug.substring(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
    let vaDetails: any = null;
    try {
      vaDetails = await ctx.runAction(api.nomba.createVirtualAccount, {
        accountRef,
        accountName: args.name.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 40),
      });
    } catch (err: any) {
      console.error("Failed to generate Nomba Dedicated Virtual Account:", err.message || err);
      throw new Error(`Association creation failed: Dedicated Virtual Account setup failed. ${err.message || err}`);
    }

    // 3. Call internal mutation to save the association and wallet
    const result = await ctx.runMutation(internal.associations.createAssociationInternal, {
      institutionId: args.institutionId,
      name: args.name,
      slug: args.slug,
      type: args.type,
      facultyId: args.facultyId,
      departmentId: args.departmentId,
      entityId: args.entityId,
      bankName: vaDetails.bankName,
      accountNumber: vaDetails.bankAccountNumber,
      accountName: vaDetails.bankAccountName,
      accountRef: accountRef,
      clerkId: user.clerkId,
    });

    return result;
  },
});

/**
 * Internal mutation: Create the SUG association.
 */
export const createSUGInternal = internalMutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.optional(v.string()),
    bankName: v.string(),
    accountNumber: v.string(),
    accountName: v.string(),
    accountRef: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
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
      bankName: args.bankName,
      accountNumber: args.accountNumber,
      accountName: args.accountName,
      accountRef: args.accountRef,
    });

    // Log audit
    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: args.clerkId,
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
 * Create the SUG association (STUDENT_AFFAIRS only) - now a Convex action.
 * Generates a real-time Nomba Dedicated Virtual Account.
 */
export const createSUG = action({
  args: {
    institutionId: v.id("institutions"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Verify permission
    const user = await ctx.runQuery(api.auth.checkActionPermission, {
      requiredRole: "STUDENT_AFFAIRS",
      scope: { institutionId: args.institutionId.toString() },
    });

    const sugName = args.name || "Student Union Government";

    // 2. Generate Nomba Virtual Account details
    const accountRef = `REF-VA-SUG-SUG-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;
    let vaDetails: any = null;
    try {
      vaDetails = await ctx.runAction(api.nomba.createVirtualAccount, {
        accountRef,
        accountName: sugName.replace(/[^a-zA-Z0-9\s]/g, "").slice(0, 40),
      });
    } catch (err: any) {
      console.error("Failed to generate Nomba Dedicated Virtual Account:", err.message || err);
      throw new Error(`SUG creation failed: Dedicated Virtual Account setup failed. ${err.message || err}`);
    }

    // 3. Call internal mutation to save records
    const result = await ctx.runMutation(internal.associations.createSUGInternal, {
      institutionId: args.institutionId,
      name: sugName,
      bankName: vaDetails.bankName,
      accountNumber: vaDetails.bankAccountNumber,
      accountName: vaDetails.bankAccountName,
      accountRef: accountRef,
      clerkId: user.clerkId,
    });

    return result;
  },
});

/**
 * Assign a Staff Advisor to an association (STUDENT_AFFAIRS, DEAN, HOD).
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

    // Authorize caller: STUDENT_AFFAIRS, or DEAN for their faculty, or HOD for their department
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    let isAuthorized = false;
    if (user.roles.includes("STUDENT_AFFAIRS")) {
      isAuthorized = true;
    } else if (user.roles.includes("DEAN") && association.type === "faculty") {
      if (association.facultyId && user.facultyId && association.facultyId === user.facultyId.toString()) {
        isAuthorized = true;
      }
    } else if (user.roles.includes("HOD") && association.type === "department") {
      if (association.departmentId && user.departmentId && association.departmentId === user.departmentId.toString()) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error("You do not have permission to assign a Staff Advisor to this association");
    }

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
 * Assign a Student Exco to an association (STUDENT_AFFAIRS, DEAN, HOD, STAFF_ADVISOR).
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

    // Authorize caller: STUDENT_AFFAIRS, DEAN, HOD, or the assigned STAFF_ADVISOR
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    let isAuthorized = false;
    if (user.roles.includes("STUDENT_AFFAIRS")) {
      isAuthorized = true;
    } else if (user.roles.includes("DEAN") && association.type === "faculty") {
      if (association.facultyId && user.facultyId && association.facultyId === user.facultyId.toString()) {
        isAuthorized = true;
      }
    } else if (user.roles.includes("HOD") && association.type === "department") {
      if (association.departmentId && user.departmentId && association.departmentId === user.departmentId.toString()) {
        isAuthorized = true;
      }
    } else if (user.roles.includes("STAFF_ADVISOR")) {
      if (association.staffAdvisorClerkId === user.clerkId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error("You do not have permission to assign a Student Exco to this association");
    }

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
 * Remove a Student Exco from an association (STUDENT_AFFAIRS, DEAN, HOD, STAFF_ADVISOR).
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

    // Authorize caller: STUDENT_AFFAIRS, DEAN, HOD, or the assigned STAFF_ADVISOR
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();
    if (!user) throw new Error("User not found");

    let isAuthorized = false;
    if (user.roles.includes("STUDENT_AFFAIRS")) {
      isAuthorized = true;
    } else if (user.roles.includes("DEAN") && association.type === "faculty") {
      if (association.facultyId && user.facultyId && association.facultyId === user.facultyId.toString()) {
        isAuthorized = true;
      }
    } else if (user.roles.includes("HOD") && association.type === "department") {
      if (association.departmentId && user.departmentId && association.departmentId === user.departmentId.toString()) {
        isAuthorized = true;
      }
    } else if (user.roles.includes("STAFF_ADVISOR")) {
      if (association.staffAdvisorClerkId === user.clerkId) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      throw new Error("You do not have permission to remove a Student Exco from this association");
    }

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

    // Allow wider scopes
    if (
      user.roles.includes("SUPER_ADMIN") ||
      user.roles.includes("INSTITUTION_ADMIN") ||
      user.roles.includes("FINANCE") ||
      user.roles.includes("STUDENT_AFFAIRS") ||
      user.roles.includes("DEAN") ||
      user.roles.includes("HOD") ||
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

/**
 * List staff advisors who are eligible to be assigned to this association.
 */
export const listEligibleStaffAdvisors = query({
  args: { associationId: v.id("associations") },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.associationId);
    if (!association) return [];

    const allUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), association.institutionId),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    return allUsers.filter((u) => {
      if (!u.roles.includes("STAFF_ADVISOR")) return false;
      if (association.type === "faculty" && association.facultyId) {
        return u.facultyId?.toString() === association.facultyId.toString();
      }
      if (association.type === "department" && association.departmentId) {
        return u.departmentId?.toString() === association.departmentId.toString();
      }
      return true;
    });
  },
});

/**
 * List student excos who are eligible to be assigned to this association.
 */
export const listEligibleStudentExcos = query({
  args: { associationId: v.id("associations") },
  handler: async (ctx, args) => {
    const association = await ctx.db.get(args.associationId);
    if (!association) return [];

    const allUsers = await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), association.institutionId),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    return allUsers.filter((u) => {
      if (!u.roles.includes("STUDENT_EXCO")) return false;
      if (association.type === "faculty" && association.facultyId) {
        return u.facultyId?.toString() === association.facultyId.toString();
      }
      if (association.type === "department" && association.departmentId) {
        return u.departmentId?.toString() === association.departmentId.toString();
      }
      return true;
    });
  },
});
