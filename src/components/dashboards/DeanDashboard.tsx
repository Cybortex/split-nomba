"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function DeanDashboard({ entityId, institutionId }: { entityId: string; institutionId?: string }) {
  const data = useQuery(api.wallets.getDeanView, entityId && institutionId ? { entityId, institutionId: institutionId as any } : "skip");

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
        <h1 className="text-2xl font-bold text-primary">Faculty Dashboard</h1>
        <p className="text-muted">Viewing collections for your faculty</p>
      </div>

      {data.faculty ? (
        <>
          {/* Faculty Summary */}
          <div className="p-6 rounded-xl border border-border bg-surface">
            <h2 className="font-semibold text-primary mb-4">{data.faculty.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-surface-secondary p-4 rounded-xl">
                <p className="text-sm text-muted">Available Balance</p>
                <p className="text-xl font-bold text-success">₦{data.faculty.availableBalance.toLocaleString()}</p>
              </div>
              <div className="bg-surface-secondary p-4 rounded-xl">
                <p className="text-sm text-muted">Total Collected</p>
                <p className="text-xl font-bold text-gold">₦{data.faculty.totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Department Wallets */}
          {data.departments.length > 0 && (
            <div className="p-6 rounded-xl border border-border bg-surface">
              <h2 className="font-semibold text-primary mb-4">Departments under this Faculty</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted">
                      <th className="pb-3 font-medium">Department</th>
                      <th className="pb-3 font-medium text-right">Balance</th>
                      <th className="pb-3 font-medium text-right">Collected</th>
                      <th className="pb-3 font-medium text-right">Txns</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.departments.map((dept: any) => (
                      <tr key={dept._id} className="border-t border-border-subtle">
                        <td className="py-3 font-medium text-primary">{dept.name}</td>
                        <td className="py-3 text-right font-mono text-success">₦{dept.availableBalance.toLocaleString()}</td>
                        <td className="py-3 text-right font-mono text-gold">₦{dept.totalCollected.toLocaleString()}</td>
                        <td className="py-3 text-right text-secondary">{dept.transactionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No wallet data available for your faculty yet.</p>
        </div>
      )}
    </div>
  );
}
