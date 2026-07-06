"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

type ApprovalResult = {
  institutionId: string;
  adminEmail: string;
  institutionName: string;
  signInUrl: string | null;
  clerkId: string;
};

function SignInLinkModal({
  result,
  onClose,
}: {
  result: ApprovalResult;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-border bg-success/5">
          <div className="w-10 h-10 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-primary">Institution Approved!</h2>
            <p className="text-xs text-muted mt-0.5">
              <span className="text-success font-semibold">{result.institutionName}</span> has been set up successfully.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Admin email */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border border-border">
            <span className="text-lg">✉️</span>
            <div>
              <p className="text-xs text-muted">Admin Email</p>
              <p className="text-sm font-medium text-primary font-mono">{result.adminEmail}</p>
            </div>
          </div>

          {/* Sign-in link */}
          {result.signInUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">🔗 First Sign-In Link</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold/10 text-gold font-medium">
                  Expires in 7 days
                </span>
              </div>
              <p className="text-xs text-muted">
                Share this one-time link with the institution admin. After first use, they can sign in using{" "}
                <strong>email verification code</strong> at the sign-in page.
              </p>
              <div className="flex gap-2 mt-2">
                <input
                  readOnly
                  value={result.signInUrl}
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface-secondary text-xs text-muted font-mono truncate outline-none"
                />
                <button
                  onClick={() => copy(result.signInUrl!)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all duration-200 flex-shrink-0 ${
                    copied
                      ? "bg-success text-white"
                      : "bg-gold text-black hover:brightness-110"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-border bg-surface-secondary space-y-2">
              <p className="text-sm font-semibold text-primary">📧 Sign-In Instructions</p>
              <p className="text-xs text-muted leading-relaxed">
                The admin account has been created. Since a magic link could not be generated,
                share these instructions with the institution admin:
              </p>
              <ol className="text-xs text-muted space-y-1 list-decimal list-inside">
                <li>Go to <span className="text-gold font-medium">/sign-in</span> on this platform</li>
                <li>Enter <span className="font-mono text-primary">{result.adminEmail}</span></li>
                <li>Choose <strong>"Use email verification code"</strong></li>
                <li>Enter the code from their inbox</li>
              </ol>
            </div>
          )}

          {/* Email code fallback info */}
          <div className="p-3 rounded-lg border border-border bg-surface-secondary text-xs text-muted">
            <span className="text-secondary font-medium">ℹ️ After first login:</span> The admin can always sign in at{" "}
            <span className="text-gold font-mono">/sign-in</span> using their email and a verification code sent to their inbox.
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminApprovals() {
  const pendingRegistrations = useQuery(api.auth.listPendingRegistrations);
  const approveAndSetup = useAction(api.auth.approveAndSetupInstitution);

  const [processingReg, setProcessingReg] = useState<string | null>(null);
  const [approvalResult, setApprovalResult] = useState<ApprovalResult | null>(null);
  const [message, setMessage] = useState<{ type: "error"; text: string } | null>(null);

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
      const result = await approveAndSetup({ registrationId: regId as any });
      setApprovalResult(result);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Approval failed. Check console for details." });
    } finally {
      setProcessingReg(null);
    }
  };

  const handleReject = async (_regId: string, name: string) => {
    // Stub — use the old reject mutation separately if needed
    alert(`Reject flow for "${name}" — to be wired up.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success modal */}
      {approvalResult && (
        <SignInLinkModal
          result={approvalResult}
          onClose={() => setApprovalResult(null)}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Approvals</h1>
        <p className="text-sm mt-1 text-muted">
          {pendingRegistrations.length} pending institution registration
          {pendingRegistrations.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Error message */}
      {message && (
        <div className="p-3 rounded-lg text-sm border bg-error/10 text-error border-error/20">
          {message.text}
        </div>
      )}

      {/* Empty state */}
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
                      <span>📍</span>
                      {reg.address}
                    </p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleApprove(reg._id)}
                    disabled={processingReg === reg._id}
                    className="px-5 py-2 text-sm font-semibold rounded-lg bg-success text-white hover:brightness-110 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    {processingReg === reg._id ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Setting up…
                      </>
                    ) : (
                      "Approve & Create Account"
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
