import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const REGISTRATION_STATUS = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"));
const STUDENT_STATUS = v.union(v.literal("active"), v.literal("graduated"), v.literal("withdrawn"));
const ASSOCIATION_TYPE = v.union(v.literal("sug"), v.literal("faculty"), v.literal("department"));
const PAYMENT_STATUS = v.union(v.literal("pending"), v.literal("completed"), v.literal("failed"), v.literal("cancelled"));
const WALLET_TYPE = v.union(v.literal("faculty"), v.literal("department"), v.literal("association"), v.literal("institution"));
const TXN_DIRECTION = v.union(v.literal("credit"), v.literal("debit"));
const WITHDRAWAL_STATUS = v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("completed"));
const FEE_CATEGORY = v.union(v.literal("tuition"), v.literal("department_dues"), v.literal("faculty_dues"), v.literal("sug_dues"));
const ALLOCATION_WALLET_TYPE = v.union(v.literal("institution"), v.literal("faculty"), v.literal("department"), v.literal("association"), v.literal("ict"));
const AUDIT_ACTION = v.union(
  v.literal("INSTITUTION_REGISTERED"),
  v.literal("INSTITUTION_APPROVED"),
  v.literal("INSTITUTION_REJECTED"),
  v.literal("PAYMENT_INITIATED"),
  v.literal("PAYMENT_VERIFIED"),
  v.literal("WALLET_CREDITED"),
  v.literal("WITHDRAWAL_INITIATED"),
  v.literal("WITHDRAWAL_APPROVED"),
  v.literal("WITHDRAWAL_REJECTED"),
  v.literal("WITHDRAWAL_COMPLETED"),
  v.literal("PAYMENT_FAILED"),
  v.literal("PERMISSION_CHECK_PASSED"),
  v.literal("PERMISSION_CHECK_FAILED"),
  v.literal("ADMIN_BULK_IMPORT"),
  v.literal("USER_ROLE_CHANGED"),
  v.literal("ALLOCATION_RULES_UPDATED"),
  v.literal("FEE_CONFIG_UPDATED"),
  v.literal("ASSOCIATION_CREATED"),
  v.literal("ASSOCIATION_ASSIGNED"),
  v.literal("DASHBOARD_VIEWED"),
  v.literal("SESSION_CREATED"),
  v.literal("SESSION_ACTIVATED"),
  v.literal("STUDENT_ADDED"),
  v.literal("STUDENT_UPDATED"),
  v.literal("STUDENT_STATUS_CHANGED"),
  v.literal("INSTITUTION_UPDATED"),
  v.literal("STAFF_ALLOWANCE_PAID")
);

export default defineSchema({
  // ===== INSTITUTION ONBOARDING =====
  institutionRegistrations: defineTable({
    name: v.string(),
    adminEmail: v.string(),
    adminName: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    status: REGISTRATION_STATUS,
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  institutions: defineTable({
    name: v.string(),
    registrationId: v.optional(v.id("institutionRegistrations")),
    adminClerkId: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    website: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_adminClerkId", ["adminClerkId"]),

  // ===== IDENTITY & ACCESS =====
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    roles: v.array(v.string()),
    activeRole: v.optional(v.string()),
    // institutionId is REQUIRED for all non-SUPER_ADMIN users.
    // SUPER_ADMIN users are global and have no institution.
    institutionId: v.optional(v.id("institutions")),
    permissions: v.array(v.string()),
    isActive: v.boolean(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_institution", ["institutionId"]),

  // ===== FEE CONFIGURATION (Per Level) =====
  feeConfig: defineTable({
    institutionId: v.id("institutions"),
    level: v.number(),
    category: FEE_CATEGORY,
    itemName: v.string(),
    amount: v.number(),
  })
    .index("by_institution_level", ["institutionId", "level"])
    .index("by_institution", ["institutionId"]),

  // ===== STUDENT RECORDS =====
  studentRecords: defineTable({
    institutionId: v.id("institutions"),
    matric: v.string(),
    faculty: v.string(),
    department: v.string(),
    facultySlug: v.optional(v.string()),
    departmentSlug: v.optional(v.string()),
    level: v.number(),
    email: v.string(),
    status: STUDENT_STATUS,
  })
    .index("by_matric", ["matric"])
    .index("by_institution", ["institutionId"])
    .index("by_faculty", ["faculty"]),

  // ===== ASSOCIATIONS =====
  associations: defineTable({
    institutionId: v.id("institutions"),
    name: v.string(),
    slug: v.string(),
    type: ASSOCIATION_TYPE,
    facultyId: v.optional(v.string()),
    departmentId: v.optional(v.string()),
    entityId: v.string(),
    staffAdvisorClerkId: v.optional(v.string()),
    studentExcoClerkIds: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_entityId", ["entityId"])
    .index("by_type", ["type"]),

  // ===== PAYMENTS =====
  payments: defineTable({
    institutionId: v.id("institutions"),
    nombaTransactionId: v.string(),
    reference: v.string(),
    studentMatric: v.string(),
    faculty: v.string(),
    department: v.string(),
    level: v.number(),
    amount: v.number(),
    status: PAYMENT_STATUS,
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    // Fee breakdown for routing (stored at creation, used by webhook)
    feeTuition: v.optional(v.number()),
    feeSugDues: v.optional(v.number()),
    feeFacultyDues: v.optional(v.number()),
    feeDepartmentDues: v.optional(v.number()),
    facultySlug: v.optional(v.string()),
    departmentSlug: v.optional(v.string()),
    platformFee: v.optional(v.number()),
  })
    .index("by_reference", ["reference"])
    .index("by_nombaTransactionId", ["nombaTransactionId"])
    .index("by_institution", ["institutionId"])
    .index("by_matric", ["studentMatric"])
    .index("by_status", ["status"]),

  // ===== WALLETS =====
  wallets: defineTable({
    institutionId: v.id("institutions"),
    type: WALLET_TYPE,
    entityId: v.string(),
    name: v.string(),
    associationId: v.optional(v.id("associations")),
    totalCollected: v.number(),
    availableBalance: v.number(),
    minimumBalance: v.number(),
    transactionCount: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_type", ["type"])
    .index("by_entityId", ["entityId"]),

  // ===== IMMUTABLE TRANSACTION LEDGER =====
  walletTransactions: defineTable({
    walletId: v.id("wallets"),
    institutionId: v.id("institutions"),
    paymentReference: v.string(),
    amount: v.number(),
    direction: TXN_DIRECTION,
    reason: v.string(),
    timestamp: v.number(),
  })
    .index("by_wallet", ["walletId"])
    .index("by_institution", ["institutionId"])
    .index("by_paymentReference", ["paymentReference"]),

  // ===== WITHDRAWAL REQUESTS =====
  withdrawalRequests: defineTable({
    institutionId: v.id("institutions"),
    associationId: v.id("associations"),
    walletId: v.id("wallets"),
    amount: v.number(),
    reason: v.string(),
    initiatedBy: v.string(),
    approvedBy: v.optional(v.string()),
    status: WITHDRAWAL_STATUS,
    rejectionReason: v.optional(v.string()),
    createdAt: v.number(),
    approvedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_institution", ["institutionId"])
    .index("by_association", ["associationId"])
    .index("by_status", ["status"]),

  // ===== ACADEMIC SESSIONS =====
  academicSessions: defineTable({
    institutionId: v.id("institutions"),
    name: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_institution_active", ["institutionId", "isActive"]),

  // ===== IMMUTABLE AUDIT TRAIL =====
  auditLogs: defineTable({
    // institutionId is REQUIRED for institution-scoped events (payments, user mgmt, etc.)
    // Only omitted for truly global events like INSTITUTION_REGISTERED (before institution exists).
    institutionId: v.optional(v.id("institutions")),
    userId: v.string(),
    action: AUDIT_ACTION,
    entity: v.string(),
    entityId: v.string(),
    oldValue: v.optional(v.string()),
    newValue: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
    success: v.boolean(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_userId", ["userId"])
    .index("by_action", ["action"])
    .index("by_timestamp", ["timestamp"]),
});
