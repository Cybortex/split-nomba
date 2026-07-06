import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Bootstrap the first SUPER_ADMIN user.
 *
 * This is a ONE-TIME setup mutation for bootstrapping the platform.
 * Once a SUPER_ADMIN exists, all subsequent users must be created
 * through the normal flow (createInstitutionUser for users with roles).
 *
 * After bootstrapping, sync the SUPER_ADMIN role to Clerk metadata so
 * middleware can redirect to /admin before the page loads:
 *
 *   curl -X POST https://<your-app>/api/clerk/sync-role \
 *     -H "Content-Type: application/json" \
 *     -d '{"clerkId":"user_2_xxx","isSuperAdmin":true}'
 *
 * Usage:
 *   1. Go to Clerk Dashboard → Users → Create User (email + password)
 *   2. Copy the Clerk ID (user_2_xxx) and the email
 *   3. Run this mutation via `npx convex run` or the Convex dashboard:
 *
 *      npx convex run --seed '{
 *        "clerkId": "user_2_xxx",
 *        "email": "admin@example.com"
 *      }'
 *
 *   Or paste the args directly into the Convex Dashboard data tab
 *   and call the `seed:bootstrapSuperAdmin` mutation.
 */
export const bootstrapSuperAdmin = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if a SUPER_ADMIN already exists (any user with SUPER_ADMIN in roles)
    const allUsers = await ctx.db.query("users").collect();
    const hasSuperAdmin = allUsers.some((u: any) =>
      u.roles.includes("SUPER_ADMIN"),
    );

    if (hasSuperAdmin) {
      throw new Error(
        "A SUPER_ADMIN already exists. Bootstrap is a one-time operation.",
      );
    }

    // Check if this Clerk ID is already taken
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
      .first();

    if (existing) {
      throw new Error(
        `User with clerkId "${args.clerkId}" already exists. ` +
          "Use a different Clerk ID or modify the existing user's roles.",
      );
    }

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      roles: ["SUPER_ADMIN"],
      activeRole: "SUPER_ADMIN",
      // SUPER_ADMIN has no institutionId — they are global
      institutionId: undefined,
      permissions: [],
      isActive: true,
    });

    // Log the bootstrap event
    await ctx.db.insert("auditLogs", {
      userId: args.clerkId,
      action: "USER_ROLE_CHANGED",
      entity: "users",
      entityId: userId,
      newValue: JSON.stringify({
        action: "BOOTSTRAP_SUPER_ADMIN",
        email: args.email,
        roles: ["SUPER_ADMIN"],
      }),
      timestamp: Date.now(),
      success: true,
    });

    return {
      success: true,
      userId,
      message: `SUPER_ADMIN created for ${args.email}. They can now sign in at /sign-in.`,
    };
  },
});

/**
 * Check if a SUPER_ADMIN exists in the system.
 * Useful for the sign-in page to show setup instructions.
 */
export const hasSuperAdmin = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.some((u: any) => u.roles.includes("SUPER_ADMIN"));
  },
});

/**
 * SUPER_ADMIN ONLY: Delete all institutions, their wallets, users, fees, payments,
 * sessions, and registrations — leaving only the SUPER_ADMIN user intact.
 * Run from Convex dashboard when resetting test data.
 */
export const resetInstitutions = mutation({
  handler: async (ctx) => {
    // Keep only super admin users
    const allUsers = await ctx.db.query("users").collect();
    const nonSuperAdmins = allUsers.filter(
      (u: any) => !u.roles.includes("SUPER_ADMIN")
    );
    for (const u of nonSuperAdmins) await ctx.db.delete(u._id);

    const tables = [
      "institutions",
      "institutionRegistrations",
      "wallets",
      "walletTransactions",
      "payments",
      "feeConfig",
      "academicSessions",
      "auditLogs",
      "associations",
      "withdrawalRequests",
      "studentRecords",
    ] as const;

    for (const table of tables) {
      const rows = await (ctx.db.query(table) as any).collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }

    return { success: true, message: "All institution data cleared. Super admin(s) preserved." };
  },
});
