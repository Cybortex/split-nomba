# Route Split & Role Refactoring Spec

## Overview

Split the current monolithic routing (all roles on `/dashboard`, one conditional page) into two isolated route groups:

| Route | Audience | Layout |
|-------|----------|--------|
| `/admin/*` | **SUPER_ADMIN** only | Multi-page sub-routes with admin layout + sidebar |
| `/dashboard/*` | All other 9 roles (INSTITUTION_ADMIN, FINANCE, STUDENT_AFFAIRS, DEAN, HOD, STAFF_ADVISOR, STUDENT_EXCO, STAFF, STUDENT) | Single-page conditional rendering as-is |

---

## 1. Current State

### Routes
```
/app
  /page.tsx                          ← Landing page (public)
  /login/page.tsx                    ← Login page
  /dashboard/page.tsx               ← ALL roles render here (conditional component switching)
  /dashboard/layout.tsx             ← Shared dashboard layout (Sidebar, Navbar, role check)
  /dashboard/analytics/page.tsx     ← Analytics page
  /dashboard/profile/page.tsx       ← Profile page
  /admin/page.tsx                   ← SUPER_ADMIN dashboard (currently renders SuperAdminDashboard)
  /admin/layout.tsx                 ← Admin layout
  /admin/users/page.tsx             ← Admin users management (INSTITUTION_ADMIN uses this)
```

### Role assignment rules (from `convex/auth.ts`)
- **SUPER_ADMIN** — Unique, never overlaps with any other role. The app-level admin who manages institution onboarding.
- **INSTITUTION_ADMIN** — The account created alongside each institution. Manages an institution's data. Never also a SUPER_ADMIN.
- All other roles are mutually exclusive at creation time but could theoretically change (user said SUPER_ADMIN is the only one that can never overlap).

---

## 2. Target State

### `/admin/*` — SUPER_ADMIN Only

```
/app
  /(admin)/
    /page.tsx                        ← Admin Overview (global stats, quick actions)
    /layout.tsx                      ← Admin layout with sidebar navigation
    /approvals/page.tsx              ← Pending institution approvals
    /institutions/page.tsx           ← Institutions table (list, approve, reject, manage)
    /audit/page.tsx                  ← Recent audit/activity feed
```

### `/dashboard/*` — All Other Roles

```
/app
  /(dashboard)/
    /page.tsx                        ← Current dashboard/page.tsx (conditional rendering)
    /layout.tsx                      ← Current dashboard layout (Sidebar, Navbar, role check)
    /analytics/page.tsx              ← Keep as-is
    /profile/page.tsx                ← Keep as-is
```

**Key architectural decisions:**
- Both `/admin` and `/dashboard` use Next.js Route Groups `(admin)` and `(dashboard)` so they don't affect the URL path
- The root-level `/admin` and `/dashboard` files get MOVED into their respective route groups
- SUPER_ADMIN access to `/admin/*` is enforced by the admin layout's role check
- Access to `/dashboard/*` is enforced by the existing dashboard layout
- **Middleware** (`proxy.ts`) already protects all routes — only signed-in users access `/admin` or `/dashboard`

---

## 3. Files to Create

| File | Purpose |
|------|---------|
| `src/app/(admin)/page.tsx` | Move from `src/app/admin/page.tsx`, then rewrite to focus on SUPER_ADMIN overview (global stats card, recent activity, quick actions) |
| `src/app/(admin)/layout.tsx` | Move from `src/app/admin/layout.tsx` — keep the role guard (only SUPER_ADMIN), update sidebar with admin sub-page links |
| `src/app/(admin)/approvals/page.tsx` | NEW — extract pending approvals section from current SuperAdminDashboard |
| `src/app/(admin)/institutions/page.tsx` | NEW — extract institutions table section from current SuperAdminDashboard |
| `src/app/(admin)/audit/page.tsx` | NEW — extract audit/activity feed section from current SuperAdminDashboard |

## 4. Files to Move/Rename

| Current Path | New Path |
|-------------|----------|
| `src/app/admin/page.tsx` | `src/app/(admin)/page.tsx` |
| `src/app/admin/layout.tsx` | `src/app/(admin)/layout.tsx` |

## 5. Files to Delete

| File | Reason |
|------|--------|
| `src/app/admin/users/page.tsx` | Super Admin manages users via Clerk dashboard, not the app UI. The INSTITUTION_ADMIN already has a Users tab in their dashboard. |

## 6. Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboards/SuperAdminDashboard.tsx` | Remove — its contents are now split into the 4 admin sub-pages |
| `src/app/dashboard/page.tsx` | Remove the SUPER_ADMIN conditional render (`currentRole === "SUPER_ADMIN"` branch). SUPER_ADMIN never reaches `/dashboard` anymore (redirected to `/admin`). |

## 7. Component Breakdown

### Overview Page (`/admin`)
- Global stats cards (total institutions, total users, total transactions, total volume)
- Quick actions (approve pending institutions)
- Recent activity feed (last 10 audit events)

### Approvals Page (`/admin/approvals`)
- List of pending institution applications
- Approve / Reject buttons with confirmation
- Filter by status (pending, approved, rejected)

### Institutions Page (`/admin/institutions`)
- Full institutions table with search/filter
- View institution details
- Manage institution (activate/deactivate)
- Institution creation form (create institution + its INSTITUTION_ADMIN account)

### Audit Page (`/admin/audit`)
- Full audit log with filters (action type, date range, user)
- Paginated table with expandable detail rows

---

## 8. Edge Cases & Constraints

1. **SUPER_ADMIN routing guard** — The admin layout must redirect non-SUPER_ADMIN users away from `/admin/*`. The current `admin/layout.tsx` already does this (`useRoleGuard`). Keep this logic.

2. **No role overlap** — SUPER_ADMIN is the only role that is truly isolated. All other roles share `/dashboard` but are mutually exclusive.

3. **Deep links** — If a SUPER_ADMIN bookmarks `/admin/institutions`, they should land on that page directly. Each page should load its own data independently.

4. **Loading states** — Each admin sub-page should show a loading skeleton while data loads, keeping the sidebar visible.

5. **Error states** — Each page should handle errors gracefully (e.g., "Failed to load institutions. Try again.")

---

## 9. Implementation Order

1. Create `src/app/(admin)/` directory and move files:
   - Move `admin/page.tsx` → `(admin)/page.tsx`
   - Move `admin/layout.tsx` → `(admin)/layout.tsx`
   - Fix layout import paths
2. Update `(admin)/layout.tsx` — add sidebar with links to sub-pages
3. Create `(admin)/approvals/page.tsx` — extract approval section
4. Create `(admin)/institutions/page.tsx` — extract institutions section
5. Create `(admin)/audit/page.tsx` — extract audit section
6. Update `(admin)/page.tsx` — keep overview stats, remove sections that moved
7. Delete `app/admin/users/page.tsx`
8. Delete `src/components/dashboards/SuperAdminDashboard.tsx`
9. Update `dashboard/page.tsx` — remove SUPER_ADMIN branch
10. Update `dashboards/index.ts` — remove SuperAdminDashboard export
11. Run build and fix any issues
12. Code review

---

## 10. Non-Goals (Out of Scope)

- Changing the `/dashboard/page.tsx` conditional rendering logic for the remaining 9 roles — that stays as-is
- Refactoring other dashboards (Finance, InstitutionAdmin, etc.) — those are handled in separate specs
- Adding new backend queries — reuse existing `api.audit.listAuditLogs`, `api.institutions.*`, etc.
