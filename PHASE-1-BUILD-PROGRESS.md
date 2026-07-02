# PHASE 1 BUILD PROGRESS

**Project:** Split — Institutional Payment Routing Platform
**Hackathon:** Nomba Hackathon 2026
**Timeline:** 1 July – 7 July 2026 (Compressed to 3 days)
**Current Date:** 1 July 2026
**Build Phase:** Phase 1 — Foundation, Schema, Auth, Payments, Frontend Scaffolding
**Status:** ✅ Phase 1 Core Complete / 🏗️ Phase 2 Architecture & Multi-Role in Progress

---

## 📋 BUILD PROGRESS

### ✅ COMPLETED — Phase 1: Foundation

**Status: ✅ 100% Complete (28 files, ~3,500+ LOC)**

| Area | Details |
|------|---------|
| **Project Init** | Next.js 16 + Convex + Clerk + Tailwind configured |
| **Database Schema** | 7 tables (users, institutions, institutionRegistrations, studentRecords, payments, wallets, walletTransactions, withdrawalRequests, associations, auditLogs) |
| **Auth & RBAC** | Clerk JWT, 10-role hierarchy, multi-role support (roles array), role switching |
| **Payment Initiation** | Server-side amount calculation, Nomba API integration, idempotency |
| **Routing Engine** | Configurable allocation (fixed OR percentage per wallet), atomic routing |
| **Webhook Handler** | HMAC-SHA256 verification, idempotency, amount verification |
| **Wallet Queries** | 7 queries with RBAC (Finance, Dean, Student, Association views) |
| **Allocation Rules** | FINANCE configures per-wallet rules (fixed or percentage), mix supported |
| **Institution Onboarding** | Register → SUPER_ADMIN approves → institution created |
| **Withdrawal Consensus** | STUDENT_EXCO initiates → STAFF_ADVISOR approves → either executes |
| **Association Management** | STUDENT_AFFAIRS creates associations, assigns advisors/excos |
| **CSV Import** | Wallet + student import with idempotency |
| **Audit Trail** | 19 event types, 5 query filters, SUPER_ADMIN/INSTITUTION_ADMIN scoped |
| **Frontend** | 6 pages, 6 components, responsive layout |
| **Demo Data** | 9 wallets + 10 students |
| **Documentation** | master-plan.md, README.md, USERS-AND-USER-ROLES.md, this document |

### 🔧 COMPLETED — Phase 2: Architecture & Multi-Role

**Status: ✅ Backend Changes Complete (8 files updated/created)**

| Change | Details |
|--------|---------|
| **Multi-Role System** | `users.role` (single) → `users.roles` (array of strings) across ALL 8 backend files |
| **Active Role Switching** | `switchActiveRole` mutation for dashboard context switching |
| **Institution Onboarding** | `registerInstitution` (public) → `approveInstitution` (SUPER_ADMIN) → institution created |
| **9-Role RBAC** | SUPER_ADMIN, INSTITUTION_ADMIN, FINANCE, STUDENT_AFFAIRS, DEAN, HOD, STAFF_ADVISOR, STUDENT_EXCO, STUDENT, STAFF |
| **Configurable Allocation** | Each wallet independently configured as fixed ₦ amount OR percentage. Total fee = sum of fixed values. |
| **Withdrawal Consensus** | Initiate → Approve → Execute with full audit trail. Minimum balance enforcement. |
| **Association Management** | Create, assign staff advisor, assign/remove student exco |
| **Multi-Tenant Scoping** | All queries scoped by `institutionId`, entity-level access for DEAN/HOD/STAFF_ADVISOR/STUDENT_EXCO |

### 📋 REMAINING — What Needs To Be Done

| Priority | Task | Details |
|----------|------|---------|
| 🔴 **Critical** | Initialize Convex | Run `npx convex dev` to generate `_generated/` type definitions |
| 🔴 **Critical** | Fill in .env.local | Real credentials for Clerk, Convex, Nomba |
| 🔴 **Critical** | Clerk Admin API Integration | Wire up `bulkCreateStudents` and `createInstitutionUser` to Clerk's Admin API for actual user creation with temp passwords |
| 🔴 **Critical** | Clerk Sign-In Only Config | Disable public sign-up in Clerk dashboard |
| 🟡 **High** | Frontend: Institution Registration Page | Public registration form → SUPER_ADMIN approval panel |
| 🟡 **High** | Frontend: Role-Switching Dashboard | Unified dashboard with role switcher for multi-role users |
| 🟡 **High** | Frontend: Association Management UI | STUDENT_AFFAIRS creates/manages associations |
| 🟡 **High** | Frontend: Withdrawal UI | STUDENT_EXCO initiates, STAFF_ADVISOR approves/rejects |
| 🟡 **High** | Frontend: Allocation Rules UI | FINANCE configures fixed/percentage per wallet |
| 🟡 **High** | Frontend: Student Dashboard | Pay fees, view breakdown, transaction history |
| 🟡 **High** | Frontend: Staff Dashboard | Simple dashboard for allowance/payment history |
| 🟡 **High** | Frontend: Institutional Structure UI | Manage faculties, departments, fee amounts |
| 🟢 **Medium** | End-to-End Payment Testing | Complete flow: student pays → webhook → wallets credited |
| 🟢 **Medium** | RBAC Dashboard Testing | Verify each role sees correct data |
| 🟢 **Medium** | Mobile Responsiveness | Test all pages on mobile viewport |
| 🟣 **Deploy** | Deploy to Vercel | Configure env vars, deploy |
| 🟣 **Demo** | Record demo video | 2-3 min walkthrough of all features |

---

## 🏗️ BUILD DIRECTION — Where We're Heading

### Current Sprint Focus

The immediate focus is **getting the payment split working end-to-end** with real Nomba integration. Secondary focus is building the institutional onboarding + role management UI.

### Next Implementation Steps (Priority Order)

1. **Initialize Convex + Generate Types** (blocker for everything)
2. **Wire up Clerk Admin API** for user creation
3. **Build Frontend Pages** in this order:
   - Institution Registration (public) + SUPER_ADMIN Approval Panel
   - Unified Dashboard with Role Switcher
   - Student Pay Fee page
   - FINANCE Allocation Rules UI
   - Association Management UI (STUDENT_AFFAIRS)
   - Withdrawal Flow UI (STUDENT_EXCO initiate → STAFF_ADVISOR approve)
   - Staff Dashboard
4. **Test End-to-End:** Register institution → create users → student pays → wallets credited → withdrawal initiated → approved → executed
5. **Deploy to Vercel + Record Demo**

### Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Fee Model** | Computed from allocation rules | Total fee = sum of fixed values. FINANCE configures per-faculty/department. |
| **Target Users** | Undergraduates (100-500 level) | Student associations are undergrad-focused for MVP |
| **Withdrawal Consensus** | Exco initiates → Advisor approves → either executes | Two-party consensus ensures oversight |
| **Multi-Role** | Single user, multiple roles, switchable dashboard | A student can also be STUDENT_EXCO without separate accounts |
| **Wallet Minimum Balance** | 0 default, enforced on all debit operations | Prevents wallets going negative |
| **Authentication** | Clerk sign-in only (no public sign-up) | Users created by admin via CSV or manual creation |
| **User Creation** | Clerk Admin API + Convex record | Clerk handles password hashing, invites, "change on first login" |
| **Staff Onboarding** | INSTITUTION_ADMIN creates staff accounts | STAFF role can also be assigned STAFF_ADVISOR for associations |
| **Role Assignment Chain** | SUPER_ADMIN → INSTITUTION_ADMIN → DEAN → HOD → STAFF_ADVISOR → STUDENT_EXCO | Clear delegation hierarchy |

### Environment Variables Required

| Variable | Source | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard | Frontend Clerk auth |
| `CLERK_SECRET_KEY` | Clerk Dashboard | Backend Clerk Admin API calls |
| `NEXT_PUBLIC_CONVEX_URL` | Convex Dashboard | Frontend Convex client |
| `NEXT_PUBLIC_APP_URL` | Deploy URL | Webhook callbacks, redirects |
| `NOMBA_API_KEY` | Nomba Dashboard | Payment initiation API |
| `NOMBA_SECRET_KEY` | Nomba Dashboard | Webhook HMAC verification |
| `NOMBA_BASE_URL` | Nomba Docs | API endpoint (sandbox/prod) |

---

## 📁 COMPLETE FILE TREE

```
split-nomba/
│
├── 📄 PHASE-1-BUILD-PROGRESS.md      ← THIS DOCUMENT
├── 📄 USERS-AND-USER-ROLES.md        ← Role matrix, functions, user stories
├── 📄 master-plan.md                 ← Original build plan
├── 📄 README.md                      ← Project documentation
├── 📄 .env.example                   ← Required env vars template
├── 📄 .env.local                     ← ⚠️ Fill in with real credentials
├── 📄 .gitignore
├── 📄 package.json
│
├── 📁 convex/                        ← BACKEND (11 files)
│   ├── schema.ts                     │  Database schema (7 tables)
│   ├── auth.ts                       │  Multi-role RBAC, onboarding, user mgmt
│   ├── payments.ts                   │  Payment initiation + configurable routing
│   ├── withdrawals.ts                │  Withdrawal consensus (Exco→Advisor)
│   ├── associations.ts               │  Association creation + assignment
│   ├── wallets.ts                    │  Wallet queries with RBAC
│   ├── studentRecords.ts             │  CSV student import
│   ├── auditLogs.ts                  │  Immutable audit trail
│   ├── import.ts                     │  CSV wallet import
│   ├── users.ts                      │  User management (delegates to auth.ts)
│   └── convex.config.ts
│
├── 📁 src/                           ← FRONTEND
│   ├── 📁 app/
│   │   ├── layout.tsx                │  ClerkProvider + Navbar
│   │   ├── page.tsx                  │  Landing page
│   │   ├── globals.css
│   │   ├── 📁 pay/                   │  Payment page (needs institution reg first)
│   │   ├── 📁 dashboard/             │  Role-switching dashboard
│   │   ├── 📁 admin/                 │  Import pages, audit viewer
│   │   └── 📁 api/webhooks/nomba/    │  HMAC-verified webhook handler
│   │
│   └── 📁 components/
│       ├── StudentPaymentForm.tsx
│       ├── WalletDashboard.tsx
│       ├── AuditLogViewer.tsx
│       └── 📁 dashboards/
│           ├── FinanceDashboard.tsx
│           ├── DeanDashboard.tsx
│           └── StudentDashboard.tsx
│
└── 📁 data/
    ├── wallets.csv
    └── students.csv
```

---

## 🔒 SECURITY CONTROLS STATUS

| # | Control | Status | Location |
|---|---------|--------|----------|
| 1 | Server-Side Amount Calculation | ✅ Implemented | `convex/payments.ts:initiatePayment` |
| 2 | Request-Level Idempotency | ✅ Implemented | `convex/payments.ts:initiatePayment` |
| 3 | Webhook Signature Verification | ✅ Implemented | `src/app/api/webhooks/nomba/route.ts` |
| 4 | Webhook-Level Idempotency | ✅ Implemented | `src/app/api/webhooks/nomba/route.ts` |
| 5 | Amount Verification | ✅ Implemented | `src/app/api/webhooks/nomba/route.ts` |
| 6 | Immutable Transaction Ledger | ✅ Implemented | `convex/schema.ts` (walletTransactions) |
| 7 | Minimum Balance Enforcement | ✅ Implemented | `convex/withdrawals.ts` + schema |
| 8 | Institution Scoping | ✅ Implemented | All queries include `institutionId` filter |
| 9 | Multi-Role Permission Check | ✅ Implemented | `auth.ts:requirePermission` checks ANY role |

---

*Generated: 1 July 2026 | Build Progress + Direction Document*

