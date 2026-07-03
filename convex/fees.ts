import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./auth";

const FEE_CATEGORIES = v.union(
  v.literal("tuition"),
  v.literal("department_dues"),
  v.literal("faculty_dues"),
  v.literal("sug_dues")
);

/**
 * Get fee items for a specific level and category (FINANCE+).
 */
export const getLevelFees = query({
  args: {
    institutionId: v.id("institutions"),
    level: v.number(),
    category: v.optional(FEE_CATEGORIES),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    let query = ctx.db
      .query("feeConfig")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("level"), args.level)
        )
      );

    if (args.category) {
      query = query.filter((q) => q.eq(q.field("category"), args.category));
    }

    return await query.collect();
  },
});

/**
 * Get all fee items for all levels (FINANCE+).
 */
export const getAllLevelFees = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    return await ctx.db
      .query("feeConfig")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .order("asc")
      .collect();
  },
});

/**
 * Get fee summary grouped by level and category (FINANCE+).
 */
export const getFeeSummary = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    const allItems = await ctx.db
      .query("feeConfig")
      .filter((q) =>
        q.eq(q.field("institutionId"), args.institutionId as any)
      )
      .collect();

    type CategoryBreakdown = {
      category: string;
      items: Array<{ id: string; name: string; amount: number }>;
      total: number;
    };

    const grouped: Record<
      number,
      { categories: Record<string, CategoryBreakdown>; total: number }
    > = {};

    for (const item of allItems) {
      if (!grouped[item.level]) {
        grouped[item.level] = { categories: {}, total: 0 };
      }
      const levelGroup = grouped[item.level];
      if (!levelGroup.categories[item.category]) {
        levelGroup.categories[item.category] = {
          category: item.category,
          items: [],
          total: 0,
        };
      }
      levelGroup.categories[item.category].items.push({
        id: item._id,
        name: item.itemName,
        amount: item.amount,
      });
      levelGroup.categories[item.category].total += item.amount;
      levelGroup.total += item.amount;
    }

    return Object.entries(grouped)
      .map(([level, data]) => ({
        level: parseInt(level),
        categories: Object.values(data.categories).sort((a, b) =>
          a.category.localeCompare(b.category)
        ),
        total: data.total,
      }))
      .sort((a, b) => a.level - b.level);
  },
});

/**
 * Add a fee item to a level (FINANCE+).
 */
export const addFeeItem = mutation({
  args: {
    institutionId: v.id("institutions"),
    level: v.number(),
    category: FEE_CATEGORIES,
    itemName: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "FINANCE", {
      institutionId: args.institutionId as any,
    });

    if (args.amount <= 0) {
      throw new Error("Fee amount must be greater than zero");
    }
    if (![100, 200, 300, 400, 500].includes(args.level)) {
      throw new Error("Level must be 100, 200, 300, 400, or 500");
    }
    if (!args.itemName.trim()) {
      throw new Error("Fee item name is required");
    }

    const existing = await ctx.db
      .query("feeConfig")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("level"), args.level),
          q.eq(q.field("category"), args.category),
          q.eq(q.field("itemName"), args.itemName.trim())
        )
      )
      .first();

    if (existing) {
      throw new Error(
        `Item "${args.itemName}" already exists for Level ${args.level} in category "${args.category}"`
      );
    }

    const itemId = await ctx.db.insert("feeConfig", {
      institutionId: args.institutionId,
      level: args.level,
      category: args.category,
      itemName: args.itemName.trim(),
      amount: args.amount,
    });

    await ctx.db.insert("auditLogs", {
      institutionId: args.institutionId,
      userId: user.clerkId,
      action: "FEE_CONFIG_UPDATED",
      entity: "feeConfig",
      entityId: itemId,
      newValue: JSON.stringify({
        level: args.level,
        category: args.category,
        itemName: args.itemName.trim(),
        amount: args.amount,
      }),
      timestamp: Date.now(),
      success: true,
    });

    return { itemId, level: args.level, category: args.category, itemName: args.itemName.trim(), amount: args.amount };
  },
});

/**
 * Update a fee item (FINANCE+).
 */
export const updateFeeItem = mutation({
  args: {
    itemId: v.id("feeConfig"),
    itemName: v.optional(v.string()),
    amount: v.optional(v.number()),
    category: v.optional(FEE_CATEGORIES),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("feeConfig")
      .filter((q) => q.eq(q.field("_id"), args.itemId as any))
      .first();
    if (!item) throw new Error("Fee item not found");

    await requirePermission(ctx, "FINANCE", {
      institutionId: item.institutionId as any,
    });

    const updates: Record<string, any> = {};
    if (args.itemName !== undefined) {
      if (!args.itemName.trim()) throw new Error("Fee item name is required");
      updates.itemName = args.itemName.trim();
    }
    if (args.amount !== undefined) {
      if (args.amount <= 0) throw new Error("Fee amount must be greater than zero");
      updates.amount = args.amount;
    }
    if (args.category !== undefined) {
      updates.category = args.category;
    }

    await ctx.db.patch(args.itemId, updates);

    await ctx.db.insert("auditLogs", {
      institutionId: item.institutionId,
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "SYSTEM",
      action: "FEE_CONFIG_UPDATED",
      entity: "feeConfig",
      entityId: args.itemId,
      oldValue: JSON.stringify({ itemName: item.itemName, amount: item.amount, category: item.category }),
      newValue: JSON.stringify(updates),
      timestamp: Date.now(),
      success: true,
    });

    return { updated: true };
  },
});

/**
 * Remove a fee item from a level (FINANCE+).
 */
export const removeFeeItem = mutation({
  args: { itemId: v.id("feeConfig") },
  handler: async (ctx, args) => {
    const item = await ctx.db
      .query("feeConfig")
      .filter((q) => q.eq(q.field("_id"), args.itemId as any))
      .first();
    if (!item) throw new Error("Fee item not found");

    await requirePermission(ctx, "FINANCE", {
      institutionId: item.institutionId as any,
    });

    await ctx.db.delete(args.itemId);

    await ctx.db.insert("auditLogs", {
      institutionId: item.institutionId,
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "SYSTEM",
      action: "FEE_CONFIG_UPDATED",
      entity: "feeConfig",
      entityId: args.itemId,
      oldValue: JSON.stringify({ level: item.level, category: item.category, itemName: item.itemName, amount: item.amount }),
      timestamp: Date.now(),
      success: true,
    });

    return { deleted: true };
  },
});

/**
 * Get fee overview for the currently logged-in student.
 * Returns the active session + fee breakdown for their level.
 * STUDENT self-service query.
 */
export const getMyFeeOverview = query({
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

    // Get student record
    const student = await ctx.db
      .query("studentRecords")
      .filter((q) =>
        q.and(
          q.eq(q.field("matric"), matric),
          q.eq(q.field("institutionId"), user.institutionId as any)
        )
      )
      .first();

    if (!student) {
      throw new Error("Student record not found");
    }

    // Get active session
    const activeSession = await ctx.db
      .query("academicSessions")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), user.institutionId as any),
          q.eq(q.field("isActive"), true)
        )
      )
      .first();

    // Get fee items for student's level
    const feeItems = await ctx.db
      .query("feeConfig")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), user.institutionId as any),
          q.eq(q.field("level"), student.level)
        )
      )
      .collect();

    // Build breakdown
    const breakdown: Record<string, { items: Array<{ name: string; amount: number }>; total: number }> = {};
    for (const item of feeItems) {
      if (!breakdown[item.category]) {
        breakdown[item.category] = { items: [], total: 0 };
      }
      breakdown[item.category].items.push({ name: item.itemName, amount: item.amount });
      breakdown[item.category].total += item.amount;
    }

    const totalAmount = feeItems.reduce((sum, item) => sum + item.amount, 0);

    // Check if student has a completed payment this session
    // (we consider any completed payment as paid for the session)
    const existingPayment = await ctx.db
      .query("payments")
      .filter((q) =>
        q.and(
          q.eq(q.field("studentMatric"), matric),
          q.eq(q.field("institutionId"), user.institutionId as any),
          q.eq(q.field("status"), "completed")
        )
      )
      .first();

    return {
      student: {
        matric: student.matric,
        faculty: student.faculty,
        department: student.department,
        level: student.level,
      },
      session: activeSession
        ? { id: activeSession._id, name: activeSession.name, isActive: activeSession.isActive }
        : null,
      feeBreakdown: {
        categories: Object.entries(breakdown).map(([category, data]) => ({
          category,
          items: data.items,
          total: data.total,
        })),
        total: totalAmount,
      },
      hasPaid: !!existingPayment,
    };
  },
});

/**
 * Calculate total fee for a student based on their level (internal).
 */
export const calculateLevelFee = query({
  args: { institutionId: v.id("institutions"), level: v.number() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("feeConfig")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("level"), args.level)
        )
      )
      .collect();

    if (items.length === 0) {
      return { total: 0, tuition: 0, departmentDues: 0, facultyDues: 0, sugDues: 0, items: [] };
    }

    const breakdown: Record<string, number> = {};
    for (const item of items) {
      const key =
        item.category === "department_dues"
          ? "departmentDues"
          : item.category === "faculty_dues"
          ? "facultyDues"
          : item.category === "sug_dues"
          ? "sugDues"
          : "tuition";
      breakdown[key] = (breakdown[key] || 0) + item.amount;
    }

    return {
      total: items.reduce((sum, item) => sum + item.amount, 0),
      tuition: breakdown.tuition || 0,
      departmentDues: breakdown.departmentDues || 0,
      facultyDues: breakdown.facultyDues || 0,
      sugDues: breakdown.sugDues || 0,
      items: items.map((item) => ({
        id: item._id,
        category: item.category,
        name: item.itemName,
        amount: item.amount,
      })),
    };
  },
});
