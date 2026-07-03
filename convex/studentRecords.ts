import { v } from "convex/values";
import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { requirePermission } from "./auth";

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

    const hasFacultySlug = header.includes("facultyslug");
    const hasDeptSlug = header.includes("departmentslug");

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
      const facultySlug = hasFacultySlug ? (values[header.indexOf("facultyslug")] || "").toUpperCase() : "";
      const departmentSlug = hasDeptSlug ? (values[header.indexOf("departmentslug")] || "").toUpperCase() : "";

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
        facultySlug: facultySlug || undefined,
        departmentSlug: departmentSlug || undefined,
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
    facultySlug: v.optional(v.string()),
    departmentSlug: v.optional(v.string()),
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
      facultySlug: args.facultySlug,
      departmentSlug: args.departmentSlug,
    });
  },
});

/**
 * Add a student record (INSTITUTION_ADMIN+).
 */
export const addStudentRecord = mutation({
  args: {
    institutionId: v.id("institutions"),
    matric: v.string(),
    faculty: v.string(),
    department: v.string(),
    level: v.number(),
    email: v.string(),
    facultySlug: v.optional(v.string()),
    departmentSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    // Check for duplicate matric within institution
    const existing = await ctx.db
      .query("studentRecords")
      .filter((q) =>
        q.and(
          q.eq(q.field("matric"), args.matric),
          q.eq(q.field("institutionId"), args.institutionId as any)
        )
      )
      .first();

    if (existing) {
      throw new Error(`Student with matric "${args.matric}" already exists`);
    }

    const docId = await ctx.db.insert("studentRecords", {
      institutionId: args.institutionId,
      matric: args.matric,
      faculty: args.faculty,
      department: args.department,
      level: args.level,
      email: args.email,
      status: "active",
      facultySlug: args.facultySlug,
      departmentSlug: args.departmentSlug,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "STUDENT_ADDED",
      entity: "studentRecords",
      entityId: docId,
      newValue: JSON.stringify({
        matric: args.matric,
        faculty: args.faculty,
        department: args.department,
        level: args.level,
        facultySlug: args.facultySlug,
        departmentSlug: args.departmentSlug,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { docId };
  },
});

/**
 * Update a student's status (graduate/withdraw) — INSTITUTION_ADMIN+.
 */
export const updateStudentStatus = mutation({
  args: {
    studentId: v.id("studentRecords"),
    status: v.union(v.literal("active"), v.literal("graduated"), v.literal("withdrawn")),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("studentRecords")
      .filter((q) => q.eq(q.field("_id"), args.studentId as any))
      .first();

    if (!student) throw new Error("Student not found");

    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: student.institutionId as any,
    });

    const oldStatus = student.status;
    await ctx.db.patch(args.studentId, { status: args.status });

    await ctx.db.insert("auditLogs", {
      institutionId: student.institutionId,
      userId: user.clerkId,
      action: "STUDENT_STATUS_CHANGED",
      entity: "studentRecords",
      entityId: args.studentId,
      oldValue: JSON.stringify({ status: oldStatus }),
      newValue: JSON.stringify({ status: args.status }),
      timestamp: Date.now(),
      success: true,
    });

    return { updated: true };
  },
});

/**
 * Update a student record (INSTITUTION_ADMIN+).
 */
export const updateStudentRecord = mutation({
  args: {
    studentId: v.id("studentRecords"),
    faculty: v.optional(v.string()),
    department: v.optional(v.string()),
    level: v.optional(v.number()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db
      .query("studentRecords")
      .filter((q) => q.eq(q.field("_id"), args.studentId as any))
      .first();

    if (!student) throw new Error("Student not found");

    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: student.institutionId as any,
    });

    const updates: Record<string, any> = {};
    if (args.faculty !== undefined) updates.faculty = args.faculty;
    if (args.department !== undefined) updates.department = args.department;
    if (args.level !== undefined) updates.level = args.level;
    if (args.email !== undefined) updates.email = args.email;

    await ctx.db.patch(args.studentId, updates);

    await ctx.db.insert("auditLogs", {
      institutionId: student.institutionId,
      userId: user.clerkId,
      action: "STUDENT_UPDATED",
      entity: "studentRecords",
      entityId: args.studentId,
      newValue: JSON.stringify(updates),
      timestamp: Date.now(),
      success: true,
    });

    return { updated: true };
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

/**
 * Get a student's own payment history (self-service).
 * STUDENT role, returns their own payments ordered by most recent first.
 */
export const getMyPayments = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("clerkId"), identity.subject))
      .first();

    if (!user || !user.roles.includes("STUDENT")) {
      throw new Error("Not a student user");
    }

    if (!user.institutionId) {
      throw new Error("Student has no institution assigned");
    }

    const matric = user.permissions[0];
    if (!matric) {
      throw new Error("No matric number found in your profile");
    }

    const payments = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("studentMatric"), matric),
          q.eq(q.field("institutionId"), user.institutionId as any)
        )
      )
      .order("desc")
      .collect();

    // Enrich each payment with the allocation routing info from walletTransactions
    const enriched = await Promise.all(
      payments.map(async (payment) => {
        const transactions = await ctx.db
          .query("walletTransactions")
          .filter((q) =>
            q.eq(q.field("paymentReference"), payment.nombaTransactionId)
          )
          .collect();

        return {
          id: payment._id,
          reference: payment.reference,
          amount: payment.amount,
          status: payment.status,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
          routing: transactions.map((txn) => ({
            amount: txn.amount,
            direction: txn.direction,
            reason: txn.reason,
          })),
        };
      })
    );

    return enriched;
  },
});
