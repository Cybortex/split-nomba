"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreditCard, Landmark, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

function MockCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get("reference") || "";
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment details dynamically from database
  const payment = useQuery(
    api.payments.getPaymentByReference,
    reference ? { reference } : "skip"
  );

  if (payment === undefined) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-app p-6">
        <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
        <p className="text-secondary text-sm">Loading payment details...</p>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-app p-6 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mb-4">
          ⚠️
        </div>
        <h1 className="text-lg font-bold text-primary mb-2">Payment Not Found</h1>
        <p className="text-muted text-sm mb-6">
          The payment reference `{reference}` does not exist in the database.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-2.5 rounded-lg bg-border text-secondary hover:bg-hover transition-colors font-medium text-sm"
        >
          Go Back to Dashboard
        </button>
      </div>
    );
  }

  const handleSimulatePayment = async () => {
    setProcessing(true);
    setError(null);
    try {
      // Trigger the local webhook
      const res = await fetch("/api/webhooks/nomba", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event: "transaction.completed",
          data: {
            transactionId: `MOCK-TXN-${reference}`,
            reference: reference,
            amount: payment.amount + (payment.platformFee || 100),
            currency: "NGN",
            status: "SUCCESS",
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Simulation failed");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong during simulation");
    } finally {
      setProcessing(false);
    }
  };

  const totalAmount = payment.amount + (payment.platformFee || 100);

  return (
    <div className="min-h-screen bg-app flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl">
        {success ? (
          <div className="p-8 sm:p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-primary mb-2">Payment Successful!</h1>
            <p className="text-muted text-sm mb-6 max-w-sm">
              Your simulated payment of ₦{totalAmount.toLocaleString()} has been processed. 
              The fees are being split and routed across your wallets.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Redirecting you to dashboard...
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="p-6 border-b border-border bg-surface-secondary flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-primary">Nomba Sandbox Checkout</h1>
                <p className="text-xs text-muted">Local Mock Fallback Mode</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 font-semibold uppercase tracking-wider">
                Simulated Environment
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Payment Summary */}
              <div className="p-4 rounded-xl border border-border-subtle bg-app space-y-3">
                <div className="flex justify-between text-xs text-muted border-b border-border-subtle pb-2">
                  <span>Student Matric</span>
                  <span className="text-secondary font-mono">{payment.studentMatric}</span>
                </div>
                <div className="flex justify-between text-xs text-muted border-b border-border-subtle pb-2">
                  <span>Faculty / Department</span>
                  <span className="text-secondary text-right truncate max-w-[200px]">
                    {payment.faculty} • {payment.department}
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Tuition Fee</span>
                    <span>₦{(payment.feeTuition || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>SUG Dues</span>
                    <span>₦{(payment.feeSugDues || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Faculty Dues</span>
                    <span>₦{(payment.feeFacultyDues || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Department Dues</span>
                    <span>₦{(payment.feeDepartmentDues || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-secondary">
                    <span>Platform Service Charge</span>
                    <span>₦{(payment.platformFee || 100).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex justify-between text-sm font-bold text-primary border-t border-border-subtle pt-2">
                  <span>Total Amount</span>
                  <span className="text-gold font-mono">₦{totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                      paymentMethod === "card"
                        ? "border-gold bg-gold/5"
                        : "border-border bg-surface-secondary hover:bg-hover"
                    }`}
                  >
                    <CreditCard className={`w-5 h-5 ${paymentMethod === "card" ? "text-gold" : "text-muted"}`} />
                    <div>
                      <p className="text-xs font-bold text-primary">Simulate Card</p>
                      <p className="text-[10px] text-muted">Test checkout flow</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("transfer")}
                    className={`p-4 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                      paymentMethod === "transfer"
                        ? "border-gold bg-gold/5"
                        : "border-border bg-surface-secondary hover:bg-hover"
                    }`}
                  >
                    <Landmark className={`w-5 h-5 ${paymentMethod === "transfer" ? "text-gold" : "text-muted"}`} />
                    <div>
                      <p className="text-xs font-bold text-primary">Simulate Transfer</p>
                      <p className="text-[10px] text-muted">Test bank wire</p>
                    </div>
                  </button>
                </div>
              </div>

              {paymentMethod === "card" ? (
                <div className="p-4 rounded-xl border border-border bg-surface-secondary space-y-3">
                  <div className="h-40 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-4 flex flex-col justify-between text-white shadow-md">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold font-mono tracking-widest text-neutral-400">SANDBOX TEST CARD</span>
                      <span className="text-lg font-bold italic">VISA</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-mono tracking-widest">4000 1234 5678 9010</p>
                      <div className="flex gap-4 text-[9px] font-mono text-neutral-400">
                        <span>EXP: 12/28</span>
                        <span>CVV: ***</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium truncate uppercase">{payment.studentMatric}</p>
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed">
                    This simulates a payment made by standard credit or debit card. No actual funds are charged from your accounts.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-border bg-surface-secondary space-y-3">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-secondary">Transfer Reference Account</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                      <span className="text-muted">Bank Name:</span>
                      <span className="text-primary font-medium">Providus Bank (Mock)</span>
                      <span className="text-muted">Account Number:</span>
                      <span className="text-primary font-bold font-mono">9938491032</span>
                      <span className="text-muted">Account Name:</span>
                      <span className="text-primary truncate">FUTM Checkout Dues</span>
                      <span className="text-muted">Reference:</span>
                      <span className="text-primary font-mono">{payment.reference}</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted leading-relaxed">
                    This simulates a bank wire transfer. The webhook will route the corresponding amounts automatically to the correct department, faculty, and SUG wallets.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
                  ❌ {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-1/3 py-2.5 rounded-lg border border-border text-secondary hover:bg-hover transition-colors font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSimulatePayment}
                  disabled={processing}
                  className="w-full sm:w-2/3 py-2.5 rounded-lg bg-gold text-black hover:brightness-110 disabled:opacity-50 transition-all font-bold text-sm flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      Processing Simulation...
                    </>
                  ) : (
                    <>
                      Simulate Success ({paymentMethod === "card" ? "Card" : "Transfer"})
                      <ArrowRight className="w-4 h-4 text-black" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MockCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen bg-app p-6">
          <Loader2 className="w-10 h-10 text-gold animate-spin mb-3" />
          <p className="text-secondary text-sm">Loading sandbox page...</p>
        </div>
      }
    >
      <MockCheckoutContent />
    </Suspense>
  );
}
