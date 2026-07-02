import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Import student records from CSV (FINANCE+ for an institution).
 */
export const importStudentRecords = action({
  args: {
    csvContent: v.string(),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    const i = internal as any;
    const user = await ctx.runQuery(i.auth.getCurrentUser);
    if (!user || !user.roles.some((r: string) => ["FINANCE", "INSTITUTION_ADMIN", "SUPER_ADMIN"].includes(r))) {
      throw new Error("Only FINANCE admins can import student records");
    }

    // Verify user belongs to this institution
    if (
      !user.roles.includes("SUPER_ADMIN") &&
      user.institutionId?.toString() !== args.institutionId.toString()
    ) {
      throw new Error("Cannot import students for another institution");
    }

    const lines = args.csvContent.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have a header row and at least one data row");
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredFields = ["matric", "faculty", "department", "email"];
    for (const field of requiredFields) {
      if (!header.includes(field)) {
        throw new Error(`CSV missing required column: ${field}`);
      }
    }

    const results: Array<{ matric: string; docId: any }> = [];
    let skipped = 0;

    for (const line of lines.slice(1)) {
      if (!line.trim()) continue;

      const values = line.split(",").map((v) => v.trim());
      const matric = values[header.indexOf("matric")] || "";
      const faculty = values[header.indexOf("faculty")] || "";
      const department = values[header.indexOf("department")] || "";
      const level = parseInt(values[header.indexOf("level")]) || 100;
      const email = values[header.indexOf("email")] || "";

      if (!matric || !faculty || !department || !email) {
        skipped++;
        continue;
      }

      // Check for duplicates within institution
      const existing = await ctx.runQuery(internal.studentRecords.getByMatric, {
        matric,
        institutionId: args.institutionId,
      });

      if (existing) {
        skipped++;
        continue;
      }

      const docId = await ctx.runMutation(internal.studentRecords.createRecord, {
        institutionId: args.institutionId,
        matric,
        faculty,
        department,
        level,
        email,
        status: "active",
      });

      results.push({ matric, docId });
    }

    await ctx.runMutation(i.paymentsInternal.logAudit, {
      institutionId: args.institutionId,
      action: "ADMIN_BULK_IMPORT",
      entityId: "student-records",
      newValue: { imported: results.length, skipped },
      success: true,
    });

    return { imported: results.length, skipped };
  },
});

/**
 * Get student by matric (internal).
 */
export const getByMatric = internalQuery({
  args: { matric: v.string(), institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studentRecords")
      .filter((q) =>
        q.and(
          q.eq(q.field("matric"), args.matric),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();
  },
});

/**
 * Create student record (internal).
 */
export const createRecord = internalMutation({
  args: {
    institutionId: v.id("institutions"),
    matric: v.string(),
    faculty: v.string(),
    department: v.string(),
    level: v.number(),
    email: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("studentRecords", {
      institutionId: args.institutionId,
      matric: args.matric,
      faculty: args.faculty,
      department: args.department,
      level: args.level,
      email: args.email,
      status: args.status as "active" | "graduated" | "withdrawn",
    });
  },
});

/**
 * List all student records (FINANCE+ for institution).
 */
export const listStudents = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || !user.roles.some((r: string) => ["FINANCE", "INSTITUTION_ADMIN", "SUPER_ADMIN"].includes(r))) {
      throw new Error("Insufficient permissions");
    }

    if (
      !user.roles.includes("SUPER_ADMIN") &&
      user.institutionId?.toString() !== args.institutionId.toString()
    ) {
      throw new Error("Cannot view students for another institution");
    }

    return await ctx.db
      .query("studentRecords")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .collect();
  },
});
