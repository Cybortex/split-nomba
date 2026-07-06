"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { PaymentReceipt } from "@/components/PaymentReceipt";
import Link from "next/link";

export default function ReceiptPage() {
  const params = useParams();
  const paymentId = params.id as string;
  const currentUser = useQuery(api.auth.getCurrentUser);
  const myInst = useQuery(api.auth.getMyInstitution);

  // SUPER_ADMIN bypass: they have no institution, so skip the myInst requirement
  const isSuperAdmin = !!(currentUser && currentUser.roles.includes("SUPER_ADMIN"));
  const canQuery = myInst || isSuperAdmin;
  // For SUPER_ADMIN, pass paymentId as institutionId — valid Convex ID,
  // and the backend bypasses the institution check for them anyway
  const queryArgs = canQuery
    ? {
        paymentId: paymentId as any,
        institutionId: (myInst?._id || paymentId) as any,
      }
    : "skip";

  const receipt = useQuery(api.payments.getReceipt, queryArgs);

  // Loading state — query hasn't returned yet
  if (receipt === undefined || (!myInst && !isSuperAdmin)) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="skeleton w-64 h-8 rounded-full" />
      </div>
    );
  }

  // Query returned null — payment not found or access denied
  if (!receipt || !receipt.payment) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-border bg-surface text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-error/10">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-primary">Receipt Not Found</h2>
          <p className="text-sm mb-6 text-muted">This payment receipt could not be found.</p>
          <Link href="/dashboard" className="inline-block px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <PaymentReceipt data={receipt as any} />
      </div>
    </div>
  );
}
