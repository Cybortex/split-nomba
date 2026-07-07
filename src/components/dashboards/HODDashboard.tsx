"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WalletCard, TransactionList } from "@/components/WalletCard";
import { AssociationManager } from "@/components/admin/AssociationManager";

export function HODDashboard({ activeTab }: { activeTab?: string }) {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const myInst = useQuery(api.auth.getMyInstitution);
  const accessibleWallets = useQuery(api.wallets.getMyAccessibleWallets);

  const entityId = currentUser?.permissions?.[0];
  const institutionId = myInst?._id as string | undefined;

  const deptWalletData = accessibleWallets?.find(
    (w: any) => w.wallet.type === "department"
  );
  const deptWallet = deptWalletData?.wallet;

  const transactions = useQuery(
    api.wallets.getTransactions,
    deptWallet && institutionId
      ? { walletEntityId: deptWallet.entityId, institutionId: institutionId as any }
      : "skip"
  );

  if (!currentUser || !myInst || !accessibleWallets) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  if (!entityId) {
    return (
      <div className="card p-8 sm:p-12 text-center">
        <p className="text-muted">
          No department assigned. Contact your Institution Admin to set your department permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">Department Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Viewing collections for your assigned department.
        </p>
      </div>

      {deptWallet ? (
        <>
          <WalletCard wallet={deptWallet} />
          {institutionId && (
            <div className="pt-2">
              <AssociationManager
                entityId={entityId}
                institutionId={institutionId}
                role="HOD"
              />
            </div>
          )}
          <TransactionList
            transactions={transactions || []}
            title="Recent Transactions"
            emptyMessage="No transactions yet for this department."
          />
        </>
      ) : (
        <div className="card p-8 sm:p-12 text-center">
          <p className="text-muted">No wallet data available for your department yet.</p>
        </div>
      )}
    </div>
  );
}
