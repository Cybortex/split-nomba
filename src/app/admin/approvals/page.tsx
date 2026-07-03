"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminApprovalsPage() {
  const pendingRegistrations = useQuery(api.auth.listPendingRegistrations);
  const approve = useMutation(api.auth.approveInstitution);
  const reject = useMutation(api.auth.rejectInstitution);

  const [processingReg, setProcessingReg] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  if (!pendingRegistrations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  const handleApprove = async (regId: string) => {
    setProcessingReg(regId);
    setMessage(null);
    try {
      const result = await approve({ registrationId: regId as any });
      setMessage({ type: "success", text: `Institution "${result.name}" approved successfully!` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setProcessingReg(null);
    }
  };

  const handleReject = async (regId: string, name: string) => {
    const reason = prompt(`Enter rejection reason for "${name}":`, "Rejected by Super Admin");
    if (!reason) return;
    setProcessingReg(regId);
    setMessage(null);
    try {
      await reject({ registrationId: regId as any, reason });
      setMessage({ type: "success", text: `Institution "${name}" rejected.` });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setProcessingReg(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Approvals</h1>
        <p className="text-sm mt-1 text-muted">
          {pendingRegistrations.length} pending institution registration{pendingRegistrations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm border ${
          message.type === "success"
            ? "bg-success/10 text-success border-success/20"
            : "bg-error/10 text-error border-error/20"
        }`}>
          {message.text}
        </div>
      )}

      {pendingRegistrations.length === 0 ? (
        <div className="p-12 rounded-2xl border border-border bg-surface text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-primary mb-1">All Clear!</h2>
          <p className="text-sm text-muted">No pending registrations to review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingRegistrations.map((reg: any) => (
            <div
              key={reg._id}
              className="p-6 rounded-2xl border border-border bg-surface hover:border-gold-royal transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary">{reg.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <span className="text-xs">✉</span>
                      {reg.adminEmail}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-xs">👤</span>
                      {reg.adminName}
                    </span>
                    {reg.phone && (
                      <span className="flex items-center gap-1">
                        <span className="text-xs">📞</span>
                        {reg.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <span className="text-xs">📅</span>
                      {new Date(reg._creationTime).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {reg.address && (
                    <p className="text-xs text-muted mt-2 flex items-center gap-1">
                      <span className="text-xs">📍</span>
                      {reg.address}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(reg._id)}
                    disabled={processingReg === reg._id}
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  >
                    {processingReg === reg._id ? (
                      <span className="flex items-center gap-1">
                        <span className="skeleton w-3 h-3 rounded-full" />
                        Approving...
                      </span>
                    ) : (
                      "Approve"
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(reg._id, reg.name)}
                    disabled={processingReg === reg._id}
                    className="px-5 py-2 text-sm font-medium rounded-lg border border-border text-secondary hover:bg-error/10 hover:text-error hover:border-error/30 transition-all duration-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
