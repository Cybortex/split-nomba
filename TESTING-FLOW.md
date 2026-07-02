# Split — Comprehensive Testing Flow

**Last Updated:** 2 July 2026
**Project Phase:** MVP — All backend + frontend UI built, needs environment setup + final TS fixes

---

## Prerequisites

Before any testing, ensure:
1. ✅ `.env.local` has valid Clerk + Nomba credentials
2. ✅ `npx convex dev` has been run (deployment active at `https://cheery-goldfish-399.convex.cloud`)
3. ✅ A SUPER_ADMIN user exists in Clerk + Convex (pre-seeded)
4. ✅ Running `npm run dev` from the `split-nomba/` directory

---

## 📋 Quick Start: Data Setup Flow

This is the **fastest path** to a fully populated demo environment:

```
SUPER_ADMIN creates an institution
  → INSTITUTION_ADMIN creates structure
    → FINANCE configures fees & allocation rules
      → INSTITUTION_ADMIN imports students
        → STUDENT pays fees
          → STAFF_ADVISOR approves withdrawals
```

---

## 👑 Role Test Flow 1: SUPER_ADMIN

### Step 1: Register an Institution
**Page:** `/register`
1. Navigate to `/register`
2. Fill in: Name = "Federal University of Technology, Minna"
3. Admin Email = `admin@fut.edu.ng`
4. Admin Name = "Dr. Bello Mohammed"
5. Click **Submit Registration**
6. ✅ See success message: "Registration Submitted"
7. ✅ Check Convex dashboard → `institutionRegistrations` table has a pending record

### Step 2: Approve the Institution (SUPER_ADMIN)
**Page:** `/admin/institutions`
1. Sign in as SUPER_ADMIN user
2. Navigate to `/admin/institutions`
3. ✅ See the pending registration from Step 1
4. Verify details: Name, Admin Email, Admin Name, date
5. Click **Approve**
6. ✅ Registration disappears from pending list
7. ✅ Check Convex dashboard → `institutions` table has new record
8. ✅ Check `auditLogs` table → `INSTITUTION_APPROVED` recorded

### Step 3: Verify Institution Was Created
**Page:** `/dashboard`
1. ✅ SUPER_ADMIN sees institution approval count updated
2. ✅ Navigate to `/admin/audit` → see full audit trail

---

## 🏛️ Role Test Flow 2: INSTITUTION_ADMIN

### Step 4: Navigate Institution Admin Dashboard
**Page:** `/dashboard`
1. Sign in as the institution admin user
2. ✅ See "Federal University of Technology, Minna" as dashboard title
3. ✅ See role badge showing `INSTITUTION_ADMIN`

### Step 5: View All Users
**Page:** `/admin/users`
1. Navigate to `/admin/users`
2. ✅ See the institution admin user listed (just 1 user so far)
3. ✅ See email, role badges (INSTITUTION_ADMIN), active status
4. ✅ "Manage" button expands to show "Add Role" options
5. ✅ SUPER_ADMIN and INSTITUTION_ADMIN roles not in add list (protected)

### Step 6: Create a FINANCE Account
**Page:** `/admin/users`
1. Not yet implemented — this would call Clerk Admin API to create user + assign role
2. For MVP: Manually add user to Convex `users` table with role `FINANCE`
3. ✅ After adding, the user appears in the list
4. ✅ Can add additional roles via "Manage" → click role button

### Step 7: Import Student Records (CSV)
**Page:** `/admin/import-students`
1. Navigate to `/admin/import-students`
2. Open `data/students-100.csv` and copy the contents
3. Paste into the text area
4. ✅ See "Import 100 Students" button count is correct
5. Click **Import**
6. ✅ See success: "100 succeeded"
7. ✅ Check Convex dashboard → `studentRecords` table has 100 records
8. ✅ Each record has: matric, faculty, department, level, email, status="active"

### Alternative: Upload Partial CSV
1. Open `data/students.csv` (10 students) for quick testing
2. Paste and import
3. ✅ Faster setup if 100 is too many for initial testing

### Step 8: Create Staff Users
**Page:** `/admin/users`
1. For each staff member, add roles via "Manage"
2. Add `FINANCE` role to the finance officer
3. Add `STUDENT` role to a test student
4. ✅ Each user can hold multiple roles
5. ✅ Users see a role switcher on their dashboard

---

## 💰 Role Test Flow 3: FINANCE

### Step 9: Configure Fee Items Per Level
**Page:** `/admin/fees`
1. Sign in as FINANCE user
2. Navigate to `/admin/fees`
3. Select level: **100 Level**
4. Click **Add Fee Item**
5. Item Name: "Tuition", Category: "Tuition", Amount: 50000
6. Click **Add Fee Item** → ✅ Item appears in list
7. Add more items for 100 Level:
   - "Lab Fee" | Tuition | 5000
   - "Library Fee" | Tuition | 3000
   - "Department Dues" | Department Dues | 2000
   - "Faculty Dues" | Faculty Dues | 1500
   - "SUG Dues" | SUG Dues | 1000
8. ✅ Total for 100 Level = ₦62,500
9. Repeat for 200 Level (same or different amounts)
10. ✅ Each level shows its own items and total

### Step 10: Test Fee Item Management
1. ✅ Add item → appears instantly in the list
2. ✅ Click ✕ to remove → item disappears
3. ✅ Try adding duplicate name → should error
4. ✅ Try empty name → button disabled
5. ✅ Try amount = 0 → should error

### Step 11: Configure Allocation Rules
**Page:** `/admin/allocation`
1. Navigate to `/admin/allocation`
2. Add allocation rules (fixed amounts):
   | Priority | Wallet Type | Name | Amount |
   |----------|-------------|------|--------|
   | 1 | institution | Main Institution Wallet | 60000 |
   | 2 | faculty | Computing Faculty | 9000 |
   | 3 | department | Computer Science Dept | 4500 |
   | 4 | association | CS Association | 2000 |
   | 5 | ict | ICT Infrastructure | 2000 |
3. ✅ Each rule shows priority, name, type badge, and amount
4. ✅ Total allocated = ₦77,500 (if student pays ₦75,000, last ₦2,500 goes as remainder)

### Step 12: View Finance Dashboard
**Page:** `/dashboard`
1. ✅ See wallet summary cards: Total Collected, Available Balance, Transactions, Active Students
2. ✅ See wallet breakdown by type (Institution, Faculty, Department, Association)
3. ✅ Each wallet shows name, balance, collected, and transaction count
4. ✅ Empty state shown if no wallets yet

---

## 🎓 Role Test Flow 4: STUDENT

### Step 13: Pay Fees
**Page:** `/pay`
1. Sign in as a student user (or use any signed-in user)
2. Navigate to `/pay`
3. Enter matric: `FUT/2022/CSC/001`
4. ✅ See the form is clean and ready
5. Click **Pay with Nomba**
6. ✅ If Nomba credentials are configured: redirected to Nomba payment page
7. ✅ If Nomba not configured: see error "Nomba credentials not configured"

### Step 14: Payment Success Flow
After Nomba redirects back:
1. ✅ See "Redirecting to Nomba..." with amount
2. ✅ See fee breakdown (Tuition, Department Dues, Faculty Dues, SUG Dues)
3. ✅ Total matches sum of items
4. Click **Continue to Payment** → goes to Nomba

### Step 15: View Receipt
**Page:** `/receipt/[payment-id]`
1. After payment completion, navigate to receipt URL
2. ✅ See Split logo and "Payment Receipt" header
3. ✅ See green "Payment Completed" status badge
4. ✅ See large amount: ₦62,500
5. ✅ See fee breakdown section
6. ✅ See student details: matric, email, faculty, department, level
7. ✅ See payment details: reference, transaction ID, timestamps
8. ✅ See routing info footer
9. Click **Print Receipt** → ✅ Print dialog opens with clean receipt format

### Step 16: View Student Dashboard
**Page:** `/dashboard`
1. ✅ See Institution Transparency Dashboard
2. ✅ See total funds collected, total payments, active wallets
3. ✅ See "How Your Payments Are Routed" breakdown
4. ✅ See transparency notice about immutable audit trail

---

## 👥 Role Test Flow 5: STUDENT_AFFAIRS

### Step 17: Create Association
**Page:** `/admin/associations`
1. Sign in as STUDENT_AFFAIRS user
2. Navigate to `/admin/associations`
3. Click **Create Association**
4. Fill in:
   - Name: "CS Association"
   - Type: "Department-level"
   - Parent Name: "Computer Science"
   - Description: "Computer Science Student Association"
5. Click **Create Association**
6. ✅ Association appears in the list
7. ✅ Shows name, type badge, parent name
8. ✅ Check Convex → `associations` table + `wallets` table has association wallet

### Step 18: Create Faculty Association
1. Click **Create Association**
2. Name: "Computing Faculty Association"
3. Type: "Faculty-level"
4. Parent Name: "Computing"
5. ✅ Faculty association created with its own wallet

### Step 19: View Associations List
1. ✅ See all associations with type badges
2. ✅ Each shows Faculty-level or Department-level
3. ✅ Empty state shown if no associations

---

## 👑 Role Test Flow 6: DEAN

### Step 20: Dean Dashboard
**Page:** `/dashboard`
1. Sign in as DEAN user (scoped to "Computing" faculty)
2. ✅ See "Faculty Dashboard" title
3. ✅ See faculty wallet: available balance + total collected
4. ✅ See department wallets under the faculty (Computer Science, Cyber Security, etc.)
5. ✅ Each department shows: balance, collected, transactions

### Step 21: Assign HOD (UI not built — use Convex dashboard)
1. In Convex dashboard, add `HOD` role to a user
2. Add `cs` to their permissions array
3. ✅ User can now log in as HOD

---

## 👥 Role Test Flow 7: HOD

### Step 22: HOD Dashboard
**Page:** `/dashboard`
1. Sign in as HOD user
2. ✅ See "Department Dashboard" title
3. ✅ See department wallet: available balance + total collected
4. ✅ See recent transactions for the department

---

## 👤 Role Test Flow 8: STAFF

### Step 23: Staff Dashboard
**Page:** `/dashboard`
1. Sign in as STAFF user
2. ✅ See "Staff Dashboard" title
3. ✅ See stats cards: Total Received (₦0), Pending Payments (0), Linked Nomba Account (—)
4. ✅ See recent transactions (empty initially)
5. ✅ See note about linking Nomba account

---

## 🛡️ Role Test Flow 9: STAFF_ADVISOR

### Step 24: Staff Advisor Dashboard
**Page:** `/dashboard`
1. Sign in as STAFF_ADVISOR user
2. ✅ See "Staff Advisor Dashboard" title
3. ✅ See stats: Pending Approval count, Ready to Execute count
4. ✅ See pending withdrawal requests (if any)
5. ✅ Empty state: "No withdrawal requests to review"

### Step 25: Approve Withdrawal
**Page:** `/withdrawals` or Dashboard
1. ✅ See pending withdrawal requests
2. ✅ Click **Approve** → request moves to "Ready to Execute"
3. ✅ Click **Execute** → request marked completed
4. ✅ Audit log records: WITHDRAWAL_APPROVED → WITHDRAWAL_COMPLETED

---

## 👥 Role Test Flow 10: STUDENT_EXCO

### Step 26: Initiate Withdrawal
**Page:** `/withdrawals`
1. Sign in as STUDENT_EXCO user
2. Navigate to `/withdrawals`
3. Click **Initiate Withdrawal**
4. Fill in: Wallet Entity ID = `cs-assoc`
5. Amount = 30000
6. Reason = "Departmental Workshop"
7. Click **Submit Request**
8. ✅ Request appears in list with "pending" status
9. ✅ Shows amount, reason, wallet ID, date

### Step 27: Execute Approved Withdrawal
1. After STAFF_ADVISOR approves:
2. ✅ Request shows "approved" status
3. ✅ Click **Execute** → Status changes to "completed"
4. ✅ Check `withdrawalRequests` table in Convex

### Step 28: Student Exco Dashboard
**Page:** `/dashboard`
1. ✅ See "Student Exco Dashboard" title
2. ✅ See withdrawal request history
3. ✅ See status badges: pending (amber), approved (blue)

---

## 🔄 Multi-Role Test Flow

### Step 29: User with Multiple Roles
This tests a user who is both STUDENT and STUDENT_EXCO:
1. Add both roles to a single user via `/admin/users`
2. Sign in as this user
3. ✅ Dashboard shows **role switcher** buttons
4. Click **Student** → see Student Dashboard
5. Click **Student Exco** → see Student Exco Dashboard
6. ✅ Switching is instant, no page reload needed
7. ✅ Each role shows the correct view

### Step 30: Role Switcher Visual
1. ✅ Active role button has gold background + black text
2. ✅ Inactive role buttons have transparent background + white text
3. ✅ Hover state shows dark gray background
4. ✅ Single-role users don't see the switcher

---

## ⚙️ System Test Flow

### Step 31: RBAC Permission Checking
1. ✅ Logged-out users see "Sign In Required" screens
2. ✅ STUDENT cannot access `/admin/fees` (redirected or error)
3. ✅ FINANCE can access `/admin/fees` and `/admin/allocation`
4. ✅ SUPER_ADMIN can access all pages
5. ✅ INSTITUTION_ADMIN can access `/admin/users` and `/admin/import-students`

### Step 32: Audit Trail
**Page:** `/admin/audit`
1. ✅ See all actions logged with timestamps
2. ✅ Each entry shows: time, action badge, entity, user ID, success/failure
3. ✅ Actions recorded: INSTITUTION_REGISTERED, INSTITUTION_APPROVED, PAYMENT_INITIATED, USER_ROLE_CHANGED, FEE_CONFIG_UPDATED, ALLOCATION_RULES_UPDATED, ASSOCIATION_CREATED, etc.
4. ✅ Immutable notice at bottom
5. ✅ Empty state: "No audit logs yet"

### Step 33: Wallet Import (CSV)
**Page:** `/admin/import-wallets`
1. Navigate to `/admin/import-wallets`
2. Open `data/wallets.csv` and copy contents
3. Paste into text area
4. ✅ See import count
5. Click **Import**
6. ✅ See success count
7. ✅ Wallets visible in Finance Dashboard

### Step 34: Receipt Page
**Page:** `/receipt/[id]`
1. ✅ After payment, navigate to receipt
2. ✅ See full receipt with all details
3. ✅ Print functionality works
4. ✅ Error state if receipt not found

---

## 🌐 Page Inventory (Complete)

| # | Page | URL | Role Access | Status |
|---|------|-----|-------------|--------|
| 1 | Landing | `/` | Public | ✅ Built |
| 2 | Register Institution | `/register` | Public | ✅ Built |
| 3 | Sign In | Clerk modal | Public | ✅ Built |
| 4 | Dashboard | `/dashboard` | All signed-in | ✅ Built |
| 5 | Pay Fees | `/pay` | All signed-in | ✅ Built |
| 6 | Withdrawals | `/withdrawals` | STUDENT_EXCO, STAFF_ADVISOR | ✅ Built |
| 7 | Receipt | `/receipt/[id]` | All signed-in | ✅ Built |
| 8 | Admin: Institutions | `/admin/institutions` | SUPER_ADMIN | ✅ Built |
| 9 | Admin: Users | `/admin/users` | INSTITUTION_ADMIN+ | ✅ Built |
| 10 | Admin: Fees | `/admin/fees` | FINANCE | ✅ Built |
| 11 | Admin: Allocation | `/admin/allocation` | FINANCE | ✅ Built |
| 12 | Admin: Associations | `/admin/associations` | STUDENT_AFFAIRS | ✅ Built |
| 13 | Admin: Audit | `/admin/audit` | SUPER_ADMIN, INSTITUTION_ADMIN | ✅ Built |
| 14 | Admin: Import Students | `/admin/import-students` | INSTITUTION_ADMIN+ | ✅ Built |
| 15 | Admin: Import Wallets | `/admin/import-wallets` | INSTITUTION_ADMIN+ | ✅ Built |

---

## 🔐 Environment Variables Needed

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Nomba
NOMBA_API_KEY=your_sandbox_key
NOMBA_CLIENT_ID=your_client_id
NOMBA_CLIENT_SECRET=your_client_secret
NOMBA_BASE_URL=https://api.nomba-sandbox.com
NOMBA_WEBHOOK_SECRET=your_webhook_secret
NOMBA_MERCHANT_ID=your_merchant_id

# Convex (already configured)
CONVEX_DEPLOYMENT=dev:cheery-goldfish-399
NEXT_PUBLIC_CONVEX_URL=https://cheery-goldfish-399.convex.cloud

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🐛 Known Issues

1. **37 TypeScript errors** — Primarily in `convex/auth.ts` (callable expression issues) and `@clerk/nextjs` exports. Does not prevent Convex deployment or UI rendering.
2. **Webhook endpoint missing** — `pages/api/webhooks/nomba.ts` doesn't exist yet. Payment completion flow is frontend-only until this is built.
3. **`v.enum()` replaced with `v.union(v.literal())`** — The installed Convex version doesn't support `v.enum()`. All occurrences have been replaced.
4. **Clerk `SignedIn`/`SignedOut` exports** — May differ by Clerk version. If errors persist, check `@clerk/nextjs` version in `package.json`.

---

## 🏆 Demo Script (3-Minute Walkthrough)

### Minute 1: Setup & Structure
1. Show `/register` → Institution registration form
2. Show `/admin/institutions` → SUPER_ADMIN approves
3. Show `/admin/fees` → FINANCE configures fees per level
4. Show `/admin/allocation` → FINANCE sets allocation rules

### Minute 2: Student Payment
1. Show `/pay` → Enter matric → See fee breakdown
2. Click Pay → Nomba redirect
3. Show receipt with breakdown

### Minute 3: Dashboard & RBAC
1. Show Finance Dashboard → All wallets with balances
2. Switch to Dean → Faculty-scoped view only
3. Switch to Student → Public transparency view
4. Show `/admin/audit` → All actions logged immutably
