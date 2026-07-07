"use client";

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
  };
  student: {
    matric: string;
    email: string;
    faculty: string;
    department: string;
    level: number;
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
      {/* Print Button — hidden when printing */}
      <div className="no-print flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Receipt
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
            <span className="text-2xl font-bold tracking-tight text-primary">
              Split<span className="text-gold">.</span>
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary mb-1">
            Payment Receipt
          </h1>
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
          <p className="text-xs text-muted mb-1">Amount Paid</p>
          <p className="text-4xl font-bold text-gold font-mono tracking-tight">
            ₦{payment.amount.toLocaleString()}
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
                <span className="text-sm font-mono font-bold text-gold">
                  ₦{payment.amount.toLocaleString()}
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
              <p className="text-xs text-muted">Matric Number</p>
              <p className="text-sm font-mono font-medium text-primary">{payment.matric}</p>
            </div>
            {student && (
              <>
                <div>
                  <p className="text-xs text-muted">Email</p>
                  <p className="text-sm text-primary">{student.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Faculty</p>
                  <p className="text-sm text-primary">{payment.faculty}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Department</p>
                  <p className="text-sm text-primary">{payment.department}</p>
                </div>
              </>
            )}
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
