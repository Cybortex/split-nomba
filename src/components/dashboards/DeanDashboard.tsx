"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WalletCard, TransactionList } from "@/components/WalletCard";
import { AssociationManager } from "@/components/admin/AssociationManager";

export function DeanDashboard({ activeTab }: { activeTab?: string }) {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const myInst = useQuery(api.auth.getMyInstitution);
  const accessibleWallets = useQuery(api.wallets.getMyAccessibleWallets);

  const entityId = currentUser?.permissions?.[0];
  const institutionId = myInst?._id as string | undefined;

  const facultyWalletData = accessibleWallets?.find(
    (w: any) => w.wallet.type === "faculty"
  );
  const facultyWallet = facultyWalletData?.wallet;

  const transactions = useQuery(
    api.wallets.getTransactions,
    facultyWallet && institutionId
      ? { walletEntityId: facultyWallet.entityId, institutionId: institutionId as any }
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
      <div className="p-6 sm:p-12 rounded-xl border border-border bg-surface text-center">
        <p className="text-muted">
          No faculty assigned. Contact your Institution Admin to set your faculty permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">Faculty Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Viewing collections for your assigned faculty.
        </p>
      </div>

      {facultyWallet ? (
        <>
          <WalletCard wallet={facultyWallet} />
          {institutionId && (
            <div className="pt-2">
              <AssociationManager
                entityId={entityId}
                institutionId={institutionId}
                role="DEAN"
              />
            </div>
          )}
          <TransactionList
            transactions={transactions || []}
            title="Recent Transactions"
            emptyMessage="No transactions yet for this faculty."
          />
        </>
      ) : (
        <div className="p-6 sm:p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No wallet data available for your faculty yet.</p>
        </div>
      )}
    </div>
  );
}
