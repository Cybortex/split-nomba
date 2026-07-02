# Users & User Roles — Complete Reference

**Project:** Split — Institutional Payment Routing Platform
**Last Updated:** 1 July 2026

---

## 🏛️ Role Hierarchy & Delegation Chain

```
SUPER_ADMIN (Global)
    │
    │  Approves institution registration
    ▼
INSTITUTION_ADMIN (Institution-wide)
    │
    │  Creates faculties, departments, imports students
    │  Creates FINANCE and STUDENT_AFFAIRS accounts
    ├──────────────────────────┐
    ▼                          ▼
FINANCE (Institution)    STUDENT_AFFAIRS (Institution)
    │                          │
    │  Sets allocation rules   │  Creates association wallets
    │  Processes disbursements │  Assigns associations to structures
    │                          │
    └──────────────────────────┘
               │
               ▼
          DEAN (Faculty-scoped)
               │
               │  Assigns HODs
               │  Assigns Faculty STAFF_ADVISOR
               │
          ┌────┴────┐
          ▼         ▼
         HOD     FACULTY STAFF_ADVISOR
   (Department)    (Faculty Association)
          │              │
          │  Assigns     │  Assigns STUDENT_EXCO
          │  Dept STAFF  │  for faculty associations
          │  ADVISOR     │
          ▼              ▼
   DEPT STAFF_ADVISOR   STUDENT_EXCO (Faculty)
   (Dept Association)         │
          │                   │  Initiates withdrawals
          │  Assigns          │  (needs STAFF_ADVISOR approval)
          │  STUDENT_EXCO     │
          │  for dept assoc   │
          ▼                   ▼
   STUDENT_EXCO (Dept)    STAFF
                              │
                              │  Receives allowances/salary
                              │  Views payment history
                              │
                              ▼
                          STUDENT
                              │
                              │  Pays fees
                              │  Views public data
```

---

## 📊 Role Matrix

| # | Role | Level | Scope | Created By | Can Create |
|---|------|-------|-------|------------|------------|
| 1 | **SUPER_ADMIN** | 100 | Global | Pre-seeded | N/A (highest level) |
| 2 | **INSTITUTION_ADMIN** | 80 | Institution | SUPER_ADMIN | FINANCE, STUDENT_AFFAIRS, STUDENT, STAFF |
| 3 | **FINANCE** | 70 | Institution | INSTITUTION_ADMIN | — |
| 4 | **STUDENT_AFFAIRS** | 60 | Institution | INSTITUTION_ADMIN | Association wallets |
| 5 | **DEAN** | 50 | Faculty | INSTITUTION_ADMIN | HOD, Faculty STAFF_ADVISOR |
| 6 | **HOD** | 40 | Department | DEAN | Departmental STAFF_ADVISOR |
| 7 | **STAFF** | 35 | Institution | INSTITUTION_ADMIN | — |
| 8 | **STAFF_ADVISOR** | 30 | Association | DEAN (faculty level), HOD (dept level) | STUDENT_EXCO |
| 9 | **STUDENT_EXCO** | 20 | Association | STAFF_ADVISOR | — |
| 10 | **STUDENT** | 10 | Institution | INSTITUTION_ADMIN (bulk import) | — |

---

## 🎯 Full Role Functions — What Each Role Can Do

### 1. SUPER_ADMIN (Level 100)
| Function | Description |
|----------|-------------|
| **Approve Institution Registration** | Review and approve/reject institution onboarding requests |
| **List Pending Registrations** | View all institutions waiting for approval |
| **List All Institutions** | View every registered institution on the platform |
| **View Global Audit Logs** | See all audit logs across all institutions |
| **Deactivate Institution** | Suspend a rogue institution |

**User Story:**
> As a SUPER_ADMIN, I want to review institution registration requests so that only legitimate institutions can use the platform. When I approve an institution, their INSTITUTION_ADMIN account is created and they can start setting up their structure.

---

### 2. INSTITUTION_ADMIN (Level 80)

| Function | Description |
|----------|-------------|
| **Manage Faculties** | Create, rename, or deactivate faculties in the institution |
| **Manage Departments** | Create, rename, or deactivate departments under a faculty |
| **Import Student Records (CSV)** | Bulk upload students with matric, email, faculty, department |
| **Create Staff Accounts** | Create individual staff accounts with email + role |
| **Create FINANCE Account** | Assign a user the FINANCE role |
| **Create STUDENT_AFFAIRS Account** | Assign a user the STUDENT_AFFAIRS role |
| **Create DEAN Account** | Assign a user the DEAN role + scope to a faculty |
| **Create STAFF Account** | Assign a user the STAFF role |
| **Create STUDENT Accounts** | Bulk create or individual create student accounts |
| **Deactivate Users** | Suspend any user within their institution |
| **View Institution Users** | List all users in their institution with roles |
| **View Institution Audit Logs** | See all audit logs scoped to their institution |

**User Stories:**
> As an INSTITUTION_ADMIN, I want to create faculties and departments so that the institution's academic structure is reflected in the platform.

> As an INSTITUTION_ADMIN, I want to upload a CSV of student records so that all students can access the platform without manual data entry.

> As an INSTITUTION_ADMIN, I want to create a FINANCE account so that a trusted staff member can manage fee allocations and financial oversight.

> As an INSTITUTION_ADMIN, I want to create a DEAN account scoped to the Computing faculty so that the Dean can manage their faculty's staff assignments.

---

### 3. FINANCE (Level 70)

| Function | Description |
|----------|-------------|
| **Manage Level Fee Items** | Create fixed fee items per level (e.g., "Tuition ₦50,000" for 100 Level). Only per level, not per department/faculty. |
| **Set Fee Allocation Rules** | Configure how fees are split across wallets (fixed or percentage per wallet) |
| **View All Wallets** | See every wallet balance across the institution |
| **View All Transactions** | Monitor all payment and withdrawal transactions |
| **Process Staff Disbursements** | Pay allowances/salary to staff members via Nomba |
| **Bulk Disbursement** | Pay multiple staff members at once (salary run) |
| **View Disbursement History** | See all past payments to staff |
| **Monitor Withdrawals** | View all pending and completed withdrawal requests |
| **Export Financial Reports** | Download transaction data for accounting |

**User Stories:**
> As a FINANCE officer, I want to create fee items for each level — e.g., 100 Level: Tuition ₦50,000 + Lab Fee ₦5,000 + Sports ₦2,000 = ₦57,000 — so that every student knows exactly what they owe and what they're paying for.

> As a FINANCE officer, I want to set the fee allocation rules so that each student's payment is split correctly across institution, faculty, department, association, and ICT wallets.

> As a FINANCE officer, I want to run a bulk salary disbursement to all 50 staff members so that they receive their monthly allowances without manual bank transfers.

> As a FINANCE officer, I want to view all wallet balances so that I can track the institution's financial health in real-time.

---

### 4. STUDENT_AFFAIRS (Level 60)

| Function | Description |
|----------|-------------|
| **Create Association Wallet** | Create a new association wallet for a faculty or department |
| **Link Association to Faculty** | Assign a wallet to a specific faculty |
| **Link Association to Department** | Assign a wallet to a specific department |
| **View All Associations** | List all association wallets in the institution |
| **Monitor Association Activity** | View transactions related to association wallets |
| **Deactivate Association** | Suspend a dormant or inactive association wallet |

**User Stories:**
> As a STUDENT_AFFAIRS officer, I want to create an association wallet for the Faculty of Computing so that the faculty's student association can manage their funds.

> As a STUDENT_AFFAIRS officer, I want to assign the CS Department association wallet to the Computing faculty so that it has the correct parent structure.

---

### 5. DEAN (Level 50 — Faculty-scoped)

| Function | Description |
|----------|-------------|
| **Assign HOD** | Select and assign a user as HOD for any department under their faculty |
| **Assign Faculty STAFF_ADVISOR** | Select and assign a user as STAFF_ADVISOR for the faculty-level association |
| **View Faculty Wallet** | See the faculty's wallet balance and transactions |
| **View Department Wallets** | See all department wallets under the faculty |
| **View Faculty Records** | See student records and payment data for the faculty |
| **Remove HOD** | Revoke a HOD's access if needed |
| **Remove Faculty STAFF_ADVISOR** | Revoke a Staff Advisor's access if needed |

**User Stories:**
> As the Dean of Computing, I want to assign Dr. Adeyemi as HOD of Computer Science so that the department has leadership within the platform.

> As the Dean of Computing, I want to assign Mr. Okonkwo as the Faculty Staff Advisor so that the faculty association has proper oversight.

> As the Dean of Computing, I want to view the faculty wallet so that I can track how much the faculty has collected from student fees.

---

### 6. HOD (Level 40 — Department-scoped)

| Function | Description |
|----------|-------------|
| **Assign Departmental STAFF_ADVISOR** | Select and assign a user as STAFF_ADVISOR for the department-level association |
| **View Department Wallet** | See the department's wallet balance and transactions |
| **View Department Student Records** | See student records for the department |
| **Remove Departmental STAFF_ADVISOR** | Revoke a Staff Advisor's access if needed |

**User Stories:**
> As the HOD of Computer Science, I want to assign Mrs. Eze as the departmental Staff Advisor so that the CS Association has proper oversight.

> As the HOD of Computer Science, I want to view the department wallet so that I can see how much the department has collected from fee allocations.

---

### 7. STAFF (Level 35 — Institution)

| Function | Description |
|----------|-------------|
| **View Allowance History** | See all allowances and salary payments received |
| **Link Nomba Account** | Register their personal Nomba account for receiving payments |
| **View Payment Details** | See breakdown of each payment (amount, date, reason) |
| **Download Payment Receipt** | Download a receipt for each payment received |
| **View Institution Public Data** | See general institution transparency data |

**User Stories:**
> As a STAFF member, I want to link my Nomba account so that I can receive my monthly allowance directly.

> As a STAFF member, I want to view my payment history so that I can track all allowances and salaries I've received.

> As a STAFF member, I want to receive a notification when my allowance is paid so that I know when funds are available.

---

### 8. STAFF_ADVISOR (Level 30 — Association-scoped)

| Function | Description |
|----------|-------------|
| **Approve Withdrawal Requests** | Review and approve/reject withdrawal requests initiated by STUDENT_EXCO |
| **Assign STUDENT_EXCO** | Add or remove STUDENT_EXCO members for their assigned association |
| **View Association Wallet** | See the association wallet balance and all transactions |
| **View Pending Approvals** | See all withdrawal requests waiting for their approval |

**User Stories:**
> As the Faculty Staff Advisor, I want to assign student executives to the faculty association so that they can manage withdrawals on behalf of the students.

> As the Departmental Staff Advisor, I want to review and approve a ₦50,000 withdrawal request from the CS Association President so that the association can fund their event.

---

### 9. STUDENT_EXCO (Level 20 — Association-scoped)

| Function | Description |
|----------|-------------|
| **Initiate Withdrawal Request** | Create a withdrawal request from the association wallet |
| **View Association Wallet** | See the association wallet balance |
| **View Withdrawal History** | See all past withdrawals for the association |
| **Execute Approved Withdrawal** | Complete a withdrawal after STAFF_ADVISOR approval |
| **Pay Student Fees** | Can also pay their own student fees (inherits STUDENT capabilities) |

**User Stories:**
> As the CS Association President (STUDENT_EXCO), I want to initiate a ₦30,000 withdrawal for our departmental workshop so that we can access association funds.

> As a STUDENT_EXCO, I want to view our association wallet so that I can report the current balance to my fellow students.

---

### 10. STUDENT (Level 10 — Institution)

| Function | Description |
|----------|-------------|
| **Pay Fees** | Enter matric number and pay institution fees via Nomba |
| **View Payment History** | See all payments they have made |
| **View Receipt** | Download/print payment receipt |
| **View Public Dashboard** | See institution-wide collection totals (transparency) |
| **View Fee Breakdown** | See how their payment is split across wallets |

**User Stories:**
> As a STUDENT, I want to pay my ₦75,000 school fees using my card so that I can complete my registration.

> As a STUDENT, I want to see how my payment is split so that I understand where my money goes (80% institution, 12% faculty, 5% department, 2% association, 1% ICT).

---

## 💰 Staff Allowance & Disbursement Feature

### Overview
The platform handles two-way money movement:
1. **Students pay IN** — Fees collected and routed to institution wallets
2. **Staff get paid OUT** — Allowances and salaries disbursed from institution wallets to staff Nomba accounts

### Flow

```
FINANCE → "Disburse Allowance"
  → Select recipient(s): individual staff or bulk (all staff in a faculty/department)
  → Enter amount per person
  → Select reason: Salary, Monthly Allowance, Research Grant, Reimbursement, Bonus
  → Select source wallet: Institution Tuition, Faculty Wallet, etc.
  → Click "Process Payment"
  
  SYSTEM:
  1. Deducts total amount from source wallet
  2. Logs debit transaction in immutable ledger
  3. Calls Nomba payout API to send funds to each staff member's Nomba account
  4. Logs audit trail: WITHDRAWAL_COMPLETED
  5. Staff member receives notification

STAFF → "My Allowances"
  → View all payments received
  → Download receipts
  → Link/update personal Nomba account
```

### Nomba Integration for Payouts

Nomba supports bulk payouts via their transfer API:
```
POST /v1/transfers
{
  "amount": "50000.00",
  "currency": "NGN",
  "recipientAccount": "0123456789",
  "recipientBank": "044",  // Access Bank code
  "narration": "Monthly Allowance - June 2026",
  "reference": "SPLIT-DISB-1719388200000-ABC"
}
```

### Wallet Impact

| Transaction | Wallet Effect | Ledger Entry |
|------------|---------------|--------------|
| Fee Payment | Wallet CREDITED | `direction: "credit", reason: "payment_received"` |
| Staff Disbursement | Wallet DEBITED | `direction: "debit", reason: "staff_allowance"` |

---

## 🔐 Assignment Rules Summary

| Action | Performed By | Notes |
|--------|-------------|-------|
| Create Institution | SUPER_ADMIN | After approving registration |
| Create Faculty | INSTITUTION_ADMIN | Defines institution structure |
| Create Department | INSTITUTION_ADMIN | Under a specific faculty |
| Assign FINANCE | INSTITUTION_ADMIN | Institution-wide financial role |
| Assign STUDENT_AFFAIRS | INSTITUTION_ADMIN | Manages associations |
| Assign DEAN | INSTITUTION_ADMIN | Scoped to a specific faculty |
| Assign HOD | DEAN | Scoped to a department under dean's faculty |
| Assign Faculty STAFF_ADVISOR | DEAN | For the faculty-level association |
| Assign Department STAFF_ADVISOR | HOD | For the department-level association |
| Assign STUDENT_EXCO (Faculty) | Faculty STAFF_ADVISOR | For the faculty association |
| Assign STUDENT_EXCO (Department) | Dept STAFF_ADVISOR | For the department association |
| Assign STAFF | INSTITUTION_ADMIN | Creates staff accounts |
| Set Allocation Rules | FINANCE | Fee amounts per faculty/department |
| Create Association Wallet | STUDENT_AFFAIRS | Links to faculty or department |
| Import Student Records | INSTITUTION_ADMIN | CSV upload |
| Approve Withdrawal | STAFF_ADVISOR | For their association |
| Initiate Withdrawal | STUDENT_EXCO | Requires STAFF_ADVISOR approval |

---

## 👤 User Account Lifecycle

```
1. INSTITUTION_ADMIN uploads CSV or creates account manually
2. Clerk Admin API creates the user (email + temporary password)
3. Clerk sends invitation email (or user is given credentials manually)
4. User logs in for the first time
   → Clerk forces password change
5. User sets their own password
6. User accesses Split dashboard
   → Sees their available roles
   → Can switch between roles if they have multiple
7. If deactivated by admin → login blocked by syncUser
```

**Password Rules:**
- **Students:** Default password = matric number (e.g., `FUT/2022/CSC/001`). Forced to change on first login.
- **Staff/Admin:** Default password = auto-generated by Clerk. Sent via invitation email. Forced to change on first login.

---

## 📱 Dashboard View by Role

| Role | Default Dashboard View | Additional Tabs |
|------|----------------------|-----------------|
| SUPER_ADMIN | Institution Approvals | All Institutions, Global Audit Logs |
| INSTITUTION_ADMIN | Institution Overview | Faculties, Departments, Users, Import |
| FINANCE | All Wallets | Allocation Rules, Disbursements, Reports |
| STUDENT_AFFAIRS | Associations List | Association Wallets |
| DEAN | Faculty Wallet | Departments, HODs, Staff Advisors |
| HOD | Department Wallet | Staff Advisors |
| STAFF | My Allowances | Payment History, Nomba Account |
| STAFF_ADVISOR | Pending Approvals | Association Wallet, Exco Members |
| STUDENT_EXCO | Association Wallet | Initiate Withdrawal, History |
| STUDENT | Pay Fees | My Payments, Receipts |

---

## 🏆 Staff Allowance — User Stories

> As a FINANCE officer, I want to disburse monthly allowances to all 30 staff in the Computing faculty so that they receive their payments without manual bank transfers.

> As a STAFF member, I want to link my Nomba account so that I can receive my monthly allowance directly and securely.

> As a STAFF member, I want to view my full payment history so that I can track all allowances and salaries I've received on the platform.

> As a FINANCE officer, I want to see a complete record of all disbursements made so that I can reconcile institutional expenses.

> As an INSTITUTION_ADMIN, I want to create STAFF accounts so that faculty and staff can receive their allowances through the platform instead of external payment methods.

---

## 📋 Summary

The platform has **10 roles** with a clear delegation hierarchy:
- **Bottom up:** Students pay fees → funds route to wallets
- **Top down:** Administrators create structure → assign roles → manage access
- **Sideways:** Associations have their own wallets → Exco initiates → Advisor approves
- **New dimension:** Staff receive allowances → FINANCE disburses from wallets
