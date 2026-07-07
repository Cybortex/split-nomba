"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";

export function StudentPaymentForm() {
  const [matric, setMatric] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ amount: number; authorisationUrl: string } | null>(null);

  const myInst = useQuery(api.auth.getMyInstitution);
  const initiatePayment = useAction(api.initiatePayment.initiatePayment);
  const { isSignedIn } = useUser();

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      if (!matric.match(/^FUT\/\d{4}\/[A-Za-z]{3}\/\d{3}$/)) {
        throw new Error("Invalid matric format. Use format: FUT/2022/CSC/001");
      }

      const result = await initiatePayment({ studentMatric: matric.toUpperCase(), institutionId: myInst!._id as any });

      setSuccess({ amount: result.amount, authorisationUrl: result.authorisationUrl });

      setTimeout(() => {
        window.location.href = result.authorisationUrl;
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-8 rounded-xl border border-border bg-surface text-center">
        <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Sign in to Pay</h2>
        <p className="text-muted mb-6">You need to sign in before making a payment.</p>
        <SignInButton mode="modal">
          <button className="px-6 py-2.5 bg-gold text-black font-medium rounded-lg hover:brightness-110 transition-all duration-200">Sign In</button>
        </SignInButton>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-8 rounded-xl border border-border bg-surface text-center">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-primary mb-2">Redirecting to Nomba...</h2>
        <p className="text-muted mb-4">
          You will pay <span className="font-bold text-success">₦{success.amount.toLocaleString()}</span> to complete your registration.
        </p>
        <a href={success.authorisationUrl} className="inline-block px-6 py-2.5 bg-gold text-black font-medium rounded-lg hover:brightness-110 transition-all duration-200">
          Continue to Payment
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handlePayment} className="max-w-md mx-auto p-6 sm:p-8 rounded-xl border border-border bg-surface">
      <h2 className="text-2xl font-bold text-primary mb-1">Pay Your Dues</h2>
      <p className="text-sm text-muted mb-6">Enter your matric number to proceed with payment</p>

      {error && (
        <div className="bg-error/10 border border-error/20 text-error p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-secondary mb-1">Matric Number</label>
        <input
          type="text"
          placeholder="e.g., FUT/2022/CSC/001"
          value={matric}
          onChange={(e) => setMatric(e.target.value.toUpperCase())}
          disabled={loading}
          className="w-full px-3 py-2.5 border border-border bg-surface-secondary rounded-lg focus:border-gold outline-none transition-all duration-200 disabled:opacity-50 text-primary text-sm"
          required
        />
        <p className="text-xs text-muted mt-1">Format: FUT/YYYY/DDD/### (e.g., FUT/2022/CSC/001)</p>
      </div>

      <div className="bg-gold-subtle p-4 rounded-lg mb-6 text-center">
        <p className="text-muted text-sm">Amount to Pay</p>
        <p className="text-3xl font-bold text-gold">₦75,000</p>
        <p className="text-xs text-muted mt-1">Calculated server-side — frontend cannot modify</p>
      </div>

      <button
        type="submit"
        disabled={loading || !matric}
        className="w-full bg-gold text-black py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Connecting to Nomba...
          </span>
        ) : (
          "Pay with Nomba"
        )}
      </button>

      <div className="mt-4 p-3 bg-gold-subtle border border-gold/15 rounded-lg">
        <p className="text-xs text-gold-royal">
          ⚠️ <strong>Security:</strong> The payment amount is calculated on the server, not sent from this form. This prevents amount tampering.
        </p>
      </div>
    </form>
  );
}
