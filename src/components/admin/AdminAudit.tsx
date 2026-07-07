"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search } from "lucide-react";

const ACTION_FILTERS = [
  { label: "All", value: "" },
  { label: "Success", value: "success" },
  { label: "Failed", value: "failed" },
] as const;

export function AdminAudit() {
  const recentLogs = useQuery(api.admin.getRecentAuditLogs, { limit: 100 });
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  if (!recentLogs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  const filtered = recentLogs.filter((log: any) => {
    if (statusFilter === "success" && !log.success) return false;
    if (statusFilter === "failed" && log.success) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        log.action?.toLowerCase().includes(q) ||
        log.entity?.toLowerCase().includes(q) ||
        log.userId?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Audit Log</h1>
        <p className="text-sm mt-1 text-muted">
          {recentLogs.length} recent events across all institutions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5">
          {ACTION_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-200 ${
                statusFilter === filter.value
                  ? "bg-gold text-black border-gold shadow-button"
                  : "bg-transparent text-secondary border-border hover:bg-hover"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-surface text-sm text-primary outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-muted">
            {search || statusFilter
              ? "No events match your filters."
              : "No audit events recorded yet."}
          </p>
          {(search || statusFilter) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); }}
              className="mt-2 text-sm text-gold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-border-subtle max-h-[70vh] overflow-y-auto">
            {filtered.map((log: any) => (
              <div
                key={log._id}
                className="px-6 py-3.5 flex items-center gap-4 hover:bg-hover transition-colors duration-150"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    log.success ? "bg-success" : "bg-error"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-mono font-medium text-primary">
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
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-muted font-mono">
                      {log.entity}
                    </span>
                    <span className="text-xs text-muted-dark">·</span>
                    <span className="text-xs text-muted truncate">
                      {log.userId === "PUBLIC"
                        ? "Public"
                        : log.userId.substring(0, 14) + "..."}
                    </span>
                    {log.institutionId && (
                      <>
                        <span className="text-xs text-muted-dark">·</span>
                        <span className="text-xs text-muted font-mono">
                          Inst: {log.institutionId?.toString().substring(0, 8)}...
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-dark flex-shrink-0 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
