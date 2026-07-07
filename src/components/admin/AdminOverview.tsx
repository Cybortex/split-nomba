"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Landmark, User, CheckCircle, Coins } from "lucide-react";

const STAT_CARDS = [
  {
    label: "Institutions",
    icon: <Landmark className="w-6 h-6 text-gold" />,
    color: "text-gold",
    valueKey: "institutions" as const,
    subKey: "" as const,
    suffix: "Registered on platform",
  },
  {
    label: "Active Users",
    icon: <User className="w-6 h-6 text-info" />,
    color: "text-info",
    valueKey: "users" as const,
    subKey: "totalUsers" as const,
    suffix: "total registered",
  },
  {
    label: "Payments Processed",
    icon: <CheckCircle className="w-6 h-6 text-success" />,
    color: "text-success",
    valueKey: "completedPayments" as const,
    subKey: "payments" as const,
    suffix: "total including pending",
  },
  {
    label: "Total Volume",
    icon: <Coins className="w-6 h-6 text-gold" />,
    color: "text-gold",
    valueKey: "paymentVolume" as const,
    isCurrency: true,
    suffix: "Across all institutions",
  },
];

export function AdminOverview() {
  const globalStats = useQuery(api.admin.getGlobalStats);
  const pendingRegistrations = useQuery(api.auth.listPendingRegistrations);

  if (!globalStats || !pendingRegistrations) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Overview</h1>
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

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_CARDS.map((stat) => {
          const mainValue = globalStats[stat.valueKey];
          const displayValue = stat.isCurrency
            ? `₦${mainValue.toLocaleString()}`
            : mainValue.toLocaleString();

          const subValue = stat.subKey
            ? `${globalStats[stat.subKey].toLocaleString()} ${stat.suffix}`
            : stat.suffix;

          return (
            <div
              key={stat.label}
              className="p-6 rounded-xl border border-border bg-surface hover:border-gold-royal transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="flex-shrink-0">{stat.icon}</span>
              </div>
              <p className={`text-2xl font-bold ${stat.color}`}>{displayValue}</p>
              <p className="text-sm text-muted mt-1">{stat.label}</p>
              <p className="text-xs text-muted-dark mt-0.5">{subValue}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      {pendingRegistrations.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-primary">Pending Approvals</h2>
              <p className="text-xs text-muted mt-0.5">
                {pendingRegistrations.length} institution{pendingRegistrations.length !== 1 ? "s" : ""} waiting for review
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-pending/10 text-pending">
              {pendingRegistrations.length} pending
            </span>
          </div>
          <button
            onClick={() => window.location.href = "/admin/approvals"}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            Review Approvals
          </button>
        </div>
      )}

      {pendingRegistrations.length === 0 && (
        <div className="rounded-xl border border-border bg-surface p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-muted">No pending approvals. All institutions have been reviewed.</p>
        </div>
      )}
    </div>
  );
}
