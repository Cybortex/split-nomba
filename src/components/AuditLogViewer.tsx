"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AuditLogViewer({ institutionId }: { institutionId?: string }) {
  const logs = useQuery(api.auditLogs.getAll, institutionId ? { institutionId: institutionId as any } : {});

  if (!logs) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const getActionColor = (action: string) => {
    if (action.includes("FAILED")) return "bg-error/10 text-error";
    if (action.includes("INITIATED") || action.includes("CREATED")) return "bg-info/10 text-info";
    if (action.includes("VERIFIED") || action.includes("CREDITED")) return "bg-success/10 text-success";
    if (action.includes("PERMISSION") && action.includes("FAILED")) return "bg-pending/10 text-pending";
    return "bg-surface-secondary text-secondary";
  };

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-primary">Immutable Audit Trail</h2>
        <p className="text-sm text-muted mt-1">All sensitive actions are logged here. Logs cannot be edited or deleted — append only.</p>
      </div>

      {logs.length === 0 ? (
        <div className="p-12 text-center text-muted">No audit logs yet. Actions will appear here as they happen.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-secondary text-left">
                <th className="px-4 py-3 font-medium text-muted">Time</th>
                <th className="px-4 py-3 font-medium text-muted">Action</th>
                <th className="px-4 py-3 font-medium text-muted">Entity</th>
                <th className="px-4 py-3 font-medium text-muted">User</th>
                <th className="px-4 py-3 font-medium text-muted text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log: any) => (
                <tr key={log._id} className="border-t border-border-subtle hover:bg-hover transition-colors duration-150">
                  <td className="px-4 py-3 text-xs text-muted whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-secondary font-mono">{log.entity}</td>
                  <td className="px-4 py-3 text-xs text-muted font-mono">
                    {log.userId === "SYSTEM" ? "🤖 System" : log.userId.substring(0, 8) + "..."}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.success ? <span className="text-success text-lg">✓</span> : <span className="text-error text-lg">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="p-4 bg-surface-secondary border-t border-border flex items-center gap-2 text-xs text-muted">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>🔒 Immutable — logs cannot be deleted or modified</span>
      </div>
    </div>
  );
}
