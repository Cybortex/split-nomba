"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function StaffAdvisorDashboard({ associationId, institutionId }: { associationId?: string; institutionId?: string }) {
  const requests = useQuery(api.withdrawals.getWithdrawalHistory, (associationId && institutionId) ? { associationId: associationId as any, institutionId: institutionId as any } : "skip");
  const approveRequest = useMutation(api.withdrawals.approveWithdrawal);
  const execute = useMutation(api.withdrawals.executeWithdrawal);
  const [processing, setProcessing] = useState<string | null>(null);

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Staff Advisor Dashboard</h1>
        <p className="text-sm text-muted mt-1">Approve or execute withdrawal requests from student excos.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="p-6 rounded-xl border border-border bg-surface">
          <h2 className="font-semibold text-primary mb-4">Pending Approval</h2>
          <div className="space-y-3">
            {pendingRequests.map((req: any) => (
              <div key={req._id} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary">
                <div>
                  <span className="text-lg font-bold text-gold font-mono">₦{req.amount.toLocaleString()}</span>
                  <p className="text-sm text-secondary mt-1">{req.reason}</p>
                  <p className="text-xs text-muted mt-0.5">Wallet: {req.walletEntityId}</p>
                </div>
                <button onClick={() => handleApprove(req._id)} disabled={processing === req._id}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-info text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50">
                  {processing === req._id ? "..." : "Approve"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved - Ready to Execute */}
      {approvedRequests.length > 0 && (
        <div className="p-6 rounded-xl border border-border bg-surface">
          <h2 className="font-semibold text-primary mb-4">Ready to Execute</h2>
          <div className="space-y-3">
            {approvedRequests.map((req: any) => (
              <div key={req._id} className="flex items-center justify-between p-4 rounded-xl bg-surface-secondary">
                <div>
                  <span className="text-lg font-bold text-info font-mono">₦{req.amount.toLocaleString()}</span>
                  <p className="text-sm text-secondary mt-1">{req.reason}</p>
                  <p className="text-xs text-muted mt-0.5">Wallet: {req.walletEntityId}</p>
                </div>
                <button onClick={() => handleExecute(req._id)} disabled={processing === req._id}
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50">
                  {processing === req._id ? "..." : "Execute"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {requests && pendingRequests.length === 0 && approvedRequests.length === 0 && (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No withdrawal requests to review.</p>
        </div>
      )}
    </div>
  );
}
