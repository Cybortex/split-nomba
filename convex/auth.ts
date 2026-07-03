import { query, mutation } from "./_generated/server";
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
