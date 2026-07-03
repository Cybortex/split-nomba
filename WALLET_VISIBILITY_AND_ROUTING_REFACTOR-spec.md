# Wallet Visibility & Routing Refactor

## Why This Exists

The current `getStudentView` exposes aggregate totals of ALL wallets — a cross-institution transparency view that violates the principle that **each role sees only the wallets they are scoped to**. The routing system uses a generic `allocationRules` table with flexible rules, but the actual business logic is simpler: **4 fixed receivers** (Institution, SUG, Faculty, Department) funded directly from `feeConfig` categories.

This spec re-architects wallet visibility, association types, payment routing, and withdrawal consensus.

---

## 1. Association Model — 3 Tiers

### Current
- `ASSOCIATION_TYPE = "faculty" | "department"`

### New
- `ASSOCIATION_TYPE = "sug" | "faculty" | "department"`

### Rules
| Level | Count | Has Wallet? | Staff Advisor | Student Exco | Withdrawal Flow |
|-------|-------|-------------|---------------|--------------|-----------------|
| **SUG** | 1 per institution | ✅ | **None** | ✅ | Exco initiates + auto-approves |
| **Faculty** | N per institution | ✅ | ✅ Faculty Staff Advisor | ✅ | Exco initiates → Advisor approves |
| **Department** | N per institution | ✅ | ✅ Department Staff Advisor | ✅ | Exco initiates → Advisor approves |

### Association Schema Changes
Add a `slug` field to associations:
```typescript
associations: defineTable({
  // ... existing fields ...
  slug: v.string(),   // NEW — unique identifier, e.g. "CSC", "SUG-UNILAG"
  name: v.string(),   // existing — display name, e.g. "Computer Science"
  type: ASSOCIATION_TYPE, // "sug" | "faculty" | "department"
  // ... existing fields ...
})
  .index("by_institution_type_slug", ["institutionId", "type", "slug"]) // NEW index
```

The slug is set at creation time and is unique **per type within an institution** (e.g., no two faculties can have slug "SCIENCE", but a faculty "SCIENCE" and a department "SCIENCE-CS" is fine).

---

## 2. Wallet Model — 4 Wallet Types Per Institution

Each institution has:
| Wallet | Type | Key | Created When | Credited From |
|--------|------|-----|-------------|---------------|
| **Institution** | `"institution"` | entityId = `institution._id` | Institution setup | `tuition` fee items |
| **SUG** | `"association"` | associationId → SUG association | SUG association creation | `sug_dues` fee items |
| **Faculty** (per faculty) | `"faculty"` | entityId = faculty slug | Faculty association creation | `faculty_dues` fee items (student's faculty) |
| **Department** (per dept) | `"department"` | entityId = department slug | Department association creation | `department_dues` fee items (student's department) |

### Institution Wallet Auto-Creation
When an institution is created/approved (in `approveInstitution` or `createInstitutionDirect`), auto-create the institution wallet:
```typescript
await ctx.db.insert("wallets", {
  institutionId: newInstitutionId,
  type: "institution",
  entityId: newInstitutionId.toString(), // use the institution's own ID
  name: institution.name,
  totalCollected: 0,
  availableBalance: 0,
  minimumBalance: 0,
  transactionCount: 0,
});
```

### Platform Fee Wallet
The ₦100 platform fee collected on each school fees payment goes to a separate **platform fee** wallet/account. Two options:
- **Option A:** A dedicated `"platform"` wallet per institution (type = `"platform"`, entityId = `institution._id + "-platform"`)
- **Option B:** Track in a cumulative counter on the institution record (`platformFeesCollected`)

The platform fee is recorded in the audit trail on each completed payment.

---

## 3. Fee Config → Wallet Mapping (Simplified Allocation)

### Current
- `allocationRules` table with flexible rules, `targetEntityId`, priority, amounts
- `routePayment` uses `calculateAllocationFromRules` to distribute

### New
**No more allocationRules table for payment routing.** The `feeConfig` categories directly determine where money goes:

| Category | Receiver | Lookup |
|----------|----------|--------|
| `tuition` | Institution wallet | Fixed — entityId = institution._id |
| `sug_dues` | SUG wallet | Find association where type="sug" for this institution |
| `faculty_dues` | Faculty wallet | Find association where type="faculty" AND slug = student's facultySlug |
| `department_dues` | Department wallet | Find association where type="department" AND slug = student's departmentSlug |

### Fee Calculation Flow
1. Get student's `studentRecord` → get `level`, `faculty`, `department`
2. Query `feeConfig` for the student's level, grouped by category
3. Sum amounts per category → the 4 route amounts
4. Total = tuition_total + sug_dues_total + faculty_dues_total + department_dues_total

### Payment Initiation Update
The `initiatePayment` action computes:
- **feeTotal** = sum of all fee items for the student's level (this is the amount routed to wallets)
- **platformFee** = ₦100 (added on top, goes to platform account)
- **totalToCharge** = feeTotal + platformFee + Nomba processing fees

Nomba is called with `totalToCharge`. The payment record stores both `amount` (feeTotal) and potentially `platformFee` separately.

---

## 4. Payment Routing (routePayment Redesign)

### New routePayment Signature
```typescript
export const routePayment = mutation({
  args: {
    institutionId: v.id("institutions"),
    paymentId: v.id("payments"),
    nombaTransactionId: v.string(),
    feeBreakdown: v.object({
      tuition: v.number(),
      sugDues: v.number(),
      facultyDues: v.number(),
      departmentDues: v.number(),
    }),
    studentFaculty: v.string(),    // faculty name from student record
    studentDepartment: v.string(), // department name from student record
    facultySlug: v.string(),       // faculty slug (for wallet lookup)
    departmentSlug: v.string(),    // department slug (for wallet lookup)
    platformFee: v.number(),       // ₦100 or 0
  },
```

### Routing Logic
1. **Institution wallet**: Look up by `entityId = institution._id.toString()`. Credit `feeBreakdown.tuition`.
2. **SUG wallet**: Find association where `type="sug"` for this institution → get its wallet. Credit `feeBreakdown.sugDues`.
3. **Faculty wallet**: Find association where `type="faculty"` AND `slug = facultySlug` → get its wallet. Credit `feeBreakdown.facultyDues`.
4. **Department wallet**: Find association where `type="department"` AND `slug = departmentSlug` → get its wallet. Credit `feeBreakdown.departmentDues`.
5. **Platform fee**: If `platformFee > 0`, credit the platform wallet or log it.
6. **Skip zero-amount categories** — only credit wallets with a positive amount.
7. Mark payment as `"completed"`.

### No more allocationRules dependency
The `allocationRules` table can be **removed** or kept for future flexibility. The routing no longer reads from it.

---

## 5. Wallet Visibility — Role-Scoped Queries

### Principle
> "Transparency means you can view how much has entered into a wallet your account has access to view."
> No aggregate of all wallets. No cross-faculty/department visibility.

### Access Matrix

| Role | Institution Wallet | SUG Wallet | Faculty Wallet | Department Wallet |
|------|-------------------|------------|----------------|-------------------|
| **SUPER_ADMIN** | ✅ View | ✅ View | ✅ View | ✅ View |
| **INSTITUTION_ADMIN** | ✅ View | ✅ View | ✅ View | ✅ View |
| **FINANCE** | ✅ View | ✅ View | ✅ View | ✅ View |
| **STUDENT_AFFAIRS** | ❌ | ✅ View | ❌ | ❌ |
| **DEAN** | ❌ | ❌ | ✅ View (own faculty) | ❌ |
| **HOD** | ❌ | ❌ | ❌ | ✅ View (own department) |
| **STAFF_ADVISOR (Faculty)** | ❌ | ❌ | ✅ View (assigned faculty) | ❌ |
| **STAFF_ADVISOR (Dept)** | ❌ | ❌ | ❌ | ✅ View (assigned dept) |
| **STUDENT_EXCO (SUG)** | ❌ | ✅ View + Transact | ❌ | ❌ |
| **STUDENT_EXCO (Faculty)** | ❌ | ❌ | ✅ View + Transact | ❌ |
| **STUDENT_EXCO (Dept)** | ❌ | ❌ | ❌ | ✅ View + Transact |
| **STUDENT** | ❌ | ❌ | ❌ | ❌ |
| **STAFF** | ❌ | ❌ | ❌ | ❌ |

### New Queries Needed

#### 1. `getMyAccessibleWallets` — Returns list of wallets the current user can view
- Self-resolves from current user's roles + permissions
- Returns array of `{ wallet: Wallet, access: "view" | "transact" }`
- Used by dashboards to render wallet cards

#### 2. `getWalletTransactions` (update existing)
- Only return transactions for wallets the user has access to
- Add RBAC scoping per the access matrix

#### 3. Remove `getStudentView`
- Students should NOT see aggregate wallet data
- Students see only their own payment history (already implemented)

### Implementation Pattern for Queries
```typescript
export const getMyAccessibleWallets = query({
  handler: async (ctx) => {
    const user = await resolveCurrentUser(ctx);
    if (!user || !user.institutionId) return [];

    const allWallets = await ctx.db
      .query("wallets")
      .filter((q) => q.eq(q.field("institutionId"), user.institutionId as any))
      .collect();

    // Filter based on user's roles + permissions
    const accessible: Array<{ wallet: Doc<"wallets">; access: "view" | "transact" }> = [];

    for (const wallet of allWallets) {
      const access = getWalletAccess(user, wallet);
      if (access) accessible.push({ wallet, access });
    }

    return accessible;
  },
});

function getWalletAccess(user: any, wallet: any): "view" | "transact" | null {
  // SUPER_ADMIN, INSTITUTION_ADMIN, FINANCE: full access to all
  if (["SUPER_ADMIN", "INSTITUTION_ADMIN", "FINANCE"].some(r => user.roles.includes(r))) {
    return "transact"; // view + transact
  }

  // STUDENT_AFFAIRS: view-only on "association" wallets where type="sug"
  if (user.roles.includes("STUDENT_AFFAIRS") && wallet.type === "association") {
    // But need to check if the association is SUG type
    return "view";
  }

  // DEAN: view-only on "faculty" wallet where entityId matches their permissions
  if (user.roles.includes("DEAN") && wallet.type === "faculty" && user.permissions.includes(wallet.entityId)) {
    return "view";
  }

  // HOD: view-only on "department" wallet where entityId matches their permissions
  if (user.roles.includes("HOD") && wallet.type === "department" && user.permissions.includes(wallet.entityId)) {
    return "view";
  }

  // STAFF_ADVISOR: view-only on the association wallet they're assigned to
  if (user.roles.includes("STAFF_ADVISOR") && wallet.associationId) {
    // Check if the user is the staff advisor for this association
    // This requires a separate query to the associations table
    // Placeholder — actual check would resolve the association
  }

  // STUDENT_EXCO: view + transact on their association wallet
  if (user.roles.includes("STUDENT_EXCO") && wallet.associationId) {
    // Check if user is an exco member of this association
    // Placeholder — actual check would resolve the association
  }

  return null;
}
```

---

## 6. Withdrawal Consensus Flows

### Current
- `STUDENT_EXCO` initiates
- `STAFF_ADVISOR` approves
- Either can execute

### New — 3-Tier Withdrawal

#### Tier 1: SUG (Exco-only)
- **Initiate:** SUG StudentExco (any member)
- **Approve:** Auto-approved — no second signature needed
- **Execute:** SUG StudentExco
- Updated `initiateWithdrawal` should check: if association type is "sug", skip the pending state and auto-approve

#### Tier 2: Faculty (Exco + Staff Advisor consensus)
- **Initiate:** Faculty StudentExco
- **Approve:** Faculty Staff Advisor
- **Execute:** Either initiator or approver
- Same as current flow

#### Tier 3: Department (Exco + Staff Advisor consensus)
- **Initiate:** Department StudentExco
- **Approve:** Department Staff Advisor
- **Execute:** Either initiator or approver
- Same as current flow

### Updated Withdrawal RBAC
`initiateWithdrawal` should verify:
1. The user is a STUDENT_EXCO
2. The user's permissions include the association's entityId (they're assigned to this association)
3. The association belongs to the user's institution

For **approval**, `approveWithdrawal` should verify:
1. The user is a STAFF_ADVISOR
2. The user is the staff advisor assigned to this association
3. The association's type is NOT "sug" (SUG doesn't need approval)

---

## 7. Student Record Changes

### Current
```typescript
studentRecords: defineTable({
  matric: v.string(),
  faculty: v.string(),     // name string, e.g., "Science"
  department: v.string(),   // name string, e.g., "Computer Science"
  level: v.number(),
  // ...
})
```

### New — Add slug fields
```typescript
studentRecords: defineTable({
  matric: v.string(),
  faculty: v.string(),         // display name
  department: v.string(),       // display name
  facultySlug: v.string(),      // NEW — e.g., "SCIENCE"
  departmentSlug: v.string(),   // NEW — e.g., "SCIENCE-CS"
  level: v.number(),
  // ...
})
```

The `facultySlug` and `departmentSlug` are populated from the association's slug when the student record is created or updated. This is the key used by `routePayment` to find the correct wallets.

---

## 8. Webhook & Payment Flow (End-to-End)

### Full Flow
1. **Student clicks "Pay Now"** → calls `initiatePayment` action
2. `initiatePayment` computes:
   - `feeTotal` = sum of all fee items for the student's level
   - `platformFee` = 100
   - Calls Nomba with `amount = feeTotal + platformFee`
   - Creates payment record with `amount = feeTotal`, stores `platformFee` separately
   - Returns Nomba authorisation URL
3. **Student pays on Nomba** → Nomba sends webhook
4. **Webhook** (`/api/webhooks/nomba`):
   - Verifies signature + idempotency
   - Gets the payment record
   - New: Computes fee breakdown from student's level feeConfig
   - Calls new `routePayment` with:
     - `feeBreakdown`: computed per category
     - `facultySlug` / `departmentSlug`: from student record
     - `platformFee`: from payment record
5. **routePayment**:
   - Credits Institution wallet (tuition total)
   - Credits SUG wallet (sug_dues total)
   - Credits Faculty wallet (faculty_dues total)
   - Credits Department wallet (department_dues total)
   - Credits/records platform fee
   - Marks payment completed

---

## 9. Impacted Files

### Schema Changes
| File | Change |
|------|--------|
| `convex/schema.ts` | Add `"sug"` to `ASSOCIATION_TYPE` |
| `convex/schema.ts` | Remove `ALLOCATION_WALLET_TYPE` and `ALLOCATION_WALLET_TYPE` union if allocationRules is removed |
| `convex/schema.ts` | Add `slug` field to `associations` table + index |
| `convex/schema.ts` | Add `facultySlug`, `departmentSlug` to `studentRecords` table |
| `convex/schema.ts` | Optionally remove `allocationRules` table |

### Backend Changes
| File | Change |
|------|--------|
| `convex/associations.ts` | Add `slug` to `createAssociation`, add SUG creation helper |
| `convex/auth.ts` | Add institution wallet creation to `approveInstitution`/`createInstitutionDirect` |
| `convex/payments.ts` | Rewrite `routePayment` — use feeConfig categories, look up associations by slug |
| `convex/payments.ts` | Remove `saveAllocationRules`, `getAllocationRules` if removing allocationRules |
| `convex/payments.ts` | Add `getMyAccessibleWallets` query with role-based filtering |
| `convex/wallets.ts` | Remove `getStudentView` |
| `convex/wallets.ts` | Update `getTransactions` with proper RBAC per access matrix |
| `convex/wallets.ts` | Update `getAssociationWallet` — handle SUG, faculty, dept levels |
| `convex/initiatePayment.ts` | Pass facultySlug/departmentSlug, separate platformFee |
| `convex/webhooks/nomba/route.ts` | Update to pass new routePayment args |

### Frontend Changes
| File | Change |
|------|--------|
| `components/dashboards/StudentDashboard.tsx` | No aggregate wallet data — show only payments |
| `components/dashboards/DeanDashboard.tsx` | Show faculty wallet + transactions (view only) |
| `components/dashboards/HODDashboard.tsx` | Show department wallet + transactions (view only) |
| `components/dashboards/StaffAdvisorDashboard.tsx` | Show assigned association wallet (view only) |
| `components/dashboards/StudentExcoDashboard.tsx` | Show association wallet + withdrawal initiation |
| `components/dashboards/StudentAffairsDashboard.tsx` | Add SUG wallet view |
| `components/dashboards/FinanceDashboard.tsx` | Show all 4 wallet types |
| `components/WithdrawalForm.tsx` | Handle SUG auto-approve flow |

---

## 10. Migration / Data Backfill

Since existing data may have:
- Associations without slugs
- Student records without facultySlug/departmentSlug
- Wallets without proper entityIds

A one-time migration script should:
1. Auto-generate slugs for existing associations (from name or entityId)
2. Backfill facultySlug/departmentSlug on existing studentRecords (matching by faculty/department name → association slug)
3. Create institution wallets for any institution that doesn't have one
4. Create SUG associations for institutions that don't have one

---

## 11. Edge Cases & Open Questions

### Edge Cases
1. **Student's faculty has no association yet** — Routing should skip faculty_dues with an audit warning
2. **No SUG association exists** — Skip sug_dues with an audit warning
3. **Department name doesn't match any association** — Skip department_dues, route remainder to institution
4. **Multiple associations with same name** — Should not happen (slug is unique per type)
5. **Platform fee wallet doesn't exist** — Log the platform fee to audit trail but don't fail the payment
6. **Student changes faculty/department mid-session** — The payment is tied to the student's record at the time of payment (already captured in the payment record)

### Open Questions
1. Should `allocationRules` table be fully removed or just deprecated?
2. Where does the platform fee money accumulate? (separate wallet / institution field / new table)
3. Should the SUG association auto-created when an institution is onboarded?
4. For faculties/departments that share the same name (e.g., "Computer Science" as both a faculty AND a department), the slug disambiguates — but the student record stores both. The faculty slug might be "COMP-SCI" and department slug "COMP-SCI" too. Is this ok?

---

## 12. Implementation Order

### Phase 1: Schema & Backend Foundation
1. Update schema — add SUG type, add slug to associations, add facultySlug/departmentSlug to studentRecords
2. Create institution wallet on institution setup
3. Update `createAssociation` to require/write slug
4. Add SUG association creation helper

### Phase 2: Route Payment Rewrite
5. Rewrite `routePayment` — feeConfig-based, slug lookup, 4-wallet routing
6. Update `initiatePayment` — pass slug data, separate platform fee
7. Update Nomba webhook — new routePayment args

### Phase 3: Wallet Visibility Queries
8. Add `getMyAccessibleWallets` with role-scoped filtering
9. Remove `getStudentView`
10. Update existing wallet queries with proper RBAC

### Phase 4: Withdrawal Consensus
11. Update `initiateWithdrawal` — SUG auto-approve, role verification
12. Update `approveWithdrawal` — reject SUG withdrawal approvals (already auto-approved)

### Phase 5: Frontend Dashboards
13. Update DeanDashboard — faculty wallet view
14. Update HODDashboard — department wallet view
15. Update StaffAdvisorDashboard — assigned wallet view
16. Update StudentExcoDashboard — withdrawal + wallet view
17. Update StudentAffairsDashboard — SUG wallet view
18. Update FinanceDashboard — all wallets view
19. Update StudentDashboard — remove transparency view, keep payment history only

### Phase 6: Migration
20. Backfill slugs for existing associations
21. Backfill facultySlug/departmentSlug for existing students
22. Create institution wallets for existing institutions
23. Create SUG associations for existing institutions

---

## 13. Summary of Key Design Decisions (from Interview)

| Decision | Choice |
|----------|--------|
| SUG structure | Own association type (`"sug"`) with wallet, excos, no staff advisor |
| Fee → wallet mapping | 1-to-1: tuition→Institution, sug_dues→SUG, faculty_dues→Faculty, department_dues→Department |
| Allocation system | Simplified: feeConfig categories directly determine routing. No allocationRules |
| Association lookup | Match by `slug` (new field) + `type`. Slug is unique per type in an institution |
| Student routing data | Student record stores `facultySlug` + `departmentSlug` alongside display names |
| Wallet visibility | Role-scoped per access matrix. No aggregate views |
| Institution wallet | Auto-created on institution setup (not dynamically) |
| Platform fee (₦100) | Collected on school fee payments. Goes to a separate platform account/wallet |
| Dean/HOD | Separate roles (not StaffAdvisor) — Dean views faculty wallet, HOD views department wallet |
| SUG withdrawals | Exco-only — no approval needed |
| Faculty withdrawals | Exco initiates → Faculty StaffAdvisor approves |
| Department withdrawals | Exco initiates → Department StaffAdvisor approves |
| Student sees | Own payment history only — no wallet data whatsoever |
| Surplus handling | Student pays exactly feeTotal + platformFee + txn fees. FeeTotal = sum of all 4 categories. Exact split, no surplus |
