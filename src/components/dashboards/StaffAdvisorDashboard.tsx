"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WalletCard, TransactionList } from "@/components/WalletCard";

export function StaffAdvisorDashboard({ activeTab = "overview" }: { activeTab?: string }) {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const myInst = useQuery(api.auth.getMyInstitution);
  const accessibleWallets = useQuery(api.wallets.getMyAccessibleWallets);

  const entityId = currentUser?.permissions?.[0];
  const institutionId = myInst?._id as string | undefined;

  const association = useQuery(
    api.associations.getAssociationByEntityId,
    entityId && institutionId
      ? { entityId, institutionId: institutionId as any }
      : "skip"
  );

  const associationId = association?._id;
  const requests = useQuery(
    api.withdrawals.getWithdrawalHistory,
    associationId && institutionId
      ? { associationId: associationId as any, institutionId: institutionId as any }
      : "skip"
  );

  // Find the wallet associated with this association
  const assocWalletData = accessibleWallets?.find(
    (w: any) => w.wallet.associationId && associationId &&
      w.wallet.associationId.toString() === associationId.toString()
  );
  const assocWallet = assocWalletData?.wallet;

  const transactions = useQuery(
    api.wallets.getTransactions,
    assocWallet && institutionId
      ? { walletEntityId: assocWallet.entityId, institutionId: institutionId as any }
      : "skip"
  );

  const approveRequest = useMutation(api.withdrawals.approveWithdrawal);
  const execute = useMutation(api.withdrawals.executeWithdrawal);

  const [processing, setProcessing] = useState<string | null>(null);

  if (!currentUser || !myInst || !accessibleWallets) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  if (!entityId || !association) {
    return (
      <div className="p-12 rounded-xl border border-border bg-surface text-center">
        <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-primary mb-1">No Association Assigned</h2>
        <p className="text-sm text-muted">
          You haven&apos;t been assigned as a Staff Advisor to any association yet.
          Contact Student Affairs to get assigned.
        </p>
      </div>
    );
  }

  const pendingRequests = requests?.filter((r: any) => r.status === "pending") || [];
  const approvedRequests = requests?.filter((r: any) => r.status === "approved") || [];

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await approveRequest({ withdrawalId: requestId as any });
    } finally {
      setProcessing(null);
    }
  };

  const handleExecute = async (requestId: string) => {
    setProcessing(requestId);
    try {
      await execute({ withdrawalId: requestId as any });
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Staff Advisor Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Manage withdrawals and view wallet for{" "}
          <span className="font-medium text-primary">{association.name}</span>.
        </p>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Association Wallet Card */}
          {assocWallet ? (
            <>
              <WalletCard
                wallet={assocWallet}
                access="view"
                subtitle={`${association.type} Association Wallet`}
              />
              {/* Transactions */}
              {transactions && transactions.length > 0 ? (
                <TransactionList
                  transactions={transactions}
                  maxItems={10}
                  title="Wallet Transactions"
                />
              ) : (
                <div className="p-12 rounded-xl border border-border bg-surface text-center">
                  <p className="text-muted">No wallet transactions for this association yet.</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 rounded-xl border border-border bg-surface text-center">
              <p className="text-muted">No wallet data available for this association yet.</p>
            </div>
          )}
        </>
      )}

      {activeTab === "withdrawals" && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="p-6 rounded-xl border border-border bg-surface">
              <p className="text-sm text-muted mb-1">Pending Approval</p>
              <p className="text-2xl font-bold text-pending">{pendingRequests.length}</p>
            </div>
            <div className="p-6 rounded-xl border border-border bg-surface">
              <p className="text-sm text-muted mb-1">Approved (Ready to Execute)</p>
              <p className="text-2xl font-bold text-info">{approvedRequests.length}</p>
            </div>
          </div>

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-primary">Pending Approval</h2>
              </div>
              <div className="divide-y divide-border-subtle">
                {pendingRequests.map((req: any) => (
                  <div key={req._id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-hover transition-colors duration-150">
                    <div className="flex-1 min-w-0">
                      <span className="text-lg font-bold text-gold font-mono">₦{req.amount.toLocaleString()}</span>
                      <p className="text-sm text-secondary mt-1">{req.reason}</p>
                      <p className="text-xs text-muted mt-0.5">
                        Initiated {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApprove(req._id)}
                      disabled={processing === req._id}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-info text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                    >
                      {processing === req._id ? "..." : "Approve"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approved - Ready to Execute */}
          {approvedRequests.length > 0 && (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold text-primary">Ready to Execute</h2>
              </div>
              <div className="divide-y divide-border-subtle">
                {approvedRequests.map((req: any) => (
                  <div key={req._id} className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-hover transition-colors duration-150">
                    <div className="flex-1 min-w-0">
                      <span className="text-lg font-bold text-info font-mono">₦{req.amount.toLocaleString()}</span>
                      <p className="text-sm text-secondary mt-1">{req.reason}</p>
                      <p className="text-xs text-muted mt-0.5">
                        Approved {req.approvedAt ? new Date(req.approvedAt).toLocaleDateString() : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleExecute(req._id)}
                      disabled={processing === req._id}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
                    >
                      {processing === req._id ? "..." : "Execute"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pendingRequests.length === 0 && approvedRequests.length === 0 && (
            <div className="p-12 rounded-xl border border-border bg-surface text-center">
              <p className="text-muted">No pending or approved withdrawal requests for this association.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
