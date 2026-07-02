"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function HODDashboard({ entityId, institutionId }: { entityId?: string; institutionId?: string }) {
  const data = useQuery(api.wallets.getByEntityId, entityId && institutionId ? { entityId, institutionId: institutionId as any } : "skip");
  const transactions = useQuery(api.wallets.getTransactions, entityId && institutionId ? { walletEntityId: entityId, institutionId: institutionId as any } : "skip");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Department Dashboard</h1>
        <p className="text-sm text-muted mt-1">Viewing your department&apos;s collections.</p>
      </div>

      {data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border border-border bg-surface">
              <p className="text-sm text-muted mb-1">Available Balance</p>
              <p className="text-2xl font-bold text-success">₦{(data as any).availableBalance?.toLocaleString() || "0"}</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface">
              <p className="text-sm text-muted mb-1">Total Collected</p>
              <p className="text-2xl font-bold text-gold">₦{(data as any).totalCollected?.toLocaleString() || "0"}</p>
            </div>
          </div>

          {transactions && transactions.length > 0 && (
            <div className="p-6 rounded-xl border border-border bg-surface">
              <h2 className="font-semibold text-primary mb-4">Recent Transactions</h2>
              <div className="space-y-2">
                {transactions.slice(0, 10).map((txn: any) => (
                  <div key={txn._id} className="flex justify-between py-2 border-b border-border-subtle last:border-0">
                    <span className="text-sm text-secondary">{new Date(txn.timestamp).toLocaleDateString()}</span>
                    <span className="text-sm font-mono font-medium text-primary">₦{txn.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No wallet data available for your department yet.</p>
        </div>
      )}
    </div>
  );
}
