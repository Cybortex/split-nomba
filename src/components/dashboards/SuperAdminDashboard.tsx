"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function SuperAdminDashboard() {
  const globalStats = useQuery(api.admin.getGlobalStats);
  const institutions = useQuery(api.admin.getInstitutionSummaries);
  const pendingRegistrations = useQuery(api.auth.listPendingRegistrations);
  const recentLogs = useQuery(api.admin.getRecentAuditLogs, { limit: 20 });

  const approve = useMutation(api.auth.approveInstitution);
  const reject = useMutation(api.auth.rejectInstitution);

  const [processingReg, setProcessingReg] = useState<string | null>(null);
  const [selectedInst, setSelectedInst] = useState<string | null>(null);

  if (!globalStats || !institutions || !pendingRegistrations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  const statCards = [
    {
      label: "Institutions",
      value: globalStats.institutions,
      sub: "Registered on platform",
      color: "text-gold",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
    {
      label: "Active Users",
      value: globalStats.users.toLocaleString(),
      sub: `${globalStats.totalUsers} total registered`,
      color: "text-info",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      label: "Payments Processed",
      value: globalStats.completedPayments.toLocaleString(),
      sub: `${globalStats.payments} total including pending`,
      color: "text-success",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Total Volume",
      value: `₦${globalStats.paymentVolume.toLocaleString()}`,
      sub: "Across all institutions",
      color: "text-gold",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Super Admin Dashboard</h1>
          <p className="text-sm mt-1 text-muted">
            Global platform overview —{" "}
            <span className="text-gold font-semibold">
              {globalStats.institutions} institutions
            </span>{" "}
            ·{" "}
            <span className="text-info font-semibold">
              {globalStats.users} active users
            </span>
          </p>
        </div>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="p-6 rounded-xl border border-border bg-surface hover:border-gold-royal transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                {stat.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-muted mt-1">{stat.label}</p>
            <p className="text-xs text-muted-dark mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Pending Registration Approvals */}
      {pendingRegistrations.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-primary">
                Pending Approvals
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {pendingRegistrations.length} institution{pendingRegistrations.length > 1 ? "s" : ""} waiting for review
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-pending/10 text-pending">
              {pendingRegistrations.length} pending
            </span>
          </div>
          <div className="divide-y divide-border-subtle">
            {pendingRegistrations.map((reg: any) => (
              <div
                key={reg._id}
                className="px-6 py-4 flex items-center justify-between hover:bg-hover transition-colors duration-150"
              >
                <div className="flex-1">
                  <p className="font-medium text-primary">{reg.name}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted">
                    <span>✉ {reg.adminEmail}</span>
                    <span>👤 {reg.adminName}</span>
                    {reg.phone && <span>📞 {reg.phone}</span>}
                    <span>
                      📅 {new Date(reg._creationTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={async () => {
                      setProcessingReg(reg._id);
                      try {
                        await approve({ registrationId: reg._id });
                      } finally {
                        setProcessingReg(null);
                      }
                    }}
                    disabled={processingReg === reg._id}
                    className="px-4 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                  >
                    {processingReg === reg._id ? "..." : "Approve"}
                  </button>
                  <button
                    onClick={async () => {
                      setProcessingReg(reg._id);
                      try {
                        await reject({
                          registrationId: reg._id,
                          reason: "Rejected by Super Admin",
                        });
                      } finally {
                        setProcessingReg(null);
                      }
                    }}
                    disabled={processingReg === reg._id}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-secondary hover:bg-hover transition-all duration-200 disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institutions Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-primary">All Institutions</h2>
          <p className="text-xs text-muted mt-0.5">
            {institutions.length} institutions · Sorted by payment volume
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary text-left">
                <th className="px-6 py-3 font-medium text-muted">Institution</th>
                <th className="px-6 py-3 font-medium text-muted text-right">Users</th>
                <th className="px-6 py-3 font-medium text-muted text-right">Payments</th>
                <th className="px-6 py-3 font-medium text-muted text-right">Volume</th>
                <th className="px-6 py-3 font-medium text-muted text-right">Wallets</th>
                <th className="px-6 py-3 font-medium text-muted text-right">Collected</th>
              </tr>
            </thead>
            <tbody>
              {institutions.map((inst: any) => (
                <tr
                  key={inst._id}
                  className="border-t border-border-subtle hover:bg-hover transition-colors duration-150 cursor-pointer"
                  onClick={() =>
                    setSelectedInst(
                      selectedInst === inst._id ? null : inst._id
                    )
                  }
                >
                  <td className="px-6 py-3">
                    <p className="font-medium text-primary">{inst.name}</p>
                    <p className="text-xs text-muted mt-0.5">
                      Created {new Date(inst.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-secondary">
                    {inst.userCount}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-secondary font-mono">
                      {inst.completedPaymentCount}
                    </span>
                    <span className="text-xs text-muted ml-1">
                      / {inst.paymentCount}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-gold font-medium">
                    ₦{inst.paymentVolume.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-secondary">
                    {inst.walletCount}
                  </td>
                  <td className="px-6 py-3 text-right font-mono text-success">
                    ₦{inst.totalCollected.toLocaleString()}
                  </td>
                </tr>
              ))}
              {institutions.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-muted"
                  >
                    No institutions registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Audit Feed */}
      {recentLogs && recentLogs.length > 0 && (
        <div className="rounded-xl border border-border bg-surface overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-primary">
              Recent Platform Activity
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Last {Math.min(recentLogs.length, 20)} events across all institutions
            </p>
          </div>
          <div className="divide-y divide-border-subtle max-h-80 overflow-y-auto">
            {recentLogs.slice(0, 20).map((log: any) => (
              <div
                key={log._id}
                className="px-6 py-3 flex items-center gap-4 hover:bg-hover transition-colors duration-150"
              >
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    log.success ? "bg-success" : "bg-error"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-primary truncate">
                      {log.action}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                        log.success
                          ? "bg-success/10 text-success"
                          : "bg-error/10 text-error"
                      }`}
                    >
                      {log.success ? "success" : "failed"}
                    </span>
                  </div>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {log.entity} · {log.userId === "PUBLIC" ? "Public" : log.userId.substring(0, 12) + "..."}
                  </p>
                </div>
                <span className="text-xs text-muted-dark flex-shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
