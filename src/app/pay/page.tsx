"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function PayPage() {
  const [matric, setMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{
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
  const initiatePayment = useAction(api.initiatePayment.initiatePayment);
  const { isSignedIn } = useUser();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const result = await initiatePayment({
        studentMatric: matric.toUpperCase(),
        institutionId: myInst!._id as any,
      });

      setSuccess({
        amount: result.amount,
        authorisationUrl: (result as any).authorisationUrl,
        feeBreakdown: (result as any).feeBreakdown || { tuition: result.amount, departmentDues: 0, facultyDues: 0, sugDues: 0 },
      });

      setTimeout(() => {
        window.location.href = (result as any).authorisationUrl;
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-surface text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold/10">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-primary">Sign in to Pay</h2>
          <p className="text-sm mb-6 text-muted">You need to sign in before making a payment.</p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="max-w-lg w-full p-8 rounded-2xl border border-border bg-surface">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-success/10">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary">Redirecting to Nomba...</h2>
            <p className="text-sm mt-2 text-muted">
              You will pay <span className="font-bold text-success">₦{success.amount.toLocaleString()}</span>
            </p>
          </div>

          {/* Fee Breakdown */}
          <div className="p-4 rounded-xl mb-6 bg-surface-secondary">
            <h3 className="text-sm font-semibold mb-3 text-gold">Fee Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: "Tuition", amount: success.feeBreakdown.tuition },
                { label: "Department Dues", amount: success.feeBreakdown.departmentDues },
                { label: "Faculty Dues", amount: success.feeBreakdown.facultyDues },
                { label: "SUG Dues", amount: success.feeBreakdown.sugDues },
              ].map((item) => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-border-subtle last:border-0">
                  <span className="text-sm text-secondary">{item.label}</span>
                  <span className="text-sm font-mono font-medium text-primary">
                    ₦{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm font-bold text-primary">Total</span>
                <span className="text-sm font-mono font-bold text-success">
                  ₦{success.amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <a
            href={success.authorisationUrl}
            className="block w-full py-2.5 text-sm font-semibold rounded-lg text-center bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            Continue to Payment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Pay Your Dues</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your matric number to see your fee breakdown and pay securely
          </p>
        </div>

        <form
          onSubmit={handlePayment}
          className="p-8 rounded-2xl border border-border bg-surface space-y-5"
        >
          {error && (
            <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">Matric Number</label>
            <input
              type="text"
              placeholder="FUT/2022/CSC/001"
              value={matric}
              onChange={(e) => setMatric(e.target.value.toUpperCase())}
              disabled={loading}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"

            />
          </div>

          <div className="p-4 rounded-xl text-center bg-gold-subtle border border-gold/15">
            <p className="text-xs mb-1 text-muted">Amount computed server-side</p>
            <p className="text-sm font-mono text-gold-royal">
              ↳ Securely calculated from your level fee configuration
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !matric}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
          >
            {loading ? "Connecting to Nomba..." : "Pay with Nomba"}
          </button>

          <div className="p-3 rounded-lg bg-gold-subtle">
            <p className="text-xs text-gold-royal">
              ⚠ Security: Payment amount is calculated on the server. The frontend cannot modify it.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
