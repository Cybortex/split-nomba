import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ===== IDENTITY & ACCESS =====
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.enum(
      "SUPER_ADMIN",
      "FINANCE",
      "STUDENT_AFFAIRS",
      "DEAN",
      "HOD",
      "ADVISOR",
      "STUDENT"
    ),
    permissions: v.array(v.string()),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_role", ["role"]),

  institutions: defineTable({
    name: v.string(),
    adminEmail: v.string(),
  }).index("by_adminEmail", ["adminEmail"]),

  // ===== STUDENT RECORDS =====
  studentRecords: defineTable({
    matric: v.string(),
    faculty: v.string(),
    department: v.string(),
    level: v.number(),
    email: v.string(),
    status: v.enum("active", "graduated", "withdrawn"),
  })
    .index("by_matric", ["matric"])
    .index("by_faculty", ["faculty"]),

  // ===== PAYMENTS =====
  payments: defineTable({
    nombaTransactionId: v.string(),
    reference: v.string(),
    studentMatric: v.string(),
    faculty: v.string(),
    department: v.string(),
    level: v.number(),
    amount: v.number(),
    status: v.enum("pending", "completed", "failed", "cancelled"),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_reference", ["reference"])
    .index("by_nombaTransactionId", ["nombaTransactionId"])
    .index("by_matric", ["studentMatric"])
    .index("by_status", ["status"]),

  // ===== WALLETS =====
  wallets: defineTable({
    type: v.enum("faculty", "department", "association", "institution"),
    entityId: v.string(),
    name: v.string(),
    totalCollected: v.number(),
    availableBalance: v.number(),
    transactionCount: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_entityId", ["entityId"]),

  // ===== IMMUTABLE TRANSACTION LEDGER =====
  walletTransactions: defineTable({
    walletId: v.id("wallets"),
    paymentReference: v.string(),
    amount: v.number(),
    direction: v.enum("credit", "debit"),
    reason: v.string(),
    timestamp: v.number(),
  })
    .index("by_wallet", ["walletId"])
    .index("by_paymentReference", ["paymentReference"]),

  // ===== IMMUTABLE AUDIT TRAIL =====
  auditLogs: defineTable({
    userId: v.string(),
    action: v.enum(
      "PAYMENT_INITIATED",
      "PAYMENT_VERIFIED",
      "WEBHOOK_RECEIVED",
      "WALLET_CREDITED",
      "PAYMENT_FAILED",
      "PERMISSION_CHECK_PASSED",
      "PERMISSION_CHECK_FAILED",
      "ADMIN_BULK_IMPORT",
      "USER_ROLE_CHANGED",
      "DASHBOARD_VIEWED"
    ),
    entity: v.string(),
    entityId: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    success: v.boolean(),
  })
    .index("by_userId", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),
});
