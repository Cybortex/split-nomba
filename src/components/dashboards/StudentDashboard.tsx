"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";

export function StudentDashboard({ activeTab = "overview" }: { activeTab?: string }) {
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState<{
    amount: number;
    authorisationUrl: string;
    feeBreakdown: {
      tuition: number;
      departmentDues: number;
      facultyDues: number;
      sugDues: number;
    };
  } | null>(null);

  const myInst = useQuery(api.auth.getMyInstitution);
  const feeOverview = useQuery(api.fees.getMyFeeOverview);
  const payments = useQuery(api.studentRecords.getMyPayments);
  const initiatePayment = useAction(api.initiatePayment.initiatePayment);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---------- Loading ----------
  if (!myInst || !feeOverview || !payments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-8 h-8 rounded-full" />
          <p className="text-sm text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ---------- Pay handler ----------
  const handlePay = async () => {
    setPaying(true);
    setPayError("");
    setPaySuccess(null);
    try {
      const result = await initiatePayment({
        studentMatric: feeOverview.student.matric,
        institutionId: myInst!._id as any,
      });
      setPaySuccess({
        amount: result.amount,
        authorisationUrl: (result as any).authorisationUrl,
        feeBreakdown: (result as any).feeBreakdown || {
          tuition: result.amount,
          departmentDues: 0,
          facultyDues: 0,
          sugDues: 0,
        },
      });
      // Auto-redirect after short delay
      setTimeout(() => {
        window.location.href = (result as any).authorisationUrl;
      }, 1500);
    } catch (err: any) {
      setPayError(err.message || "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  // ---------- Status badges ----------
  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: "bg-success/10 text-success border-success/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      failed: "bg-error/10 text-error border-error/20",
      cancelled: "bg-muted/10 text-muted border-muted/20",
    };
    return (
      <span
        className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full border ${
          styles[status] || styles.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const handleGoToPay = () => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", "pay");
    router.push(`/dashboard?${params.toString()}`);
  };

  // ---------- Render: Redirecting to Nomba ----------
  if (paySuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-lg w-full p-8 rounded-2xl border border-border bg-surface">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-success/10">
              <svg
                className="w-8 h-8 text-success"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary">
              Redirecting to Nomba...
            </h2>
            <p className="text-sm mt-2 text-muted">
              You will pay{" "}
              <span className="font-bold text-success">
                ₦{paySuccess.amount.toLocaleString()}
              </span>
            </p>
          </div>

          {/* Fee Breakdown */}
          <div className="p-4 rounded-xl mb-6 bg-surface-secondary">
            <h3 className="text-sm font-semibold mb-3 text-gold">
              Fee Breakdown
            </h3>
            <div className="space-y-2">
              {[
                { label: "Tuition", amount: paySuccess.feeBreakdown.tuition },
                {
                  label: "Department Dues",
                  amount: paySuccess.feeBreakdown.departmentDues,
                },
                {
                  label: "Faculty Dues",
                  amount: paySuccess.feeBreakdown.facultyDues,
                },
                {
                  label: "SUG Dues",
                  amount: paySuccess.feeBreakdown.sugDues,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-1.5 border-b border-border-subtle last:border-0"
                >
                  <span className="text-sm text-secondary">{item.label}</span>
                  <span className="text-sm font-mono font-medium text-primary">
                    ₦{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm font-bold text-primary">Total</span>
                <span className="text-sm font-mono font-bold text-success">
                  ₦{paySuccess.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <a
            href={paySuccess.authorisationUrl}
            className="block w-full py-2.5 text-sm font-semibold rounded-lg text-center bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            Continue to Payment
          </a>
        </div>
      </div>
    );
  }

  // ---------- Main dashboard ----------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">
          Student Dashboard
        </h1>
        <p className="text-sm text-muted mt-1">
          {feeOverview.student.matric} — {feeOverview.student.faculty} /{" "}
          {feeOverview.student.department} — Level {feeOverview.student.level}
        </p>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Active Session Banner */}
          {feeOverview.session ? (
            <div className="p-6 rounded-2xl bg-gold/5 border border-border flex items-center justify-between">
              <div>
                <p className="text-xs text-muted mb-0.5">Active Session</p>
                <p className="text-lg font-bold text-gold">
                  {feeOverview.session.name}
                </p>
              </div>
              {feeOverview.hasPaid ? (
                <span className="px-4 py-1.5 text-xs font-semibold rounded-full bg-success/10 text-success border border-success/20">
                  ✓ Paid
                </span>
              ) : (
                <span className="px-4 py-1.5 text-xs font-semibold rounded-full bg-warning/10 text-warning border border-warning/20">
                  Pending Payment
                </span>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-surface-secondary border border-border">
              <p className="text-sm text-muted">
                No active session set for this institution.
              </p>
            </div>
          )}

          {/* Dues Summary Card */}
          <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-primary">Session Dues</h2>
              <p className="text-xs text-muted mt-1">Total dues configured for Level {feeOverview.student.level}</p>
              <p className="text-3xl font-extrabold text-gold mt-2">
                ₦{feeOverview.feeBreakdown.total.toLocaleString()}
              </p>
            </div>
            {!feeOverview.hasPaid ? (
              <button
                onClick={handleGoToPay}
                className="px-6 py-3 text-sm font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200"
              >
                Go to Payment Form →
              </button>
            ) : (
              <div className="flex items-center gap-2 text-success">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-sm">All dues cleared</span>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "pay" && (
        <div className="space-y-6">
          {/* Fee Breakdown + Pay CTA */}
          <div className="p-6 rounded-2xl border border-border bg-surface">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">
                Session Fees — Level {feeOverview.student.level}
              </h2>
              <p className="text-2xl font-bold text-gold">
                ₦{feeOverview.feeBreakdown.total.toLocaleString()}
              </p>
            </div>

            {feeOverview.feeBreakdown.categories.length > 0 ? (
              <div className="space-y-3 mb-5">
                {feeOverview.feeBreakdown.categories.map((cat) => {
                  const catLabel = cat.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <div key={cat.category} className="p-3 rounded-lg bg-surface-secondary">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-primary">
                          {catLabel}
                        </span>
                        <span className="text-sm font-mono font-bold text-gold">
                          ₦{cat.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {cat.items.map((item, i) => (
                          <div
                            key={`${item.name}-${i}`}
                            className="flex justify-between text-xs text-muted pl-2"
                          >
                            <span>{item.name}</span>
                            <span className="font-mono">
                              ₦{item.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-surface-secondary mb-5 text-center">
                <p className="text-sm text-muted">
                  No fee items configured for your level. Contact the finance office.
                </p>
              </div>
            )}

            {payError && (
              <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20 mb-4">
                {payError}
              </div>
            )}

            {!feeOverview.hasPaid && feeOverview.feeBreakdown.total > 0 && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="w-full py-3 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110 flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Connecting to Nomba...
                  </>
                ) : (
                  "Pay Now with Nomba"
                )}
              </button>
            )}

            {feeOverview.hasPaid && (
              <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-center">
                <p className="text-sm font-medium text-success">
                  ✓ You have completed payment for this session
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <h2 className="text-lg font-semibold text-primary mb-4">
            Payment History
          </h2>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-gold/10">
                <svg
                  className="w-6 h-6 text-gold"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-sm text-muted">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="p-4 rounded-xl border border-border bg-surface-secondary"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium text-primary font-mono">
                        ₦{payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted mt-0.5 font-mono">
                        Ref: {payment.reference.slice(0, 18)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <div>{statusBadge(payment.status)}</div>
                      <p className="text-xs text-muted mt-1">
                        {new Date(payment.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Routing breakdown for completed payments */}
                  {payment.status === "completed" && payment.routing.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <p className="text-xs font-medium text-muted mb-2">
                        Funds Routed To:
                      </p>
                      <div className="space-y-1">
                        {payment.routing
                          .filter((r) => r.direction === "credit")
                          .map((r, i) => (
                            <div
                              key={i}
                              className="flex justify-between text-xs"
                            >
                              <span className="text-secondary capitalize">
                                {r.reason.replace(/_/g, " ")}
                              </span>
                              <span className="font-mono text-primary">
                                ₦{r.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Show initiated amount for pending */}
                  {payment.status === "pending" && (
                    <div className="mt-3 pt-3 border-t border-border-subtle">
                      <p className="text-xs text-warning flex items-center gap-1.5">
                        <svg className="animate-spin h-3.5 w-3.5 text-warning" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Awaiting payment confirmation...
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
