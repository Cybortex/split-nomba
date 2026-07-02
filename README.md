# Split — Institutional Payment Routing Platform

**Built for the Nomba Hackathon 2026**

Split automates institutional payment routing. When a student pays their dues, Split atomically routes the payment to 5 wallets (Institution, Faculty, Department, Association, ICT) using Nomba APIs — zero manual reconciliation.

## Architecture

```
Student → Payment Form → Server calculates ₦75,000 → Nomba Checkout
→ Student pays on Nomba → Nomba Webhook → Split verifies signature
→ Routing Engine → 5 wallets credited → Dashboards update in real-time
```

### Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| Backend | Convex (reactive, real-time database + serverless functions) |
| Auth | Clerk (authentication + RBAC) |
| Payments | Nomba API (sandbox) |
| Deployment | Vercel |

## 6 Security Controls

| Control | Description | Implementation |
|---------|-------------|----------------|
| 1. Server-Side Amount | Amount calculated on backend, NEVER from frontend | `payments.ts:initiatePayment` |
| 2. Request Idempotency | Unique reference prevents duplicate payments | `SPLIT-{timestamp}-{random}` |
| 3. Webhook Verification | HMAC-SHA256 signature validation | `api/webhooks/nomba/route.ts` |
| 4. Webhook Idempotency | Status check prevents double allocation | Check `status !== "completed"` |
| 5. Amount Verification | Compare webhook amount vs DB record | Reject on mismatch |
| 6. Immutable Ledger | Append-only transaction records | No delete/edit on `walletTransactions` |

## 7 RBAC Roles

| Role | Access Level |
|------|-------------|
| SUPER_ADMIN | Full access to all institutions |
| FINANCE | View all wallets, manage allocations |
| STUDENT_AFFAIRS | Manage associations |
| DEAN | View faculty collections only |
| HOD | View department collections only |
| ADVISOR | View assigned association only |
| STUDENT | View public transparency dashboard |

## Getting Started

### Prerequisites

- Node.js 20+
- Nomba hackathon sandbox credentials
- Clerk account (free tier)
- Convex account (free tier)
- Vercel account (free tier)

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd split-nomba

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your credentials

# Initialize Convex
npx convex dev

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex
CONVEX_DEPLOYMENT=prod:your-deployment-id
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Nomba API
NOMBA_API_KEY=your_sandbox_key
NOMBA_CLIENT_ID=your_client_id
NOMBA_CLIENT_SECRET=your_client_secret
NOMBA_BASE_URL=https://api.nomba-sandbox.com
NOMBA_WEBHOOK_SECRET=your_webhook_secret
NOMBA_MERCHANT_ID=your_merchant_id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Demo Flow

1. **Sign up / Sign in** via Clerk
2. **Import institution structure**: Go to `/admin/import-wallets`, upload `data/wallets.csv`
3. **Import student records**: Go to `/admin/import-students`, upload `data/students.csv`
4. **Make a payment**: Go to `/pay`, enter `FUT/2022/CSC/001`, click "Pay with Nomba"
5. **Complete test payment**: Use test card `4111 1111 1111 1111` (any date/CVC)
6. **View dashboard**: Go to `/dashboard` to see wallet updates
7. **View audit trail**: Go to `/admin/audit` to see immutable logs

## Project Structure

```
split-nomba/
├── convex/                    # Backend (Convex)
│   ├── schema.ts             # Database schema (6 tables)
│   ├── auth.ts               # Clerk auth + RBAC
│   ├── payments.ts           # Payment initiation + routing
│   ├── wallets.ts            # Wallet queries
│   ├── studentRecords.ts     # Student import
│   ├── auditLogs.ts          # Audit trail
│   ├── import.ts             # CSV import
│   └── users.ts              # User management
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── pay/             # Student payment form
│   │   ├── dashboard/       # Role-based dashboard
│   │   ├── admin/
│   │   │   ├── import-wallets/
│   │   │   ├── import-students/
│   │   │   └── audit/
│   │   └── api/webhooks/nomba/  # Webhook handler
│   └── components/          # React components
│       ├── StudentPaymentForm.tsx
│       ├── WalletDashboard.tsx
│       ├── AuditLogViewer.tsx
│       └── dashboards/
├── data/                     # Demo data
│   ├── wallets.csv
│   └── students.csv
└── .env.local               # ⚠️ .gitignore'd
```

## Deployment

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# Set environment variables in Vercel dashboard
# Update Nomba webhook callback URL to your Vercel URL
```

## Submission Checklist

- [ ] Live URL (Vercel)
- [ ] GitHub repo (public, clean)
- [ ] Demo video (2-3 min)
- [ ] Write-up (500 words)
- [ ] All 6 security controls implemented
- [ ] No API keys in code
- [ ] `.env.local` in `.gitignore`
- [ ] Mobile responsive
- [ ] No console errors

---

Built for the Nomba Hackathon 2026. 🚀
