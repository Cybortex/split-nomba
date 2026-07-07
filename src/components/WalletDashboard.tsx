"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function WalletDashboard({ entityId, institutionId }: { entityId: string; institutionId?: string }) {
  const wallet = useQuery(api.wallets.getByEntityId, entityId && institutionId ? { entityId, institutionId: institutionId as any } : "skip");
  const transactions = useQuery(api.wallets.getTransactions, entityId && institutionId ? { walletEntityId: entityId, institutionId: institutionId as any } : "skip");

  if (!wallet) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-primary">{wallet.name}</h2>
        <p className="text-sm text-muted">Wallet • {wallet.type}</p>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-secondary p-4 rounded-xl">
          <p className="text-sm text-muted">Available Balance</p>
          <p className="text-2xl font-bold text-success">₦{wallet.availableBalance.toLocaleString()}</p>
        </div>
        <div className="bg-surface-secondary p-4 rounded-xl">
          <p className="text-sm text-muted">Total Collected</p>
          <p className="text-2xl font-bold text-gold">₦{wallet.totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-surface-secondary p-4 rounded-xl">
          <p className="text-sm text-muted">Transactions</p>
          <p className="text-2xl font-bold text-info">{wallet.transactionCount}</p>
        </div>
      </div>

      {transactions && transactions.length > 0 && (
        <div className="border-t border-border">
          <div className="p-6">
            <h3 className="font-semibold text-primary mb-4">Recent Transactions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Amount</th>
                    <th className="pb-2 font-medium">Direction</th>
                    <th className="pb-2 font-medium">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((txn: any) => (
                    <tr key={txn._id} className="border-t border-border-subtle">
                      <td className="py-2 text-xs text-muted">{new Date(txn.timestamp).toLocaleString()}</td>
                      <td className="py-2 font-mono font-medium text-primary">₦{txn.amount.toLocaleString()}</td>
                      <td className="py-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                          txn.direction === "credit" ? "bg-success/10 text-success" : "bg-error/10 text-error"
                        }`}>{txn.direction}</span>
                      </td>
                      <td className="py-2 text-xs text-secondary">{txn.reason.replace(/_/g, " ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
