# User Role Capabilities & Dashboard Reference

> **Last Updated:** July 3, 2026  
> **Project:** Nomba Split Payment System

## Role Hierarchy

| Role | Level | Scope | Route |
|------|-------|-------|-------|
| SUPER_ADMIN | 100 | Global (no institution) | `/admin/*` |
| INSTITUTION_ADMIN | 80 | Single institution | `/dashboard` |
| FINANCE | 70 | Single institution | `/dashboard` |
| STUDENT_AFFAIRS | 60 | Single institution | `/dashboard` |
| DEAN | 50 | Faculty scope | `/dashboard` |
| HOD | 40 | Department scope | `/dashboard` |
| STAFF_ADVISOR | 30 | Association scope | `/dashboard` |
| STUDENT_EXCO | 20 | Association scope | `/dashboard` |
| STAFF | 15 | Personal | `/dashboard` |
| STUDENT | 10 | Personal | `/dashboard` |

---

## 1. SUPER_ADMIN (Level 100)

**Route:** `/admin/*` (dedicated route group with sidebar navigation)

### Pages

| Page | URL | Backend Source | What It Shows |
|------|-----|---------------|---------------|
| **Overview** | `/admin` | `api.admin.getGlobalStats`, `api.auth.listPendingRegistrations` | 4 global stat cards (Institutions, Active Users, Payments, Volume) + pending approvals quick-link |
| **Approvals** | `/admin/approvals` | `api.auth.listPendingRegistrations`, `api.auth.approveInstitution`, `api.auth.rejectInstitution` | List of pending institution registrations with Approve/Reject buttons |
| **Institutions** | `/admin/institutions` | `api.admin.getInstitutionSummaries`, `api.auth.createInstitutionDirect` | Institutions table (search, sort by volume) + "New Institution" modal to create institution + INSTITUTION_ADMIN user |
| **Audit** | `/admin/audit` | `api.admin.getRecentAuditLogs` | Activity feed with status filter (All/Success/Failed) + search |

### Actions
- Create institution directly (with INSTITUTION_ADMIN user)
- Approve/reject institution registrations
- View global platform stats
- View all institutions with payment data
- View cross-institution audit trail

---

## 2. INSTITUTION_ADMIN (Level 80)

**Route:** `/dashboard` (tabbed: Overview, Users, Sessions)

### Tab: Overview
| Data | Backend |
|------|---------|
| Wallet stats (4 cards) | `api.wallets.listAll` |
| Wallet type breakdown tables | `api.wallets.listAll` |
| Student count | `api.studentRecords.listStudents` |

### Tab: Users
| Data | Backend |
|------|---------|
| List institution users | `api.auth.listInstitutionUsers` |
| Add role to user | `api.auth.addUserRole` |
| Remove role from user | `api.auth.removeUserRole` |
| Deactivate user | `api.auth.deactivateUser` |
| **Assignable roles:** FINANCE, STUDENT_AFFAIRS, DEAN, HOD, STAFF, STAFF_ADVISOR, STUDENT_EXCO, STUDENT |
| **Cannot assign:** SUPER_ADMIN, INSTITUTION_ADMIN |

### Tab: Sessions
| Data | Backend |
|------|---------|
| List all academic sessions | `api.sessions.listSessions` |
| Create new session | `api.sessions.createSession` |
| Activate session | `api.sessions.activateSession` |

### Additional Backend Capabilities (accessible but not in dashboard)
| Action | Backend |
|--------|---------|
| Create institution user | `api.auth.createInstitutionUser` |
| Bulk create student users | `api.auth.bulkCreateStudents` |
| List institution users | `api.auth.listInstitutionUsers` |
| Set user roles | `api.users.setUserRoles` |
| List all users (scoped) | `api.users.listUsers` |
| Import wallets from CSV | `api.import.importWallets` (via action) |

### ⚠️ Missing Dashboard Tabs
- **Students** tab — manage student records (add, edit, graduate, withdraw)
- **Staff** tab — view/manage staff members
- **Settings** tab — edit institution profile info

---

## 3. FINANCE (Level 70)

**Route:** `/dashboard` (tabbed: Overview, Fees, Allocation)

### Tab: Overview
| Data | Backend |
|------|---------|
| Wallet stats (4 cards) | `api.wallets.listAll` |
| Wallet type breakdown tables | `api.wallets.listAll` |
| Student count | `api.studentRecords.listStudents` |

### Tab: Fees
| Data | Backend |
|------|---------|
| Fee items by level (100-500) | `api.fees.getFeeSummary` |
| Add fee item | `api.fees.addFeeItem` |
| Remove fee item | `api.fees.removeFeeItem` |
| **Categories:** Tuition, Department Dues, Faculty Dues, SUG Dues |

### Tab: Allocation
| Data | Backend |
|------|---------|
| Current allocation rules (sorted by priority) | `api.payments.getAllocationRules` |
| Add allocation rule | `api.payments.saveAllocationRules` |
| **Wallet types:** Institution, Faculty, Department, Association |

### Additional Backend Capabilities
| Action | Backend |
|--------|---------|
| Update fee item | `api.fees.updateFeeItem` |
| List all payments | `api.payments.listPayments` |
| List pending withdrawals (institution-wide) | `api.withdrawals.getAllPendingWithdrawals` |
| Import student records from CSV | `api.studentRecords.importStudentRecords` |

---

## 4. STUDENT_AFFAIRS (Level 60)

**Route:** `/dashboard` (single page)

### Dashboard Sections
| Section | Backend |
|---------|---------|
| Stats cards (Associations, With Advisors, Exco Members, Available Advisors) | Computed from associations/advisors/excos |
| Create association form | `api.associations.createAssociation` |
| Association list with manage panels | `api.associations.listAssociations` |
| Assign Staff Advisor dropdown | `api.associations.assignStaffAdvisor` |
| Add/Remove Student Exco | `api.associations.assignStudentExco` / `api.associations.removeStudentExco` |

### Supported Data
| Data | Backend |
|------|---------|
| List associations | `api.associations.listAssociations` |
| Get users by role (STAFF_ADVISOR, STUDENT_EXCO) | `api.auth.getUsersByRole` |
| Create association (also creates wallet) | `api.associations.createAssociation` |

---

## 5. DEAN (Level 50)

**Route:** `/dashboard`

### Dashboard
| Data | Backend |
|------|---------|
| Faculty wallet (balance, collected) | `api.wallets.getDeanView` |
| Department wallets under faculty | `api.wallets.getDeanView` (departments array) |

### Scoping
- Scoped by `entityId` stored in `user.permissions[0]`
- Can view departments whose entityId starts with the faculty's entityId
- **Status:** ✅ Requires `currentUser.permissions.length > 0` to render

---

## 6. HOD (Level 40)

**Route:** `/dashboard`

### Dashboard
| Data | Backend |
|------|---------|
| Department wallet (balance, collected) | `api.wallets.getByEntityId` |
| Recent transactions | `api.wallets.getTransactions` |

### ⚠️ Issue
The dashboard is rendered as `<HODDashboard />` **without any props**. The component expects `entityId` to query data. Since it receives `undefined`, the queries use `"skip"` and **nothing loads**. The HOD needs their entityId injected from permissions, just like DEAN.

**Fix needed:** Update `dashboard/page.tsx` to pass `entityId={currentUser.permissions[0]}` for HOD (same pattern as DEAN).

---

## 7. STAFF_ADVISOR (Level 30)

**Route:** `/dashboard`

### Dashboard
| Section | Backend |
|---------|---------|
| Pending approval count | `api.withdrawals.getWithdrawalHistory` |
| Approved (ready to execute) count | `api.withdrawals.getWithdrawalHistory` |
| Pending requests list with Approve button | `api.withdrawals.approveWithdrawal` |
| Approved requests list with Execute button | `api.withdrawals.executeWithdrawal` |

### Scoping
- Requires `associationId` and `institutionId` props
- **⚠️ Issue:** Dashboard renders as `<StaffAdvisorDashboard />` without props. The queries skip and nothing loads.

**Fix needed:** The Staff Advisor's association needs to be resolved (from their permissions or from a query that finds their association by clerkId).

---

## 8. STUDENT_EXCO (Level 20)

**Route:** `/dashboard`

### Dashboard
| Section | Backend |
|---------|---------|
| New Withdrawal form | `api.withdrawals.initiateWithdrawal` |
| Pending and approved requests list | `api.withdrawals.getWithdrawalHistory` |
| Execute approved withdrawal | `api.withdrawals.executeWithdrawal` |

### Scoping
- Requires `associationId` and `institutionId` props
- **⚠️ Issue:** Same as STAFF_ADVISOR — rendered without props, queries skip.

**Fix needed:** Resolve association from user's permissions (they have association entityId in permissions).

---

## 9. STAFF (Level 15)

**Route:** `/dashboard`

### Dashboard (Mockup)
| Section | What It Shows |
|---------|---------------|
| Total Received | ₦750,000 (mock) |
| Next Payment | ₦150,000 expected July 1 (mock) |
| Nomba Account | "Linked" status (mock) |
| Allowance History | 5 monthly entries (mock) |
| Info Banner | Notes this is mock data |

### Status
- **Mockup only** — no real backend queries connected
- Awaiting payroll/allowance system integration

---

## 10. STUDENT (Level 10)

**Route:** `/dashboard`

### Dashboard
| Data | Backend |
|------|---------|
| Total Funds Collected | `api.wallets.getStudentView` |
| Total Payments | `api.wallets.getStudentView` |
| Active Wallets | `api.wallets.getStudentView` |
| Payment routing breakdown (static) | Hardcoded example |
| Transparency info banner | Static |

### Additional Backend Capabilities
| Action | Backend |
|--------|---------|
| View student view (public within institution) | `api.wallets.getStudentView` |
| Get payment receipt | `api.payments.getReceipt` |
| Initiate payment (via Nomba) | `api.initiatePayment.initiatePayment` |

---

## Cross-Cutting Concerns

### RBAC System
- `requirePermission(ctx, requiredRole, scope?)` in `convex/auth.ts`
- Checks if ANY of the user's roles meets the required level
- Institution-scoped unless SUPER_ADMIN
- Entity-scoped for DEAN, HOD, STAFF_ADVISOR, STUDENT_EXCO

### Institution Scoping
All non-SUPER_ADMIN users are scoped to an institution via `user.institutionId`. All queries filter by `institutionId` for defense-in-depth.

### Audit Trail
All mutations write to `auditLogs` table with:
- `userId` (clerkId of the actor)
- `institutionId` (scoped)
- `action` (typed union in schema)
- `entity`, `entityId`, `oldValue`, `newValue`
- `timestamp`, `success`

---

## Known Gaps Requiring Fixes

| # | Issue | Affects |
|---|-------|---------|
| 1 | HOD dashboard rendered without entityId prop | HOD |
| 2 | STAFF_ADVISOR dashboard rendered without associationId/institutionId | STAFF_ADVISOR |
| 3 | STUDENT_EXCO dashboard rendered without associationId/institutionId | STUDENT_EXCO |
| 4 | InstitutionAdminDashboard missing Students, Staff, Settings tabs | INSTITUTION_ADMIN |
| 5 | StaffDashboard is mockup only | STAFF |
