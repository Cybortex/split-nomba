import { query, mutation, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ============================================================================
// ROLE HIERARCHY
// ============================================================================

/** Map of role → access level (higher = more privileged) */
export const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 100,
  INSTITUTION_ADMIN: 80,
  FINANCE: 70,
  STUDENT_AFFAIRS: 60,
  DEAN: 50,
  HOD: 40,
  STAFF_ADVISOR: 30,
  STUDENT_EXCO: 20,
  STAFF: 15,
  STUDENT: 10,
};

export const ALL_ROLES = Object.keys(ROLE_HIERARCHY);

// ============================================================================
// CURRENT USER RESOLVER (standalone function + registered query)
// ============================================================================

/**
 * Standalone resolver — fetches the current authenticated user from Clerk JWT.
 * Returns null if not logged in or inactive.
 * NOTE: This is NOT a RegisteredQuery — it's a plain async function so other
 * functions in this file can call it directly without TypeScript errors.
 */
async function resolveCurrentUser(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .filter((q: any) => q.eq(q.field("clerkId"), identity.subject))
    .first();

  if (!user || !user.isActive) return null;

  return user;
}

/**
 * Get the currently authenticated user from Clerk JWT (registered query).
 * Call this FROM THE FRONTEND. For internal calls within this file,
 * use resolveCurrentUser(ctx) instead.
 */
export const getCurrentUser = query({
  handler: async (ctx) => resolveCurrentUser(ctx),
});

/**
 * Get the current user's active role.
 */
export const getMyActiveRole = query({
  handler: async (ctx) => {
    const user = await resolveCurrentUser(ctx);
    if (!user || user.roles.length === 0) return null;

    if (user.activeRole && user.roles.includes(user.activeRole)) {
      return user.activeRole;
    }

    return user.roles[0];
  },
});

/**
 * Switch the user's active role (for dashboard context switching).
 */
export const switchActiveRole = mutation({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const user = await resolveCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    if (!user.roles.includes(args.role)) {
      throw new Error(`You don't have the role: ${args.role}`);
    }

    await ctx.db.patch(user._id, { activeRole: args.role });
    return { activeRole: args.role };
  },
});

/**
 * Get the current user's institution info.
 */
export const getMyInstitution = query({
  handler: async (ctx) => {
    const user = await resolveCurrentUser(ctx);
    if (!user || !user.institutionId) return null;

    return await ctx.db
      .query("institutions")
      .filter((q) => q.eq(q.field("_id"), user.institutionId as any))
      .first();
  },
});

// ============================================================================
// INSTITUTION ONBOARDING FLOW
// ============================================================================

/**
 * Register a new institution (public — no auth needed).
 */
export const registerInstitution = mutation({
  args: {
    name: v.string(),
    adminEmail: v.string(),
    adminName: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("institutionRegistrations")
      .filter((q) => q.eq(q.field("adminEmail"), args.adminEmail))
      .first();

    if (existing) {
      if (existing.status === "pending") {
        throw new Error("Registration already pending approval.");
      }
      if (existing.status === "approved") {
        throw new Error("This institution is already registered.");
      }
    }

    const registrationId = await ctx.db.insert("institutionRegistrations", {
      name: args.name,
      adminEmail: args.adminEmail,
      adminName: args.adminName,
      phone: args.phone,
      address: args.address,
      status: "pending",
      createdAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: "PUBLIC",
      action: "INSTITUTION_REGISTERED",
      entity: "institutionRegistrations",
      entityId: registrationId,
      newValue: JSON.stringify({
        name: args.name,
        adminEmail: args.adminEmail,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { registrationId, status: "pending" };
  },
});

/**
 * Approve an institution registration (SUPER_ADMIN only).
 */
export const approveInstitution = mutation({
  args: {
    registrationId: v.id("institutionRegistrations"),
  },
  handler: async (ctx, args) => {
    const admin = await requirePermission(ctx, "SUPER_ADMIN");

    const registration = await ctx.db
      .query("institutionRegistrations")
      .filter((q) => q.eq(q.field("_id"), args.registrationId as any))
      .first();

    if (!registration) throw new Error("Registration not found");
    if (registration.status !== "pending")
      throw new Error("Registration already processed");

    const institutionId = await ctx.db.insert("institutions", {
      name: registration.name,
      registrationId: args.registrationId,
      adminClerkId: "",
      isActive: true,
      createdAt: Date.now(),
    });

    const accountNumber = "99" + Math.floor(10000000 + Math.random() * 90000000).toString();
    const accountRef = `REF-VA-INST-${institutionId.toString().substring(0,6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // Create institution wallet
    await ctx.db.insert("wallets", {
      institutionId: institutionId as any,
      type: "institution",
      entityId: institutionId.toString(),
      name: registration.name,
      totalCollected: 0,
      availableBalance: 0,
      minimumBalance: 0,
      transactionCount: 0,
      bankName: "Providus Bank",
      accountNumber,
      accountName: `${registration.name} (HQ)`,
      accountRef,
    });

    await ctx.db.patch(args.registrationId, {
      status: "approved",
      reviewedBy: admin.clerkId,
      reviewedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      institutionId: institutionId as any,
      userId: admin.clerkId,
      action: "INSTITUTION_APPROVED",
      entity: "institutions",
      entityId: institutionId,
      newValue: JSON.stringify({ name: registration.name }),
      timestamp: Date.now(),
      success: true,
    });

    return { institutionId, name: registration.name };
  },
});

/**
 * Reject an institution registration (SUPER_ADMIN only).
 */
export const rejectInstitution = mutation({
  args: {
    registrationId: v.id("institutionRegistrations"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requirePermission(ctx, "SUPER_ADMIN");

    const registration = await ctx.db
      .query("institutionRegistrations")
      .filter((q) => q.eq(q.field("_id"), args.registrationId as any))
      .first();

    if (!registration) throw new Error("Registration not found");
    if (registration.status !== "pending")
      throw new Error("Registration already processed");

    await ctx.db.patch(args.registrationId, {
      status: "rejected",
      reviewedBy: admin.clerkId,
      reviewedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      userId: admin.clerkId,
      action: "INSTITUTION_REJECTED",
      entity: "institutionRegistrations",
      entityId: args.registrationId,
      newValue: JSON.stringify({ reason: args.reason }),
      timestamp: Date.now(),
      success: true,
    });

    return { rejected: true };
  },
});

/**
 * List pending institution registrations (SUPER_ADMIN only).
 */
export const listPendingRegistrations = query({
  handler: async (ctx) => {
    await requirePermission(ctx, "SUPER_ADMIN");
    return await ctx.db
      .query("institutionRegistrations")
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();
  },
});

/**
 * Create an institution directly with its INSTITUTION_ADMIN user (SUPER_ADMIN only).
 * Atomically creates both records so the institution is never orphaned.
 * The user must already exist in Clerk — provide their clerkId and email.
 */
export const createInstitutionDirect = mutation({
  args: {
    name: v.string(),
    adminClerkId: v.string(),
    adminEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await requirePermission(ctx, "SUPER_ADMIN");

    // Check if admin user already exists (in any institution)
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.adminClerkId))
      .first();

    if (existingUser) {
      throw new Error(`User ${args.adminEmail} already exists in the system`);
    }

    // Check for duplicate institution name
    const existingInst = await ctx.db
      .query("institutions")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existingInst) {
      throw new Error(`Institution "${args.name}" already exists`);
    }

    // Create institution (no registrationId since this is direct creation)
    const institutionId = await ctx.db.insert("institutions", {
      name: args.name,
      adminClerkId: args.adminClerkId,
      isActive: true,
      createdAt: Date.now(),
    });

    const accountNumber = "99" + Math.floor(10000000 + Math.random() * 90000000).toString();
    const accountRef = `REF-VA-INST-${institutionId.toString().substring(0,6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    // Create institution wallet
    await ctx.db.insert("wallets", {
      institutionId: institutionId as any,
      type: "institution",
      entityId: institutionId.toString(),
      name: args.name,
      totalCollected: 0,
      availableBalance: 0,
      minimumBalance: 0,
      transactionCount: 0,
      bankName: "Providus Bank",
      accountNumber,
      accountName: `${args.name} (HQ)`,
      accountRef,
    });

    // Create INSTITUTION_ADMIN user
    await ctx.db.insert("users", {
      clerkId: args.adminClerkId,
      email: args.adminEmail,
      roles: ["INSTITUTION_ADMIN"],
      activeRole: "INSTITUTION_ADMIN",
      institutionId: institutionId,
      permissions: [],
      isActive: true,
    });

    // Audit trail
    await ctx.db.insert("auditLogs", {
      institutionId: institutionId,
      userId: admin.clerkId,
      action: "INSTITUTION_APPROVED",
      entity: "institutions",
      entityId: institutionId,
      newValue: JSON.stringify({
        name: args.name,
        adminEmail: args.adminEmail,
      }),
      timestamp: Date.now(),
      success: true,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: institutionId,
      userId: admin.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: institutionId,
      newValue: JSON.stringify({
        roles: ["INSTITUTION_ADMIN"],
        institutionId: institutionId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      institutionId,
      name: args.name,
      adminEmail: args.adminEmail,
    };
  },
});

/**
 * Update institution profile (INSTITUTION_ADMIN+ for their own institution).
 */
export const updateInstitutionProfile = mutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    const institution = await ctx.db
      .query("institutions")
      .filter((q) => q.eq(q.field("_id"), args.institutionId as any))
      .first();

    if (!institution) throw new Error("Institution not found");

    const updates: Record<string, any> = {};
    if (args.name !== undefined) {
      if (!args.name.trim()) throw new Error("Institution name is required");
      updates.name = args.name.trim();
    }
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.address !== undefined) updates.address = args.address;
    if (args.website !== undefined) updates.website = args.website;

    await ctx.db.patch(args.institutionId, updates);

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "INSTITUTION_UPDATED",
      entity: "institutions",
      entityId: args.institutionId,
      oldValue: JSON.stringify({
        name: institution.name,
        phone: institution.phone,
        address: institution.address,
      }),
      newValue: JSON.stringify(updates),
      timestamp: Date.now(),
      success: true,
    });

    return { updated: true };
  },
});

/**
 * List all institutions (SUPER_ADMIN only).
 */
export const listInstitutions = query({
  handler: async (ctx) => {
    await requirePermission(ctx, "SUPER_ADMIN");
    return await ctx.db.query("institutions").collect();
  },
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * Create a user with one or more roles (INSTITUTION_ADMIN+).
 */
export const createInstitutionUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    roles: v.array(v.string()),
    permissions: v.array(v.string()),
    institutionId: v.id("institutions"),
    facultyId: v.optional(v.id("faculties")),
    departmentId: v.optional(v.id("departments")),
    faculty: v.optional(v.string()),
    department: v.optional(v.string()),
    staffType: v.optional(v.union(v.literal("academic"), v.literal("non-academic"))),
  },
  handler: async (ctx, args) => {
    const admin = await requirePermission(ctx, "INSTITUTION_ADMIN");

    if (
      !admin.roles.includes("SUPER_ADMIN") &&
      admin.institutionId?.toString() !== args.institutionId.toString()
    ) {
      throw new Error("You can only create users in your own institution");
    }

    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existing) throw new Error("User already exists in the system");

    // Validate all provided roles
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
        throw new Error(
          "Cannot assign SUPER_ADMIN or INSTITUTION_ADMIN roles"
        );
      }
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      roles: args.roles,
      activeRole: args.roles[0], // Default to first role
      institutionId: args.institutionId,
      permissions: args.permissions,
      isActive: true,
      facultyId: args.facultyId,
      departmentId: args.departmentId,
      faculty: args.faculty,
      department: args.department,
      staffType: args.staffType,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: admin.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: userId,
      newValue: JSON.stringify({
        roles: args.roles,
        permissions: args.permissions,
        institutionId: args.institutionId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return userId;
  },
});

/**
 * Add a role to an existing user (INSTITUTION_ADMIN+).
 */
export const addUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
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

    if (!ALL_ROLES.includes(args.role)) {
      throw new Error(`Invalid role: ${args.role}`);
    }

    if (target.roles.includes(args.role)) {
      throw new Error(`User already has the role: ${args.role}`);
    }

    if (!admin.roles.includes("SUPER_ADMIN")) {
      if (args.role === "SUPER_ADMIN" || args.role === "INSTITUTION_ADMIN") {
        throw new Error("Cannot assign SUPER_ADMIN or INSTITUTION_ADMIN role");
      }
    }

    await ctx.db.patch(args.userId, {
      roles: [...target.roles, args.role],
    });

    await ctx.db.insert("auditLogs", {
      institutionId: target.institutionId as any,
      userId: admin.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: args.userId,
      newValue: JSON.stringify({ addedRole: args.role }),
      timestamp: Date.now(),
      success: true,
    });

    return { roles: [...target.roles, args.role] };
  },
});

/**
 * Remove a role from a user (INSTITUTION_ADMIN+).
 */
export const removeUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.string(),
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

    if (!target.roles.includes(args.role)) {
      throw new Error(`User does not have the role: ${args.role}`);
    }

    if (target.roles.length <= 1) {
      throw new Error("Cannot remove the last role from a user");
    }

    const newRoles = target.roles.filter((r) => r !== args.role);
    const newActiveRole =
      target.activeRole === args.role ? newRoles[0] : target.activeRole;

    await ctx.db.patch(args.userId, {
      roles: newRoles,
      activeRole: newActiveRole,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: target.institutionId as any,
      userId: admin.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: args.userId,
      newValue: JSON.stringify({ removedRole: args.role }),
      timestamp: Date.now(),
      success: true,
    });

    return { roles: newRoles };
  },
});

/**
 * Bulk create student users (INSTITUTION_ADMIN+).
 */
export const bulkCreateStudents = mutation({
  args: {
    institutionId: v.id("institutions"),
    students: v.array(
      v.object({
        clerkId: v.string(),
        email: v.string(),
        matric: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const admin = await requirePermission(ctx, "INSTITUTION_ADMIN");

    if (
      !admin.roles.includes("SUPER_ADMIN") &&
      admin.institutionId?.toString() !== args.institutionId.toString()
    ) {
      throw new Error("Cannot add students to another institution");
    }

    const results: Array<{ email: string; status: string; reason?: string }> = [];
    for (const student of args.students) {
      const existing = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("clerkId"), student.clerkId))
        .first();

      if (existing) {
        results.push({ email: student.email, status: "skipped", reason: "exists" });
        continue;
      }

      await ctx.db.insert("users", {
        clerkId: student.clerkId,
        email: student.email,
        roles: ["STUDENT"],
        activeRole: "STUDENT",
        institutionId: args.institutionId,
        permissions: [student.matric],
        isActive: true,
      });

      results.push({ email: student.email, status: "created" });
    }

    // Log bulk import in audit trail
    const importedCount = results.filter((r: any) => r.status === "created").length;
    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: admin.clerkId,
      action: "ADMIN_BULK_IMPORT",
      entity: "users",
      entityId: args.institutionId,
      newValue: JSON.stringify({
        imported: importedCount,
        total: args.students.length,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      imported: importedCount,
      results,
    };
  },
});

/**
 * Deactivate a user (INSTITUTION_ADMIN+).
 */
export const deactivateUser = mutation({
  args: { userId: v.id("users") },
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
      throw new Error("Cannot deactivate users outside your institution");
    }

    await ctx.db.patch(args.userId, { isActive: false });

    await ctx.db.insert("auditLogs", {
      institutionId: target.institutionId as any,
      userId: admin.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: args.userId,
      newValue: JSON.stringify({ status: "deactivated" }),
      timestamp: Date.now(),
      success: true,
    });
  },
});

/**
 * List users in an institution.
 */
export const listInstitutionUsers = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "INSTITUTION_ADMIN");
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("institutionId"), args.institutionId as any))
      .collect();
  },
});

/**
 * Sync user from Clerk on login.
 * Rejects if user doesn't have a pre-existing record.
 */
export const syncUser = mutation({
  args: { clerkId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (!existing) {
      throw new Error(
        "No account found. Contact your institution administrator."
      );
    }

    if (!existing.isActive) {
      throw new Error("Account is deactivated. Contact your administrator.");
    }

    return existing;
  },
});

/**
 * Get users by role within an institution (STUDENT_AFFAIRS+).
 */
export const getUsersByRole = query({
  args: {
    institutionId: v.id("institutions"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "STUDENT_AFFAIRS", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("users")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("isActive"), true),
        )
      )
      .collect()
      .then((users) =>
        users.filter((u: any) =>
          args.roles.some((role: string) => u.roles.includes(role))
        )
      );
  },
});

// ============================================================================
// RBAC — MULTI-ROLE PERMISSION CHECK
// ============================================================================

/**
 * RBAC permission check — call before sensitive operations.
 * With multi-role support: checks if ANY of the user's roles meets the requirement.
 */
export async function requirePermission(
  ctx: any,
  requiredRole: string,
  scope?: { institutionId?: string; entityId?: string }
) {
  const user = await resolveCurrentUser(ctx);
  if (!user) throw new Error("Unauthorized: not logged in");

  // Check if ANY of the user's roles meets the required level
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;

  const hasPermission = user.roles.some(
    (role: string) => (ROLE_HIERARCHY[role] ?? 0) >= requiredLevel
  );

  if (!hasPermission) {
    throw new Error(
      `Insufficient permissions. Your roles (${user.roles.join(", ")}) cannot access ${requiredRole} resource.`
    );
  }

  // Institution-scoped access (unless SUPER_ADMIN)
  if (scope?.institutionId && !user.roles.includes("SUPER_ADMIN")) {
    if (
      !user.institutionId ||
      user.institutionId.toString() !== scope.institutionId
    ) {
      throw new Error("Access denied: you don't belong to this institution");
    }
  }

  // Entity-scoped access — check using the best matching role
  if (scope?.entityId) {
    // DEAN scoping
    if (
      user.roles.includes("DEAN") &&
      !user.permissions.includes(scope.entityId)
    ) {
      const isDepartmentUnderFaculty = user.permissions.some((p: string) =>
        scope.entityId!.startsWith(p)
      );
      if (!isDepartmentUnderFaculty) {
        throw new Error(
          `Access denied: you don't have permission for ${scope.entityId}`
        );
      }
    }

    // HOD scoping
    if (
      user.roles.includes("HOD") &&
      !user.permissions.includes(scope.entityId)
    ) {
      throw new Error(
        `Access denied: you don't have permission for ${scope.entityId}`
      );
    }

    // STAFF_ADVISOR scoping
    if (
      user.roles.includes("STAFF_ADVISOR") &&
      !user.permissions.includes(scope.entityId)
    ) {
      throw new Error("Access denied: you are not assigned to this association");
    }

    // STUDENT_EXCO scoping
    if (
      user.roles.includes("STUDENT_EXCO") &&
      !user.permissions.includes(scope.entityId)
    ) {
      throw new Error(
        "Access denied: you are not an executive of this association"
      );
    }
  }

  return user;
}

// ============================================================================
// INSTITUTION APPROVAL ACTION (creates Clerk user + Convex record atomically)
// ============================================================================

/**
 * Internal mutation: Approve the registration and create the institution + wallet in the DB.
 * Called by the approveAndSetupInstitution action.
 */
export const approveInstitutionInternal = internalMutation({
  args: {
    registrationId: v.id("institutionRegistrations"),
    superAdminClerkId: v.string(),
    adminClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const registration = await ctx.db
      .query("institutionRegistrations")
      .filter((q: any) => q.eq(q.field("_id"), args.registrationId))
      .first();

    if (!registration) throw new Error("Registration not found");
    if (registration.status !== "pending")
      throw new Error("Registration already processed");

    // Create institution
    const institutionId = await ctx.db.insert("institutions", {
      name: registration.name,
      registrationId: args.registrationId,
      adminClerkId: args.adminClerkId,
      isActive: true,
      createdAt: Date.now(),
    });

    // Create institution wallet
    await ctx.db.insert("wallets", {
      institutionId: institutionId as any,
      type: "institution",
      entityId: institutionId.toString(),
      name: registration.name,
      totalCollected: 0,
      availableBalance: 0,
      minimumBalance: 0,
      transactionCount: 0,
    });

    // Mark registration as approved
    await ctx.db.patch(args.registrationId, {
      status: "approved",
      reviewedBy: args.superAdminClerkId,
      reviewedAt: Date.now(),
    });

    // Audit log
    await ctx.db.insert("auditLogs", {
      institutionId: institutionId as any,
      userId: args.superAdminClerkId,
      action: "INSTITUTION_APPROVED",
      entity: "institutions",
      entityId: institutionId,
      newValue: JSON.stringify({ name: registration.name, adminEmail: registration.adminEmail }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      institutionId,
      adminEmail: registration.adminEmail,
      adminName: registration.adminName,
      institutionName: registration.name,
    };
  },
});

/**
 * Internal mutation: Create the INSTITUTION_ADMIN user record in Convex.
 * Called by the approveAndSetupInstitution action after Clerk user creation.
 */
export const createInstitutionAdminRecord = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    institutionId: v.id("institutions"),
    superAdminClerkId: v.string(),
  },
  handler: async (ctx, args) => {
    // Avoid duplicates
    const existing = await ctx.db
      .query("users")
      .filter((q: any) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existing) return existing._id;

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      roles: ["INSTITUTION_ADMIN"],
      activeRole: "INSTITUTION_ADMIN",
      institutionId: args.institutionId,
      permissions: [],
      isActive: true,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: args.superAdminClerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: userId,
      newValue: JSON.stringify({
        roles: ["INSTITUTION_ADMIN"],
        email: args.email,
        institutionId: args.institutionId,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return userId;
  },
});

/**
 * ACTION: Approve an institution registration and fully set up the admin account.
 *
 * Flow:
 *   1. Verify caller is SUPER_ADMIN
 *   2. Create institution + wallet in Convex DB (internalMutation)
 *   3. Create Clerk user with email (no password — email code sign-in)
 *   4. Create Convex user record with INSTITUTION_ADMIN role (internalMutation)
 *   5. Generate a 7-day Clerk sign-in token (magic link for first login)
 *   6. Return the sign-in URL to display in the admin dashboard
 */
export const approveAndSetupInstitution = action({
  args: { registrationId: v.id("institutionRegistrations") },
  handler: async (ctx, args): Promise<{
    institutionId: string;
    adminEmail: string;
    institutionName: string;
    signInUrl: string | null;
    clerkId: string;
    emailSent: boolean;
    emailError?: string;
  }> => {
    // Verify caller is authenticated and is a SUPER_ADMIN
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const superAdminClerkId = identity.subject;

    const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
    if (!CLERK_SECRET_KEY) throw new Error("CLERK_SECRET_KEY not configured");

    // ── Step 1: We need to peek at the registration to get the email ──────────
    // (we'll do this in the internal mutation, but we need it for Clerk first)
    // We'll pass a placeholder clerkId and update it after Clerk user creation.
    // To solve the chicken-and-egg, we create the Clerk user first,
    // then run the internal mutation with the real clerkId.

    // ── Step 2: Get registration info via a temporary read ───────────────────
    // We use ctx.runQuery to read the registration without modifying anything
    const registration = await ctx.runQuery(internal.auth.getRegistrationForApproval, {
      registrationId: args.registrationId,
    });

    if (!registration) throw new Error("Registration not found");
    if (registration.status !== "pending") throw new Error("Already processed");

    const { adminEmail, adminName } = registration;

    // ── Step 3: Create Clerk user (no password — uses email code to sign in) ──
    const clerkCreateRes = await fetch("https://api.clerk.com/v1/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: [adminEmail],
        first_name: adminName?.split(" ")[0] || adminEmail.split("@")[0],
        last_name: adminName?.split(" ").slice(1).join(" ") || "",
        skip_password_requirement: true,
        skip_password_checks: true,
      }),
    });

    if (!clerkCreateRes.ok) {
      const errBody = await clerkCreateRes.json();
      // If user already exists in Clerk, try to find them
      const clerkErr = errBody?.errors?.[0];
      if (clerkErr?.code !== "form_identifier_exists") {
        throw new Error(`Clerk user creation failed: ${clerkErr?.message || JSON.stringify(errBody)}`);
      }
      // User already exists — get their ID
      const existingRes = await fetch(
        `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(adminEmail)}`,
        { headers: { Authorization: `Bearer ${CLERK_SECRET_KEY}` } }
      );
      const existingData = await existingRes.json();
      const existingClerkId = existingData?.[0]?.id;
      if (!existingClerkId) throw new Error("Clerk user exists but could not retrieve their ID");

      // Run DB approval with existing clerk ID
      const result = await ctx.runMutation(internal.auth.approveInstitutionInternal, {
        registrationId: args.registrationId,
        superAdminClerkId,
        adminClerkId: existingClerkId,
      });

      await ctx.runMutation(internal.auth.createInstitutionAdminRecord, {
        clerkId: existingClerkId,
        email: adminEmail,
        institutionId: result.institutionId,
        superAdminClerkId,
      });

      // Send onboarding email without instant token (since user already existed, they know their credentials)
      const emailStatus = await sendApprovedEmail(adminEmail, adminName || "Admin", result.institutionName, null).catch((e) => ({
        success: false,
        error: e.message || e,
      }));

      return {
        institutionId: result.institutionId.toString(),
        adminEmail,
        institutionName: result.institutionName,
        signInUrl: null,
        clerkId: existingClerkId,
        emailSent: emailStatus.success,
        emailError: emailStatus.error,
      };
    }

    const clerkUser = await clerkCreateRes.json();
    const clerkId: string = clerkUser.id;

    // ── Step 4: Approve institution and create Convex records ─────────────────
    const result = await ctx.runMutation(internal.auth.approveInstitutionInternal, {
      registrationId: args.registrationId,
      superAdminClerkId,
      adminClerkId: clerkId,
    });

    await ctx.runMutation(internal.auth.createInstitutionAdminRecord, {
      clerkId,
      email: adminEmail,
      institutionId: result.institutionId,
      superAdminClerkId,
    });

    // ── Step 5: Generate a 7-day magic sign-in token ──────────────────────────
    let signInUrl: string | null = null;
    try {
      const tokenRes = await fetch("https://api.clerk.com/v1/sign_in_tokens", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLERK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: clerkId,
          expires_in_seconds: 604800, // 7 days
          redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/`,
        }),
      });

      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        signInUrl = tokenData.url ?? null;
      }
    } catch {
      // Sign-in token generation is non-fatal — admin can still use email code
    }

    // Send onboarding email with instant sign-in URL if generated
    const emailStatus = await sendApprovedEmail(adminEmail, adminName || "Admin", result.institutionName, signInUrl).catch((e) => ({
      success: false,
      error: e.message || e,
    }));

    return {
      institutionId: result.institutionId.toString(),
      adminEmail,
      institutionName: result.institutionName,
      signInUrl,
      clerkId,
      emailSent: emailStatus.success,
      emailError: emailStatus.error,
    };
  },
});

/**
 * Helper function to send email via Google Apps Script Web App
 */
async function sendApprovedEmail(
  toEmail: string,
  adminName: string,
  institutionName: string,
  signInUrl: string | null
): Promise<{ success: boolean; error?: string }> {
  const serviceUrl = process.env.EMAIL_SERVICE_URL;
  const serviceKey = process.env.EMAIL_SERVICE_KEY;

  if (!serviceUrl || !serviceKey) {
    const err = "EMAIL_SERVICE_URL or EMAIL_SERVICE_KEY not configured. Skipping email sending.";
    console.warn(`[Email Service] ${err}`);
    return { success: false, error: err };
  }

  const htmlBody = `
<div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f3f4f6; padding: 40px 20px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #1f2937;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="color: #f59e0b; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Nomba Split</h1>
    <p style="color: #9ca3af; margin: 4px 0 0 0; font-size: 14px;">Institutional Onboarding Platform</p>
  </div>
  
  <div style="background-color: #111827; padding: 32px; border-radius: 12px; border: 1px solid #374151;">
    <h2 style="font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px;">Welcome to Split!</h2>
    <p style="font-size: 15px; color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
      Hello ${adminName},<br/><br/>
      Your institution, <strong style="color: #ffffff;">${institutionName}</strong>, has been successfully approved on our platform. Your administrator account is ready.
    </p>
    
    ${signInUrl ? `
      <div style="text-align: center; margin: 32px 0;">
        <a href="${signInUrl}" style="background-color: #f59e0b; color: #000000; font-weight: 700; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block;">
          Sign In Instantly
        </a>
        <p style="font-size: 11px; color: #6b7280; margin-top: 12px; margin-bottom: 0;">
          This link is valid for 7 days and can only be used once.
        </p>
      </div>
    ` : ""}
    
    <div style="background-color: #1f2937; padding: 20px; border-radius: 8px; border: 1px solid #374151; margin-top: 24px;">
      <h3 style="font-size: 14px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 12px;">Standard Login Credentials</h3>
      <p style="font-size: 13px; color: #9ca3af; margin: 0 0 8px 0; line-height: 1.5;">
        You can always sign in using your registered email:
      </p>
      <div style="font-family: monospace; font-size: 14px; color: #f59e0b; background-color: #0b0f19; padding: 10px; border-radius: 6px; border: 1px solid #111827; display: inline-block;">
        ${toEmail}
      </div>
      <p style="font-size: 13px; color: #9ca3af; margin: 12px 0 0 0; line-height: 1.5;">
        Choose the <strong>"Use email verification code"</strong> option on the sign-in page to receive a secure code.
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 32px; font-size: 12px; color: #4b5563;">
    <p style="margin: 0;">© ${new Date().getFullYear()} Nomba Split. All rights reserved.</p>
  </div>
</div>
  `;

  try {
    const response = await fetch(serviceUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: toEmail,
        subject: `Welcome to Nomba Split - ${institutionName} Approved!`,
        body: htmlBody,
        apiKey: serviceKey,
      }),
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      const err = `Google Apps Script returned status ${response.status}: ${errorText}`;
      console.error(`[Email Service] ${err}`);
      return { success: false, error: err };
    }

    const data = await response.json();
    if (!data.success) {
      const err = `Google Apps Script execution error: ${data.error}`;
      console.error(`[Email Service] ${err}`);
      return { success: false, error: err };
    }

    console.log(`[Email Service] Successfully sent onboarding email to ${toEmail}`);
    return { success: true };
  } catch (error: any) {
    const err = `Network error: ${error.message || error}`;
    console.error(`[Email Service] ${err}`);
    return { success: false, error: err };
  }
}

/**
 * Internal query: Read a registration for the approval action.
 */
export const getRegistrationForApproval = internalQuery({
  args: { registrationId: v.id("institutionRegistrations") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("institutionRegistrations")
      .filter((q: any) => q.eq(q.field("_id"), args.registrationId))
      .first();
  },
});
