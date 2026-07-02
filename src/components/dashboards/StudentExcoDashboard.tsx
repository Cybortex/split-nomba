"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StudentExcoDashboard({ associationId, institutionId }: { associationId?: string; institutionId?: string }) {
  const requests = useQuery(api.withdrawals.getWithdrawalHistory, (associationId && institutionId) ? { associationId: associationId as any, institutionId: institutionId as any } : "skip");
  const initiate = useMutation(api.withdrawals.initiateWithdrawal);
  const execute = useMutation(api.withdrawals.executeWithdrawal);
  const [showInitiate, setShowInitiate] = useState(false);
  const [walletId, setWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState("");

  const myRequests = requests?.filter((r: any) =>
    r.status === "pending" || r.status === "approved"
  ) || [];

  const handleInitiate = async () => {
    if (!walletId || !amount || !reason) return;
    setProcessing("initiate");
    setError("");
    try {
      await initiate({ institutionId: institutionId! as any, associationId: associationId! as any, walletId: walletId as any, amount: Number(amount), reason });
      setShowInitiate(false);
      setWalletId(""); setAmount(""); setReason("");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Student Exco Dashboard</h1>
          <p className="text-sm text-muted mt-1">Initiate and manage association withdrawals.</p>
        </div>
        <button onClick={() => setShowInitiate(!showInitiate)}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200">
          {showInitiate ? "Cancel" : "New Withdrawal"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">{error}</div>
      )}

      {showInitiate && (
        <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
          <h2 className="font-semibold text-primary">Initiate Withdrawal</h2>
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
          <button onClick={handleInitiate} disabled={processing === "initiate"}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 disabled:opacity-50">
            {processing === "initiate" ? "Initiating..." : "Submit for Approval"}
          </button>
        </div>
      )}

      {myRequests.length > 0 ? (
        <div className="space-y-3">
          {myRequests.map((req: any) => (
            <div key={req._id} className="p-5 rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gold font-mono">₦{req.amount.toLocaleString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      req.status === "pending" ? "bg-pending/10 text-pending" : "bg-info/10 text-info"
                    }`}>{req.status}</span>
                  </div>
                  <p className="text-sm text-secondary mt-1">{req.reason}</p>
                  <p className="text-xs text-muted mt-1">Wallet: {req.walletEntityId}</p>
                </div>
                {req.status === "approved" && (
                  <button onClick={() => handleExecute(req._id)} disabled={processing === req._id}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50">
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
    </div>
  );
}
