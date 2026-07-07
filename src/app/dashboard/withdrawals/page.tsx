"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Scale, Lock, ShieldCheck, AlertCircle } from "lucide-react";

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

export default function WithdrawalsPage() {
  const { isSignedIn } = useUser();
  const myInst = useQuery(api.auth.getMyInstitution);
  const requests = useQuery(api.withdrawals.getAllPendingWithdrawals, myInst?._id ? { institutionId: myInst._id as any } : "skip");
  const initiate = useMutation(api.withdrawals.initiateWithdrawal);
  const approveRequest = useMutation(api.withdrawals.approveWithdrawal);
  const execute = useAction(api.withdrawals.executeWithdrawal);
  const currentUser = useQuery(api.auth.getCurrentUser);
  const lookupAccount = useAction(api.nomba.lookupBankAccount);

  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showInitiate, setShowInitiate] = useState(false);
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

  if (!isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold/10">
            <Lock className="w-8 h-8 text-gold" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-primary">Sign In Required</h2>
          <p className="text-sm mb-6 text-muted">Sign in to manage withdrawals.</p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200 shadow-button">Sign In</button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const isExco = currentUser?.roles.includes("STUDENT_EXCO");
  const isAdvisor = currentUser?.roles.includes("STAFF_ADVISOR");

  const handleInitiate = async () => {
    if (!walletId || !amount || !reason) return;
    
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
        institutionId: myInst!._id as any,
        associationId: walletId as any,
        walletId: walletId as any,
        amount: Number(amount),
        reason,
        recipientBankName: bankName || undefined,
        recipientAccountNumber: accountNumber || undefined,
        recipientBankCode: bankCode || undefined,
        recipientAccountName: recipientAccountName || undefined,
      });
      setShowInitiate(false);
      setWalletId(""); setAmount(""); setReason("");
      setBankCode(""); setAccountNumber(""); setRecipientAccountName("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId);
    setError("");
    try {
      await approveRequest({ withdrawalId: requestId as any });
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
      await execute({ withdrawalId: requestId as any });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">Withdrawals</h1>
            <p className="text-sm text-muted mt-1">Consensus-based withdrawal system. <span className="hidden sm:inline">Exco initiates → Advisor approves → Executed.</span></p>
          </div>
          {isExco && (
            <button onClick={() => setShowInitiate(!showInitiate)}
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200 shadow-button flex-shrink-0">
              {showInitiate ? "Cancel" : "Initiate Withdrawal"}
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl text-sm bg-error/10 text-error border border-error/20">{error}</div>
        )}

        {showInitiate && isExco && (
          <div className="card p-5 sm:p-6 space-y-4">
            <h2 className="font-semibold text-primary">Initiate Withdrawal Request</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Wallet / Association ID</label>
              <input type="text" placeholder="e.g., sug-SUG or faculty-SCIENCE" value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-secondary">Recipient Bank</label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
                />
              </div>
            </div>

            {/* Verification name resolution card */}
            {verifying && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-secondary border border-border text-xs text-muted">
                <span className="animate-spin rounded-full h-3 w-3 border-2 border-gold border-t-transparent" />
                Resolving recipient account name...
              </div>
            )}
            {recipientAccountName && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success/5 border border-success/15 text-xs text-success">
                <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                <span>Verified Name: <strong className="font-mono uppercase">{recipientAccountName}</strong></span>
              </div>
            )}
            {verificationError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-error/5 border border-error/15 text-xs text-error">
                <AlertCircle className="w-4 h-4 text-error flex-shrink-0" />
                <span>{verificationError}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Amount (₦)</label>
              <input type="number" placeholder="50000" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Reason</label>
              <textarea placeholder="Purpose of withdrawal" value={reason} rows={2}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none resize-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20" />
            </div>
            <button onClick={handleInitiate} disabled={processing === "initiate" || !walletId || !amount || !reason || (accountNumber.length > 0 && !recipientAccountName)}
              className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110 shadow-button font-medium">
              {processing === "initiate" ? "Initiating..." : "Submit Request"}
            </button>
          </div>
        )}

        {/* Requests List */}
        {!requests ? (
          <div className="flex items-center justify-center h-32"><div className="skeleton w-8 h-8 rounded-full" /></div>
        ) : requests.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center">
            <p className="text-muted">No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req: any) => (
              <div key={req._id} className="card p-5 transition-all duration-200 hover:border-gold-royal hover:shadow-card-hover">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gold font-mono">₦{req.amount.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        req.status === "pending" ? "bg-pending/10 text-pending font-mono" :
                        req.status === "approved" ? "bg-info/10 text-info font-mono" :
                        "bg-success/10 text-success font-mono"
                      }`}>
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
                      Wallet: {req.walletEntityId || req.walletId} · {new Date(req._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {req.status === "pending" && isAdvisor && (
                      <button onClick={() => handleApprove(req._id)} disabled={processing === req._id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-info text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50">
                        {processing === req._id ? "..." : "Approve"}
                      </button>
                    )}
                    {req.status === "approved" && (isExco || isAdvisor) && (
                      <button onClick={() => handleExecute(req._id)} disabled={processing === req._id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50">
                        {processing === req._id ? "..." : "Execute"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 rounded-xl bg-gold-subtle border border-gold/15">
        <p className="text-xs text-gold-royal flex items-start gap-1.5">
          <Scale className="w-3.5 h-3.5 text-gold-royal flex-shrink-0 mt-0.5" />
          <span><strong>Consensus Model:</strong> STUDENT_EXCO initiates withdrawal. STAFF_ADVISOR approves. After approval, either party can execute.</span>
        </p>
        </div>
      </div>
    </div>
  );
}
