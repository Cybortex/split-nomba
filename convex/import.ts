import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Import wallets from CSV (INSTITUTION_ADMIN or SUPER_ADMIN).
 * Idempotent: skips duplicates based on entityId within institution.
 */
export const importWallets = action({
  args: {
    csvContent: v.string(),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    const i = internal as any;
    const user = await ctx.runQuery(i.auth.getCurrentUser);
    if (!user || !user.roles.some((r: string) => ["INSTITUTION_ADMIN", "SUPER_ADMIN"].includes(r))) {
      throw new Error("Only INSTITUTION_ADMIN can import wallets");
    }

    if (
      !user.roles.includes("SUPER_ADMIN") &&
      user.institutionId?.toString() !== args.institutionId.toString()
    ) {
      throw new Error("Cannot import wallets for another institution");
    }

    const lines = args.csvContent.trim().split("\n");
    if (lines.length < 2) {
      throw new Error("CSV must have a header row and at least one data row");
    }

    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredFields = ["type", "name", "entityid"];
    for (const field of requiredFields) {
      if (!header.includes(field)) {
        throw new Error(`CSV missing required column: ${field}`);
      }
    }

    const results: Array<{ entityId: string; walletId: any }> = [];
    const duplicates: string[] = [];

    for (const line of lines.slice(1)) {
      if (!line.trim()) continue;

      const values = line.split(",").map((v) => v.trim());
      const type = values[header.indexOf("type")] || "";
      const name = values[header.indexOf("name")] || "";
      const entityId = values[header.indexOf("entityid")] || "";

      if (!type || !name || !entityId) continue;
      if (!["faculty", "department", "association", "institution"].includes(type)) continue;

      // Check for existing wallet within institution
      const existing = await ctx.runQuery(i.wallets.getByEntityIdInternal, {
        entityId,
        institutionId: args.institutionId,
      });

      if (existing) {
        duplicates.push(entityId);
        continue;
      }

      const walletId = await ctx.runMutation(i.wallets.createWallet, {
        institutionId: args.institutionId,
        type,
        entityId,
        name,
        totalCollected: 0,
        availableBalance: 0,
        transactionCount: 0,
      });

      results.push({ entityId, walletId });
    }

    // Log import
    await ctx.runMutation(i.paymentsInternal.logAudit, {
      institutionId: args.institutionId,
      action: "ADMIN_BULK_IMPORT",
      entityId: "institution-wallets",
      newValue: {
        imported: results.length,
        skipped: duplicates.length,
      },
      success: true,
    });

    return {
      imported: results.length,
      skipped: duplicates.length,
      duplicates,
    };
  },
});
