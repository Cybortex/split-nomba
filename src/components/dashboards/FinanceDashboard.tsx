"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function FinanceDashboard({ institutionId }: { institutionId?: string }) {
  const wallets = useQuery(api.wallets.listAll, institutionId ? { institutionId: institutionId as any } : "skip");
  const students = useQuery(api.studentRecords.listStudents, institutionId ? { institutionId: institutionId as any } : "skip");

  if (!wallets) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const totalCollected = wallets.reduce((sum: number, w: any) => sum + w.totalCollected, 0);
  const totalBalance = wallets.reduce((sum: number, w: any) => sum + w.availableBalance, 0);
  const totalTransactions = wallets.reduce((sum: number, w: any) => sum + w.transactionCount, 0);
  const totalStudents = students?.length ?? 0;

  const stats = [
    { label: "Total Collected", value: `₦${totalCollected.toLocaleString()}`, color: "text-gold" },
    { label: "Available Balance", value: `₦${totalBalance.toLocaleString()}`, color: "text-success" },
    { label: "Transactions", value: totalTransactions.toString(), color: "text-info" },
    { label: "Active Students", value: totalStudents.toString(), color: "text-pending" },
  ];

  const walletTypes = [
    { type: "institution", label: "Institution", gradient: "from-gold/10 to-gold/5" },
    { type: "faculty", label: "Faculty", gradient: "from-success/10 to-success/5" },
    { type: "department", label: "Department", gradient: "from-info/10 to-info/5" },
    { type: "association", label: "Association", gradient: "from-pending/10 to-pending/5" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl border border-border bg-surface">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Wallet Breakdown */}
      {walletTypes.map(({ type, label, gradient }) => {
        const typeWallets = wallets.filter((w: any) => w.type === type);
        if (typeWallets.length === 0) return null;

        return (
          <div key={type} className={`rounded-xl border border-border bg-gradient-to-br ${gradient} p-6`}>
            <h3 className="font-semibold text-primary mb-4">{label} Wallets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium text-right">Balance</th>
                    <th className="pb-2 font-medium text-right">Collected</th>
                    <th className="pb-2 font-medium text-right">Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {typeWallets.map((wallet: any) => (
                    <tr key={wallet._id} className="border-t border-border-subtle">
                      <td className="py-2 font-medium text-primary">{wallet.name}</td>
                      <td className="py-2 text-right font-mono text-success">₦{wallet.availableBalance.toLocaleString()}</td>
                      <td className="py-2 text-right font-mono text-gold">₦{wallet.totalCollected.toLocaleString()}</td>
                      <td className="py-2 text-right text-secondary">{wallet.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {wallets.length === 0 && (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No wallets created yet. Import an institution structure to get started.</p>
        </div>
      )}
    </div>
  );
}
