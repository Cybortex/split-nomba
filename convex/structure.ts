import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePermission } from "./auth";

export const createFaculty = mutation({
  args: {
    institutionId: v.id("institutions"),
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    const normalizedSlug = args.slug.trim().toUpperCase();

    // Check for duplicate slug in this institution
    const existing = await ctx.db
      .query("faculties")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("slug"), normalizedSlug)
        )
      )
      .first();

    if (existing) {
      throw new Error(`Faculty with slug "${normalizedSlug}" already exists`);
    }

    const facultyId = await ctx.db.insert("faculties", {
      institutionId: args.institutionId,
      name: args.name.trim(),
      slug: normalizedSlug,
      isActive: true,
      createdAt: Date.now(),
    });

    return facultyId;
  },
});

export const createDepartment = mutation({
  args: {
    institutionId: v.id("institutions"),
    facultyId: v.id("faculties"),
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requirePermission(ctx, "INSTITUTION_ADMIN", {
      institutionId: args.institutionId as any,
    });

    const normalizedSlug = args.slug.trim().toUpperCase();

    // Check for duplicate slug in this institution
    const existing = await ctx.db
      .query("departments")
      .filter((q) =>
        q.and(
          q.eq(q.field("institutionId"), args.institutionId as any),
          q.eq(q.field("slug"), normalizedSlug)
        )
      )
      .first();

    if (existing) {
      throw new Error(`Department with slug "${normalizedSlug}" already exists`);
    }

    const departmentId = await ctx.db.insert("departments", {
      institutionId: args.institutionId,
      facultyId: args.facultyId,
      name: args.name.trim(),
      slug: normalizedSlug,
      isActive: true,
      createdAt: Date.now(),
    });

    return departmentId;
  },
});

export const listFaculties = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("faculties")
      .filter((q) => q.eq(q.field("institutionId"), args.institutionId as any))
      .collect();
  },
});

export const listDepartments = query({
  args: { 
    institutionId: v.id("institutions"),
    facultyId: v.optional(v.id("faculties")),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("departments")
      .filter((q) => q.eq(q.field("institutionId"), args.institutionId as any))
      .collect();
    
    if (args.facultyId) {
      return results.filter((d) => d.facultyId === args.facultyId);
    }
    return results;
  },
});
