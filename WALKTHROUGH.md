# Split-Nomba — End-to-End Walkthrough

A fee collection & payment routing platform where student fees are automatically split and distributed to 4 wallets (Institution, SUG, Faculty, Department) with role-based wallet visibility and multi-tier withdrawal consensus.

---

## Architecture Overview

### Roles & Permissions

| Role | Dashboard | Wallet Access |
|------|-----------|---------------|
| **SUPER_ADMIN** | `/admin/*` | All wallets — full access |
| **INSTITUTION_ADMIN** | Dashboard → Overview/Users/Students/Sessions/Settings | All wallets — view |
| **FINANCE** | Dashboard → Overview/Fees | All wallets — view, configures fees |
| **STUDENT_AFFAIRS** | Dashboard → Association Management | SUG wallet — view only |
| **DEAN** | Dashboard → Faculty | Faculty wallet — view only |
| **HOD** | Dashboard → Department | Department wallet — view only |
| **STAFF_ADVISOR** | Dashboard → Staff Advisor | Assigned association wallet — view + approve withdrawals |
| **STUDENT_EXCO** | Dashboard → Student Exco | Assigned association wallet — transact + initiate withdrawals |
| **STUDENT** | Dashboard → Student | Own fee breakdown + pay + payment history |
| **STAFF** | Dashboard → Staff | None |

### Wallet Model

Every institution gets these wallets auto-created:

| Wallet | Source | Slug Lookup |
|--------|--------|-------------|
| **Institution** | `tuition` category fees | Institution ID |
| **SUG** | `sug_dues` category fees | Association slug (e.g. `SUG`) |
| **Faculty** | `faculty_dues` category fees | Student's `facultySlug` matches association slug |
| **Department** | `department_dues` category fees | Student's `departmentSlug` matches association slug |

Plus a ₦100 platform fee collected per transaction (tracked separately).

### Withdrawal Consensus

| Association Type | Initiated By | Approved By | Auto-Approve? |
|-----------------|--------------|-------------|---------------|
| SUG | SUG Exco | — (self-approved) | ✅ Yes |
| Faculty | Faculty Exco | Faculty Staff Advisor | ❌ Needs approval |
| Department | Dept Exco | Dept Staff Advisor | ❌ Needs approval |

---

## Setup Phase — Do this first

### Step 1: Register Institution

1. Go to `/register`
2. Fill in institution name, email, admin details
3. **Done automatically:** Institution wallet created

### Step 2: Create Associations (Student Affairs)

Log in as `STUDENT_AFFAIRS` → Dashboard

**Create SUG:**
1. Click "Create SUG" — one per institution
2. ✅ SUG wallet auto-created

**Create Faculty:**
1. Click "Create Association"
2. Name: `Faculty of Science`
3. Slug: `SCIENCE` (⚠️ Must match what you'll enter on student records)
4. Type: Faculty-level

**Create Department:**
1. Click "Create Association"
2. Name: `Computer Science Department`
3. Slug: `COMP-SCI` (⚠️ Must match what you'll enter on student records)
4. Type: Department-level

**Assign Staff Advisor:**
1. Find the Faculty → click "Assign Advisor"
2. Pick a user with `STAFF_ADVISOR` role
3. Same for Department

**Assign Student Exco:**
1. Click "Excos" on the association card
2. Click "Add Member" → pick a `STUDENT_EXCO` user

### Step 3: Add Users (Institution Admin)

Log in as `INSTITUTION_ADMIN` → Dashboard → Users tab

1. Create user in [Clerk Dashboard](https://dashboard.clerk.com) first (email + password)
2. Paste the Clerk ID into the "Add User" form
3. Select role (`STUDENT`, `STUDENT_EXCO`, `STAFF_ADVISOR`, `DEAN`, `HOD`, `FINANCE`, etc.)
4. Click "Create User"

For `STUDENT` users: The permission field should be set to their matric number (e.g., `SCI/2025/001`). This links their account to their student record.

### Step 4: Create Academic Session (Institution Admin)

Dashboard → Sessions tab

1. Name: `2025/2026`
2. Start / End dates
3. Check "Activate immediately"
4. Click "Create Session"

### Step 5: Configure Fees (Finance)

Dashboard → Fees tab

1. Select a level (e.g., `100`)
2. Add fee items per category:

| Category | Example Item | Amount |
|----------|-------------|--------|
| Tuition | Tuition Fee | 50,000 |
| SUG Dues | SUG Dues | 5,000 |
| Faculty Dues | Faculty Dues | 3,000 |
| Department Dues | Department Dues | 2,000 |

**Total per student:** ₦60,000

Repeat for other levels as needed.

### Step 6: Add Students (Institution Admin)

Dashboard → Students tab

**Fields:**
| Field | Example |
|-------|---------|
| Matric Number | `SCI/2025/001` |
| Level | `100` |
| Faculty | `Science` |
| Department | `Computer Science` |
| Faculty Slug | `SCIENCE` |
| Department Slug | `COMP-SCI` |
| Email | `student@institution.edu` |

**Important:** `Faculty Slug` and `Department Slug` must **exactly match** the slug you used when creating the associations. Payment routing uses these to find the right wallets.

---

## Payment Phase

### Step 7: Student Pays

1. Student logs in → sees active session + fee breakdown
2. Clicks **"Pay Now with Nomba"**
3. Fee breakdown shown (tuition: ₦50k, SUG: ₦5k, Faculty: ₦3k, Dept: ₦2k)
4. Redirected to Nomba checkout
5. Student pays **₦60,100** (₦60k fees + ₦100 platform fee)

### Step 8: Webhook Routes Payment (Automatic)

1. Nomba sends `transaction.completed` webhook to `/api/webhooks/nomba`
2. Handler verifies signature, checks idempotency, verifies amount
3. Reads **stored fee breakdown** from the payment record
4. Calls `routePayment` → distributes:

| Wallet | Amount |
|--------|--------|
| Institution | ₦50,000 |
| SUG (via `SUG` slug) | ₦5,000 |
| Faculty (via `SCIENCE` slug) | ₦3,000 |
| Department (via `COMP-SCI` slug) | ₦2,000 |
| Platform Fee | ₦100 |

### Step 9: Verification

| Who | What to See |
|-----|-------------|
| **Student** | Payment shows "completed" with routing breakdown |
| **Dean** | Faculty wallet: ₦3,000 balance |
| **HOD** | Department wallet: ₦2,000 balance |
| **Finance** | All wallets visible with correct totals |
| **Student Affairs** | SUG wallet: ₦5,000 balance |

---

## Withdrawal Phase

### Step 10: Exco Initiates Withdrawal

Student Exco → Dashboard

1. Sees wallet with **"Can Transact"** badge
2. Clicks "New Withdrawal"
3. Wallet auto-detected, shows available balance
4. Enter amount (₦2,000) + reason
5. Submits

**Outcome depends on association type:**
- **SUG:** Auto-approved (no Staff Advisor needed) → status: `approved`
- **Faculty/Department:** Pending → awaits Staff Advisor approval

### Step 11: Staff Advisor Approves

Staff Advisor → Dashboard

1. Sees pending request(s) for their association
2. Reviews amount + reason
3. Clicks "Approve" → status changes to `approved`

### Step 12: Execute Withdrawal

Either the initiator (Exco) or approver (Staff Advisor) can execute:

1. Find the approved request (status: `approved`)
2. Click "Execute"
3. Wallet balance reduces by ₦2,000
4. Transaction logged in immutable ledger

---

## Wallet Views (All Roles)

| Dashboard | Shows | Component |
|-----------|-------|-----------|
| Student | Fee overview + Pay button + Payment history | `WalletCard` (implicit in fee summary) |
| Finance | All wallets table + Fee configuration | `WalletCard` via Overview tab |
| Student Affairs | SUG wallet + transactions | `<WalletCard access="view">` |
| Dean | Faculty wallet + transactions | `<WalletCard>` |
| HOD | Department wallet + transactions | `<WalletCard>` |
| Staff Advisor | Association wallet (view-only) + approval queue | `<WalletCard access="view">` |
| Student Exco | Association wallet (can transact) + initiation form | `<WalletCard access="transact">` |

---

## Environment Variables

| Variable | Required | Where |
|----------|----------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | ✅ Build + Runtime | Convex Dashboard |
| `CLERK_SECRET_KEY` | ✅ Runtime | Clerk Dashboard |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Runtime | Clerk Dashboard |
| `NOMBA_API_KEY` | For payments | Nomba Dashboard |
| `NOMBA_BASE_URL` | For payments | Nomba API docs |
| `NOMBA_WEBHOOK_SECRET` | For webhooks | Nomba Dashboard → Webhooks |
| `NEXT_PUBLIC_APP_URL` | For webhooks | Your deployed URL |

Set these in Vercel → Project → Settings → Environment Variables.

---

## Deployment

1. Push to GitHub
2. Import repo into [Vercel](https://vercel.com)
3. Add all env vars (see above)
4. Deploy
5. Set the deployed URL as the Nomba webhook callback

### Build Fixes

If Vercel build fails with env var errors:

| Error | Fix |
|-------|-----|
| `Client created with undefined deployment address` | Lazy-init `ConvexHttpClient` in webhook handler |
| `No address provided to ConvexReactClient` | Lazy-init `ConvexReactClient` via `useState` in provider |

Both fixes are already applied — `process.env.NEXT_PUBLIC_CONVEX_URL` is read lazily at request time, not at module import time.

---

## Testing Without Nomba

Simulate the webhook locally:

```bash
# 1. Insert a pending payment record in Convex Dashboard
#    - Set feeTuition, feeSugDues, feeFacultyDues, feeDepartmentDues
#    - Set facultySlug, departmentSlug
#    - Note the reference

# 2. Send curl to your webhook
curl -X POST http://localhost:3000/api/webhooks/nomba \
  -H "Content-Type: application/json" \
  -H "x-nomba-signature: test" \
  -d '{
    "event": "transaction.completed",
    "data": {
      "transactionId": "test-123",
      "reference": "SPLIT-YOUR-REFERENCE",
      "amount": 60100,
      "currency": "NGN"
    }
  }'
```

(For local testing, temporarily comment out the HMAC verification or set a test secret.)
