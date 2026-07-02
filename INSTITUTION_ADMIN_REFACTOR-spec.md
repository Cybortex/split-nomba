# INSTITUTION_ADMIN_REFACTOR — Specification

## 1. Overview

Refactor the current `InstitutionAdminDashboard` and `FinanceDashboard` to clearly separate responsibilities between the **INSTITUTION_ADMIN** and **FINANCE** roles. The INSTITUTION_ADMIN manages the institution's people and structure (users, students, staff, academic sessions, settings). The FINANCE role handles financial configuration (fee items, allocation rules, wallet oversight).

Additionally, fix the **STAFF** role — add it to the role hierarchy and build a proper personal dashboard.

---

## 2. Role Responsibilities (Updated)

| Role | Responsibilities |
|------|-----------------|
| **SUPER_ADMIN** | Global platform oversight, approve institutions, cross-institution audit |
| **INSTITUTION_ADMIN** | Manage users, students (import/edit/graduate), staff (assign to depts), academic sessions, institution profile |
| **FINANCE** | Configure fees per level/session, configure allocation rules, view wallets/transactions |
| **STUDENT_AFFAIRS** | Create/manage associations, assign advisors, promote students to excos from student body (see §5.7) |
| **DEAN** | Faculty wallet oversight (unchanged) |
| **HOD** | Department wallet oversight (unchanged) |
| **STAFF** | View personal allowance/payment history, link Nomba account |
| **STAFF_ADVISOR** | Approve/reject association withdrawals (unchanged) |
| **STUDENT_EXCO** | Initiate association withdrawals (unchanged) |
| **STUDENT** | Pay fees, view transparency (unchanged) |

---

## 3. ROLE_HIERARCHY Update

Add `STAFF` to `convex/auth.ts`:

```
STAFF: 25  (between STUDENT_EXCO: 20 and STAFF_ADVISOR: 30)
```

This means:
- `ALL_ROLES` now includes `"STAFF"` (auto-derived from `Object.keys(ROLE_HIERARCHY)`)
- STAFF users are below STAFF_ADVISOR (30) but above STUDENT_EXCO (20) and STUDENT (10)
- STAFF can read their own allowance data but cannot perform admin actions

---

## 4. Database Schema Changes

### 4.1 New: `academicSessions` table

```typescript
academicSessions: defineTable({
  institutionId: v.id("institutions"),
  name: v.string(),                           // e.g., "2025/2026"
  startDate: v.number(),                      // timestamp
  endDate: v.number(),                        // timestamp
  isActive: v.boolean(),                      // only one active per institution
  createdAt: v.number(),
}).index("by_institution", ["institutionId"])
 .index("by_institution_active", ["institutionId", "isActive"])
```

- Only **one** active session per institution at a time
- When a new session is activated, the old session's `isActive` is set to `false`
- Fee configs reference sessions via `sessionId` (see below)

### 4.2 Update: `feeConfig` table

Add optional `sessionId` field:

```typescript
feeConfig: defineTable({
  institutionId: v.id("institutions"),
  sessionId: v.optional(v.id("academicSessions")),  // NEW
  level: v.number(),
  category: FEE_CATEGORY,
  itemName: v.string(),
  amount: v.number(),
})
  .index("by_institution_level", ["institutionId", "level"])
  .index("by_institution", ["institutionId"])
  .index("by_session", ["sessionId"])               // NEW index
```

- When fees are configured, they belong to a session
- `sessionId` is optional for backward compatibility (existing fee configs)
- FINANCE configures fees per session
- Old session fees are preserved for auditing

### 4.3 Update: `studentRecords` table

Add optional `sessionId` field:

```typescript
studentRecords: defineTable({
  institutionId: v.id("institutions"),
  sessionId: v.optional(v.id("academicSessions")),  // NEW
  matric: v.string(),
  faculty: v.string(),
  department: v.string(),
  level: v.number(),
  email: v.string(),
  status: STUDENT_STATUS,
})
  .index("by_matric", ["matric"])
  .index("by_institution", ["institutionId"])
  .index("by_faculty", ["faculty"])
  .index("by_session", ["sessionId"])               // NEW index
```

### 4.4 Update: `institutions` table

Add optional contact fields:

```typescript
institutions: defineTable({
  name: v.string(),
  registrationId: v.id("institutionRegistrations"),
  adminClerkId: v.string(),
  isActive: v.boolean(),
  createdAt: v.number(),
  // NEW fields for Institution Admin editing:
  phone: v.optional(v.string()),
  address: v.optional(v.string()),
  website: v.optional(v.string()),
})
```

---

## 5. Backend Changes

### 5.1 New: `convex/sessions.ts`

Queries and mutations for academic sessions:

- **`createSession`** (INSTITUTION_ADMIN+) — Create a new session. If `isActive: true`, deactivates any current active session for that institution.
- **`activateSession`** (INSTITUTION_ADMIN+) — Set a session as active (deactivates others).
- **`getActiveSession`** (role: STUDENT+) — Get the active session for an institution.
- **`listSessions`** (INSTITUTION_ADMIN+) — List all sessions for an institution.

### 5.2 New: `convex/staff.ts`

Backend for STAFF role personal dashboard:

- **`getMyAllowances`** (STAFF+) — Query to get allowance/payment history for the current staff user (by their permissions/entityId).
- **`getStaffProfile`** (STAFF+) — Query to get staff profile including Nomba account link status.

### 5.3 Update: `convex/auth.ts`

- Add `STAFF: 25` to `ROLE_HIERARCHY` mapping
- Add `getInstitutionStaff` query (INSTITUTION_ADMIN+) — List all users with STAFF role in an institution, filtered by optional department
- Add `assignStaffToDepartment` mutation (INSTITUTION_ADMIN+) — Update a STAFF user's permissions to include a department entityId

### 5.4 Update: `convex/studentRecords.ts`

Add or verify:
- **`addStudent`** (INSTITUTION_ADMIN+) — Add a single student record individually
- **`updateStudentStatus`** (INSTITUTION_ADMIN+) — Change a student's status (active → graduated/withdrawn)
- **`updateStudentRecord`** (INSTITUTION_ADMIN+) — Edit student details (matric, faculty, department, level, email)
- CSV import student already exists

### 5.5 Update: `convex/fees.ts`

- Update all fee queries/mutations to support optional `sessionId` filtering
- `getFeeSummary` should accept optional `sessionId` to show fees for a specific session
- `getFeeSummary` returns fees for active session if `sessionId` not provided

### 5.6 Update: `convex/institutions.ts` (or `auth.ts`)

- **`updateInstitutionProfile`** (INSTITUTION_ADMIN+) — Edit institution name, phone, address, website

### 5.7 Update: `convex/associations.ts` — Exco Assignment from Student Body

**Problem**: Currently `assignStudentExco` requires the target user to already have the `STUDENT_EXCO` role. This forces Student Affairs admins to first assign the STUDENT_EXCO role via User Management, then go to Associations to link them. It also limits the dropdown to only users already tagged as excos.

**Fix**: Student Affairs should be able to select from **all students** in the institution and promote them to exco in one action.

**Changes to `assignStudentExco`**:
- Remove the check `if (!excoUser.roles.includes("STUDENT_EXCO"))`
- Instead, when a non-exco student is assigned:
  1. Add `STUDENT_EXCO` to the user's `roles` array
  2. Add the association's `entityId` to the user's `permissions` array
  3. Add the user's `clerkId` to the association's `studentExcoClerkIds`
- If the user already has STUDENT_EXCO role, just update permissions and association (current behavior)

**Changes to `removeStudentExco`**:
- Currently just removes the permission and association link
- Should also remove `STUDENT_EXCO` from the user's roles IF they were only assigned to this one association
- If they are excos for multiple associations, keep the role but remove the permission

**New: `listStudents` query for dropdown** — Student Affairs needs to select from all students:
- `api.studentRecords.listStudents` exists already (INSTITUTION_ADMIN+ permission)
- Need to either lower permission or add a new query `api.studentRecords.listStudentsByInstitution` (STUDENT_AFFAIRS+)

**Frontend impact**:
- `StudentAffairsDashboard` "Add Exco" dropdown should query ALL students, not just existing excos
- Dropdown shows: `Email - Matric - Department` for clear identification
- When a student without STUDENT_EXCO role is selected, the mutation handles the role upgrade atomically

---

## 6. Frontend: INSTITUTION_ADMIN Dashboard

### 6.1 Dashboard routed

`dashboard/page.tsx`:
- `INSTITUTION_ADMIN` → `<InstitutionAdminDashboard />` (UPDATED)
- `FINANCE` → `<FinanceDashboard />` (UPDATED with fees + allocation tabs)

### 6.2 InstitutionAdminDashboard tabs

**Tab set:** Overview | Users | Students | Staff | Sessions | Settings

#### Overview Tab
- Stats cards: Total Users, Total Students, Active Session name, Staff count
- Quick links/info: institution name, current session period

#### Users Tab (exists, move from current dashboard)
- Same as current UsersTab: list users, add/remove roles, deactivate
- Remove "STAFF" from ASSIGNABLE_ROLES (since Staff has its own tab)
- Keep: FINANCE, STUDENT_AFFAIRS, DEAN, HOD, STAFF_ADVISOR, STUDENT_EXCO, STUDENT

#### Students Tab (NEW)
- **Stats bar**: Total students, by faculty/department breakdown, by level
- **Bulk Import**: CSV upload (reuse existing import flow or link to /admin/import-students)
- **Add Student**: Inline form: Matric, Email, Faculty, Department, Level, Session (optional)
- **Student List**: Table with columns: Matric, Email, Faculty, Department, Level, Status, Actions
- **Actions per student**: Edit details, Change Status (active/graduated/withdrawn)
- **Filter bar**: Filter by faculty, department, level, status

#### Staff Tab (NEW)
- **List STAFF users**: Show all users with STAFF role, their email, assigned department(s), status
- **Assign Staff Role**: Button to add STAFF role to users (from available non-STAFF users)
- **Assign to Department**: Dropdown per staff member to set their department permission (entityId)
- **Remove Staff Role**: Remove STAFF role from a user
- **Deactivate**: Deactivate a staff user

#### Sessions Tab (NEW)
- **Active Session Banner**: Shows current active session prominently
- **Create Session Form**: Name, Start Date, End Date
- **Session List**: Table with name, period, status (Active/Inactive), created date
- **Activate Button**: Set a session as active (deactivates current)
- **Info text**: "Fees are configured per session by the Finance team. Activating a new session lets Finance set up new fees."

#### Settings Tab (NEW)
- **Institution Profile Form**: Name, Phone, Address, Website
- **Save button** → calls `updateInstitutionProfile` mutation
- **Read-only info**: Registration ID, Created date, Admin email

---

## 7. Frontend: FINANCE Dashboard Update

### 7.1 New tabs for FINANCE

Current FinanceDashboard (wallet overview) becomes the Overview tab. Add:

#### Fees Tab (MOVED from InstitutionAdminDashboard)
- Same as current FeesTab: level selector, fee items, add/remove items
- **New: Session selector** — dropdown showing sessions (defaults to active session)
- Fee items are filtered by selected session
- Add fee item form includes session (auto-set to selected session)

#### Allocation Tab (MOVED from InstitutionAdminDashboard)
- Same as current AllocationTab: current rules, add rule form
- No changes needed — allocation rules are institution-wide, not per-session

---

## 8. Frontend: STAFF Dashboard (NEW)

### 8.1 `src/components/dashboards/StaffDashboard.tsx` (REWRITE)

Replace the current placeholder with:

- **Header**: "Staff Dashboard — Personal Allowances"
- **Stats cards**:
  - Total allowances received (sum of credits)
  - Last payment amount + date
  - Nomba account link status (Linked / Not Linked)
- **Allowance History Table**: Date, Amount, Description/Reason, Status
- **Nomba Account Section**: Button/link to link Nomba account (or status indicator if already linked)
- **Empty state**: "No allowances recorded yet" with instructional text

---

## 9. ACTION_AUDIT Updates

Add new audit actions for new functionality:

```
v.literal("SESSION_CREATED"),
v.literal("SESSION_ACTIVATED"),
v.literal("STUDENT_ADDED"),
v.literal("STUDENT_UPDATED"),
v.literal("STUDENT_STATUS_CHANGED"),
v.literal("INSTITUTION_UPDATED"),
v.literal("STAFF_ALLOWANCE_PAID"),
```

---

## 10. Implementation Order

1. **Schema changes** — Add `academicSessions` table, update `feeConfig`, `studentRecords`, `institutions`
2. **ROLE_HIERARCHY** — Add `STAFF: 25` to `auth.ts`
3. **Backend queries/mutations** — Create `convex/sessions.ts`, `convex/staff.ts`, update `convex/studentRecords.ts`, `convex/auth.ts`, `convex/fees.ts`, `convex/institutions.ts`
4. **Rewrite FinanceDashboard** — Add Fees and Allocation tabs alongside Overview
5. **Rewrite InstitutionAdminDashboard** — New tab set: Overview, Users, Students, Staff, Sessions, Settings
6. **Rewrite StaffDashboard** — Personal allowance view
7. **Update routing** — `dashboard/page.tsx` routes
8. **Remove dead code** — Remove STAFF from ASSIGNABLE_ROLES in old admin users page if superseded, clean up old `StaffDashboard.tsx` placeholder references
9. **Build & test** — Verify zero errors, test all tabs render

---

## 11. Open Questions / Future Considerations

- What data feeds the STAFF "allowances"? Is there an existing payroll/allowance system, or does this need a new backend module for disbursing staff allowances?
- Student CSV import format — needs to include session mapping once sessions exist
- Should the Overview tab stats be a separate backend query (like `getAdminOverview`) or computed from existing queries?
