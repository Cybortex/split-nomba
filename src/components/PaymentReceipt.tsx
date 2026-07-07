"use client";

import { Printer } from "lucide-react";
import Image from "next/image";

interface ReceiptData {
  payment: {
    id: string;
    reference: string;
    nombaTransactionId: string;
    amount: number;
    status: string;
    matric: string;
    faculty: string;
    department: string;
    level: number;
    createdAt: number;
    completedAt?: number;
    platformFee?: number;
    nombaFee?: number;
  };
  student: {
    matric: string;
    email: string;
    faculty: string;
    department: string;
    level: number;
    name?: string;
  } | null;
  institution: { name: string } | null;
  feeBreakdown?: {
    tuition: number;
    departmentDues: number;
    facultyDues: number;
    sugDues: number;
  };
}

export function PaymentReceipt({ data }: { data: ReceiptData }) {
  const { payment, student, institution, feeBreakdown } = data;
  const isCompleted = payment.status === "completed";
  
  const platformFee = payment.platformFee || 0;
  const nombaFee = payment.nombaFee || 0;
  const totalCharged = payment.amount + platformFee + nombaFee;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-NG", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="max-w-2xl mx-auto">
      {/* Local Print Stylesheet */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          nav, header, footer, .no-print, button, sidebar, .sticky, [role="navigation"], aside {
            display: none !important;
          }
          .max-w-2xl {
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #receipt {
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-surface-secondary {
            background-color: #f3f4f6 !important;
            color: black !important;
          }
          .text-primary {
            color: black !important;
          }
          .text-secondary {
            color: #374151 !important;
          }
          .text-muted {
            color: #4b5563 !important;
          }
          .text-gold {
            color: #b45309 !important;
          }
        }
      `}</style>

      {/* Print Button — hidden when printing */}
      <div className="no-print flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Download PDF / Print Receipt
        </button>
      </div>

      {/* Receipt Card */}
      <div
        id="receipt"
        className="p-8 rounded-2xl border border-border bg-surface"
      >
        {/* Header */}
        <div className="text-center border-b border-border-subtle pb-6 mb-6">
          <div className="inline-flex items-center gap-2 mb-4">
            <Image
              src="/logo.png"
              alt="Split Logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="text-2xl font-bold tracking-tight text-primary">
              Split<span className="text-gold">.</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary mb-1">
            Payment Receipt
          </h1>
          <p className="text-xs font-mono text-muted mb-2">Receipt No: {payment.reference}</p>
          {institution && (
            <p className="text-sm text-muted">{institution.name}</p>
          )}
        </div>

        {/* Status Badge */}
        <div className="text-center mb-6">
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success/10 border border-success/20">
              <span className="w-2 h-2 rounded-full bg-success" />
              <span className="text-sm font-medium text-success">Payment Completed</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pending/10 border border-pending/20">
              <span className="w-2 h-2 rounded-full bg-pending" />
              <span className="text-sm font-medium text-pending">Payment {payment.status}</span>
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="text-center mb-6">
          <p className="text-xs text-muted mb-1">Total Charged</p>
          <p className="text-4xl font-bold text-gold font-mono tracking-tight">
            ₦{totalCharged.toLocaleString()}
          </p>
        </div>

        {/* Fee Breakdown */}
        {feeBreakdown && (
          <div className="p-4 rounded-xl bg-surface-secondary mb-6">
            <h3 className="text-sm font-semibold text-gold mb-3">Fee Breakdown</h3>
            <div className="space-y-2">
              {[
                { label: "Tuition", amount: feeBreakdown.tuition },
                { label: "Department Dues", amount: feeBreakdown.departmentDues },
                { label: "Faculty Dues", amount: feeBreakdown.facultyDues },
                { label: "SUG Dues", amount: feeBreakdown.sugDues },
              ].filter((item) => item.amount > 0).map((item) => (
                <div key={item.label} className="flex justify-between py-1.5 border-b border-border-subtle last:border-0">
                  <span className="text-sm text-secondary">{item.label}</span>
                  <span className="text-sm font-mono font-medium text-primary">
                    ₦{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-1.5 border-b border-border-subtle">
                <span className="text-sm text-secondary">Academic Fees Subtotal</span>
                <span className="text-sm font-mono font-medium text-primary">
                  ₦{payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-subtle">
                <span className="text-sm text-secondary">Platform Service Fee</span>
                <span className="text-sm font-mono font-medium text-primary">
                  ₦{platformFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border-subtle">
                <span className="text-sm text-secondary">Nomba Processing Fee</span>
                <span className="text-sm font-mono font-medium text-primary">
                  ₦{nombaFee.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="text-sm font-bold text-primary">Total Charged</span>
                <span className="text-sm font-mono font-bold text-gold">
                  ₦{totalCharged.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Student Details */}
        <div className="p-4 rounded-xl bg-surface-secondary mb-6">
          <h3 className="text-sm font-semibold text-gold mb-3">Student Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
            <div>
              <p className="text-xs text-muted">Student Name</p>
              <p className="text-sm font-medium text-primary">{student?.name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Matric Number</p>
              <p className="text-sm font-mono font-medium text-primary">{payment.matric}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="text-sm text-primary">{student?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Faculty</p>
              <p className="text-sm text-primary">{student?.faculty || payment.faculty}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Department</p>
              <p className="text-sm text-primary">{student?.department || payment.department}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Level</p>
              <p className="text-sm font-mono text-primary">{payment.level} Level</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="p-4 rounded-xl bg-surface-secondary mb-6">
          <h3 className="text-sm font-semibold text-gold mb-3">Payment Details</h3>
          <div className="space-y-2.5">
            <div className="flex justify-between">
              <span className="text-xs text-muted">Reference</span>
              <span className="text-xs font-mono text-primary">{payment.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted">Transaction ID</span>
              <span className="text-xs font-mono text-primary">{payment.nombaTransactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted">Initiated</span>
              <span className="text-xs text-primary">{formatDate(payment.createdAt)}</span>
            </div>
            {payment.completedAt && (
              <div className="flex justify-between">
                <span className="text-xs text-muted">Completed</span>
                <span className="text-xs text-primary">{formatDate(payment.completedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-xs text-muted">Status</span>
              <span className={`text-xs font-medium font-mono ${
                isCompleted ? "text-success" : "text-pending"
              }`}>
                {payment.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Allocation Info */}
        <div className="p-4 rounded-xl bg-gold-subtle border border-gold/15">
          <h3 className="text-xs font-semibold text-gold-royal mb-2">How This Payment Was Routed</h3>
          <p className="text-xs text-gold-royal leading-relaxed">
            This payment of ₦{payment.amount.toLocaleString()} was automatically split across
            institution, faculty, department, and association wallets based on
            configured allocation rules. Every transaction is recorded in an
            immutable audit trail for complete transparency.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-border-subtle">
          <p className="text-xs text-muted">
            Split — Institutional Payment Routing Platform
          </p>
          <p className="text-xs text-muted-dark mt-0.5">
            This is a computer-generated receipt. No signature required.
          </p>
        </div>
      </div>
    </div>
  );
}
