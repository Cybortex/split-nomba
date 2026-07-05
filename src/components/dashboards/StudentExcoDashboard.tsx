"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WalletCard, TransactionList } from "@/components/WalletCard";

export function StudentExcoDashboard({ activeTab = "overview" }: { activeTab?: string }) {
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

  // Find the exco's wallet from accessible wallets (match by associationId)
  const assocWalletData = accessibleWallets?.find(
    (w: any) => w.access === "transact" && w.association?._id?.toString() === associationId?.toString()
  );
  const assocWallet = assocWalletData?.wallet;

  const requests = useQuery(
    api.withdrawals.getWithdrawalHistory,
    associationId && institutionId
      ? { associationId: associationId as any, institutionId: institutionId as any }
      : "skip"
  );

  const transactions = useQuery(
    api.wallets.getTransactions,
    assocWallet && institutionId
      ? { walletEntityId: assocWallet.entityId, institutionId: institutionId as any }
      : "skip"
  );

  const initiate = useMutation(api.withdrawals.initiateWithdrawal);
  const execute = useMutation(api.withdrawals.executeWithdrawal);

  const [showInitiate, setShowInitiate] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

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
        <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-primary mb-1">No Association Assigned</h2>
        <p className="text-sm text-muted">
          You haven&apos;t been assigned as an executive to any association yet.
          Contact Student Affairs to get assigned.
        </p>
      </div>
    );
  }

  const myRequests = requests?.filter((r: any) =>
    r.status === "pending" || r.status === "approved"
  ) || [];

  const handleInitiate = async () => {
    if (!assocWallet || !amount || !reason) return;
    setProcessing("initiate");
    setError("");
    try {
      await initiate({
        institutionId: institutionId as any,
        associationId: associationId as any,
        walletId: assocWallet._id as any,
        amount: Number(amount),
        reason,
      });
      setShowInitiate(false);
      setAmount("");
      setReason("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleExecute = async (requestId: string) => {
    setProcessing(requestId);
    setError("");
    try {
      await execute({
        withdrawalId: requestId as any,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Student Exco Dashboard</h1>
          <p className="text-sm text-muted mt-1">
            Initiate and manage withdrawals for{" "}
            <span className="font-medium text-primary">{association.name}</span>.
          </p>
        </div>
        {activeTab === "withdrawals" && (
          <button
            onClick={() => setShowInitiate(!showInitiate)}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            {showInitiate ? "Cancel" : "New Withdrawal"}
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">
          {error}
        </div>
      )}

      {activeTab === "overview" && (
        <>
          {/* Wallet & Transactions Section */}
          {assocWallet ? (
            <>
              <WalletCard
                wallet={assocWallet}
                access="transact"
                subtitle={`${association.type} Association • Withdrawable`}
              />
              <TransactionList
                transactions={transactions || []}
                title="Wallet Transactions"
                emptyMessage="No transactions for this wallet yet."
              />
            </>
          ) : (
            <div className="p-12 rounded-xl border border-border bg-surface text-center">
              <p className="text-muted">No wallet data available yet.</p>
            </div>
          )}
        </>
      )}

      {activeTab === "withdrawals" && (
        <>
          {/* Initiate Withdrawal Form */}
          {showInitiate && (
            <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
              <h2 className="font-semibold text-primary">Initiate Withdrawal</h2>
              {assocWallet && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border border-border">
                  <span className="text-lg">💰</span>
                  <div>
                    <p className="text-sm font-medium text-primary">{assocWallet.name}</p>
                    <p className="text-xs text-muted">
                      Available: ₦{(assocWallet.availableBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-secondary">Amount (₦)</label>
                <input
                  type="number"
                  placeholder="50000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  max={assocWallet?.availableBalance || 0}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-secondary">Reason</label>
                <textarea
                  placeholder="Purpose of withdrawal"
                  value={reason}
                  rows={2}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none resize-none focus:border-gold"
                />
              </div>
              <button
                onClick={handleInitiate}
                disabled={processing === "initiate" || !assocWallet}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 disabled:opacity-50"
              >
                {processing === "initiate" ? "Initiating..." : "Submit for Approval"}
              </button>
            </div>
          )}

          {/* Requests List */}
          {myRequests.length > 0 ? (
            <div className="space-y-3">
              {myRequests.map((req: any) => (
                <div
                  key={req._id}
                  className="p-5 rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gold font-mono">
                          ₦{req.amount.toLocaleString()}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-medium ${
                            req.status === "pending"
                              ? "bg-pending/10 text-pending font-mono"
                              : "bg-info/10 text-info font-mono"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm text-secondary mt-1">{req.reason}</p>
                      <p className="text-xs text-muted mt-1">
                        Created {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {req.status === "approved" && (
                      <button
                        onClick={() => handleExecute(req._id)}
                        disabled={processing === req._id}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                      >
                        {processing === req._id ? "..." : "Execute"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-xl border border-border bg-surface text-center">
              <p className="text-muted">No withdrawal requests yet. Initiate one to get started.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
