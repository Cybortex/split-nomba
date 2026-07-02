"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StudentDashboard({ institutionId }: { institutionId?: string }) {
  const data = useQuery(api.wallets.getStudentView, institutionId ? { institutionId: institutionId as any } : "skip");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Institution Transparency Dashboard</h1>
        <p className="text-muted">Public view of institutional collection data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border border-border bg-surface">
          <p className="text-sm text-muted mb-1">Total Funds Collected</p>
          <p className="text-2xl font-bold text-gold">₦{data.totalCollected.toLocaleString()}</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface">
          <p className="text-sm text-muted mb-1">Total Payments</p>
          <p className="text-2xl font-bold text-success">{data.totalTransactions}</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface">
          <p className="text-sm text-muted mb-1">Active Wallets</p>
          <p className="text-2xl font-bold text-info">{data.walletCount}</p>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-border bg-surface">
        <h2 className="font-semibold text-primary mb-2">How Your Payments Are Routed</h2>
        <p className="text-sm text-muted mb-4">When you make a payment, it is automatically distributed as follows:</p>
        <div className="space-y-3">
          {[
            { label: "Institution Tuition (80%)", amount: "₦60,000" },
            { label: "Faculty Wallet (12%)", amount: "₦9,000" },
            { label: "Department Wallet (5%)", amount: "₦3,750" },
            { label: "Student Association (1-2%)", amount: "₦750-1,500" },
            { label: "ICT Infrastructure (1-8%)", amount: "₦750-6,000" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
              <span className="text-sm text-secondary">{item.label}</span>
              <span className="text-sm font-mono font-medium text-primary">{item.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 rounded-xl bg-gold-subtle border border-gold/15">
        <p className="text-sm text-gold-royal">
          <strong>🔒 Transparency:</strong> All wallet transactions are logged in an immutable audit trail. Every payment is traceable and verifiable. Funds are held by the institution&apos;s Nomba account.
        </p>
      </div>
    </div>
  );
}
