"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WalletCard, TransactionList } from "@/components/WalletCard";
import { Coins, Users, ShieldCheck, AlertCircle } from "lucide-react";

const NIGERIAN_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "First Bank", code: "011" },
  { name: "GTBank", code: "058" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Moniepoint MFB", code: "50515" },
  { name: "OPay", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Sterling Bank", code: "050" },
  { name: "Union Bank", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

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
  const execute = useAction(api.withdrawals.executeWithdrawal);
  const lookupAccount = useAction(api.nomba.lookupBankAccount);

  const [showInitiate, setShowInitiate] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Bank Transfer Payout States
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [recipientAccountName, setRecipientAccountName] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  // Automatically lookup bank account details when bank and account number are filled
  useEffect(() => {
    if (accountNumber.length === 10 && bankCode) {
      const runLookup = async () => {
        setVerifying(true);
        setVerificationError("");
        setRecipientAccountName("");
        try {
          const res = await lookupAccount({ accountNumber, bankCode });
          setRecipientAccountName(res.accountName);
        } catch (err: any) {
          setVerificationError(err.message || "Failed to resolve bank account.");
        } finally {
          setVerifying(false);
        }
      };
      runLookup();
    } else {
      setRecipientAccountName("");
      setVerificationError("");
    }
  }, [accountNumber, bankCode, lookupAccount]);

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
          <Users className="w-8 h-8 text-info" />
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

    // If bank details entered, verify that name is resolved first
    if (accountNumber && !recipientAccountName) {
      setError("Please wait for the bank account details to be verified.");
      return;
    }

    setProcessing("initiate");
    setError("");
    try {
      const bankName = NIGERIAN_BANKS.find((b) => b.code === bankCode)?.name || "";
      await initiate({
        institutionId: institutionId as any,
        associationId: associationId as any,
        walletId: assocWallet._id as any,
        amount: Number(amount),
        reason,
        recipientBankName: bankName || undefined,
        recipientAccountNumber: accountNumber || undefined,
        recipientBankCode: bankCode || undefined,
        recipientAccountName: recipientAccountName || undefined,
      });
      setShowInitiate(false);
      setAmount("");
      setReason("");
      setBankCode("");
      setAccountNumber("");
      setRecipientAccountName("");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                  <Coins className="w-5 h-5 text-gold flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-primary">{assocWallet.name}</p>
                    <p className="text-xs text-muted">
                      Available: ₦{(assocWallet.availableBalance || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-secondary">Recipient Bank</label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold"
                  >
                    <option value="">Select a Bank</option>
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-secondary">Account Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="e.g., 0123456789"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold"
                  />
                </div>
              </div>

              {/* Verification name resolution card */}
              {verifying && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-secondary border border-border text-xs text-muted">
                  <span className="animate-spin rounded-full h-3 w-3 border-2 border-gold border-t-transparent" />
                  Resolving recipient account name...
                </div>
              )}
              {recipientAccountName && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/15 text-xs text-success">
                  <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                  <span>Verified Name: <strong className="font-mono uppercase">{recipientAccountName}</strong></span>
                </div>
              )}
              {verificationError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-error/5 border border-error/15 text-xs text-error">
                  <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                  <span>{verificationError}</span>
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
                disabled={processing === "initiate" || !assocWallet || !amount || !reason || (accountNumber.length > 0 && !recipientAccountName)}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 disabled:opacity-50 font-medium"
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
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

                      {req.recipientAccountNumber && (
                        <div className="mt-2 p-2.5 rounded-lg bg-surface-secondary border border-border text-xs space-y-1">
                          <p className="font-semibold text-primary">Recipient Account details:</p>
                          <p className="text-secondary">Name: <span className="font-mono text-primary font-medium">{req.recipientAccountName}</span></p>
                          <p className="text-secondary">Bank: <span className="text-primary font-medium">{req.recipientBankName} ({req.recipientAccountNumber})</span></p>
                          {req.nombaTransferRef && (
                            <p className="text-muted-dark">Payout Reference: <span className="font-mono">{req.nombaTransferRef}</span></p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-muted mt-1.5">
                        Created {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {req.status === "approved" && (
                      <button
                        onClick={() => handleExecute(req._id)}
                        disabled={processing === req._id}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50 flex-shrink-0"
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
