"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminInstitutionsPage() {
  const institutions = useQuery(api.auth.listPendingRegistrations);
  const approve = useMutation(api.auth.approveInstitution);
  const reject = useMutation(api.auth.rejectInstitution);
  const [processing, setProcessing] = useState<string | null>(null);

  if (!institutions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">Institution Approvals</h1>
        <p className="text-sm text-muted mt-1">Review and approve institution registration requests.</p>
      </div>

      {institutions.length === 0 ? (
        <div className="p-12 rounded-2xl border border-border bg-surface text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold/10">
            <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-muted">No pending institution registrations.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {institutions.map((inst) => (
            <div key={inst._id} className="p-6 rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-primary text-lg">{inst.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted">
                    <span>✉ {inst.adminEmail}</span>
                    <span>👤 {inst.adminName}</span>
                    {inst.phone && <span>📞 {inst.phone}</span>}
                  </div>
                  {inst.address && (
                    <p className="text-xs text-muted mt-1">{inst.address}</p>
                  )}
                  <p className="text-xs text-muted-dark mt-2">
                    Submitted {new Date(inst._creationTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      setProcessing(inst._id);
                      try {
                        await approve({ registrationId: inst._id });
                      } finally {
                        setProcessing(null);
                      }
                    }}
                    disabled={processing === inst._id}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  >
                    {processing === inst._id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={async () => {
                      setProcessing(inst._id);
                      try {
                        await reject({ registrationId: inst._id, reason: "Rejected by admin" });
                      } finally {
                        setProcessing(null);
                      }
                    }}
                    disabled={processing === inst._id}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-secondary hover:bg-hover transition-all duration-200 disabled:opacity-50"
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
