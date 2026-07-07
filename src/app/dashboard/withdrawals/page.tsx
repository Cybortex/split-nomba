"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Scale } from "lucide-react";

export default function WithdrawalsPage() {
  const { isSignedIn } = useUser();
  const myInst = useQuery(api.auth.getMyInstitution);
  const requests = useQuery(api.withdrawals.getAllPendingWithdrawals, myInst?._id ? { institutionId: myInst._id as any } : "skip");
  const initiate = useMutation(api.withdrawals.initiateWithdrawal);
  const approveRequest = useMutation(api.withdrawals.approveWithdrawal);
  const execute = useMutation(api.withdrawals.executeWithdrawal);
  const currentUser = useQuery(api.auth.getCurrentUser);

  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [showInitiate, setShowInitiate] = useState(false);
  const [error, setError] = useState("");

  if (!isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-surface text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold/10">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-primary">Sign In Required</h2>
          <p className="text-sm mb-6 text-muted">Sign in to manage withdrawals.</p>
          <SignInButton mode="modal">
            <button className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200">Sign In</button>
          </SignInButton>
        </div>
      </div>
    );
  }

  const isExco = currentUser?.roles.includes("STUDENT_EXCO");
  const isAdvisor = currentUser?.roles.includes("STAFF_ADVISOR");

  const handleInitiate = async () => {
    if (!walletId || !amount || !reason) return;
    setProcessing("initiate");
    setError("");
    try {
      await initiate({ institutionId: myInst!._id as any, associationId: walletId as any, walletId: walletId as any, amount: Number(amount), reason });
      setShowInitiate(false);
      setWalletId(""); setAmount(""); setReason("");
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
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 flex-shrink-0">
              {showInitiate ? "Cancel" : "Initiate Withdrawal"}
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">{error}</div>
        )}

        {showInitiate && isExco && (
          <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
            <h2 className="font-semibold text-primary">Initiate Withdrawal Request</h2>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Wallet Entity ID</label>
              <input type="text" placeholder="e.g., assoc_cs_001" value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Amount (₦)</label>
              <input type="number" placeholder="50000" value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Reason</label>
              <textarea placeholder="Purpose of withdrawal" value={reason} rows={2}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none resize-none focus:border-gold" />
            </div>
            <button onClick={handleInitiate} disabled={processing === "initiate" || !walletId || !amount || !reason}
              className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110">
              {processing === "initiate" ? "Initiating..." : "Submit Request"}
            </button>
          </div>
        )}

        {/* Requests List */}
        {!requests ? (
          <div className="flex items-center justify-center h-32"><div className="skeleton w-8 h-8 rounded-full" /></div>
        ) : requests.length === 0 ? (
          <div className="p-12 rounded-2xl border border-border bg-surface text-center">
            <p className="text-muted">No withdrawal requests yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req: any) => (
              <div key={req._id} className="p-5 rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gold font-mono">₦{req.amount.toLocaleString()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        req.status === "pending" ? "bg-pending/10 text-pending" :
                        req.status === "approved" ? "bg-info/10 text-info" :
                        "bg-success/10 text-success"
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm text-secondary mt-1">{req.reason}</p>
                    <p className="text-xs text-muted mt-1">
                      Wallet: {req.walletEntityId} · {new Date(req._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {req.status === "pending" && isAdvisor && (
                      <button onClick={() => handleApprove(req._id)} disabled={processing === req._id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-info text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50">
                        {processing === req._id ? "..." : "Approve"}
                      </button>
                    )}
                    {req.status === "approved" && (isExco || isAdvisor) && (
                      <button onClick={() => handleExecute(req._id)} disabled={processing === req._id}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50">
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
