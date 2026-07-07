"use client";

import { Lightbulb, CircleDollarSign, Clock, CreditCard, Check } from "lucide-react";

export function StaffDashboard({ activeTab }: { activeTab?: string }) {
  // MOCKUP: Staff personal allowance dashboard
  // TODO: Connect to real backend queries when allowance/payroll system is built

  const mockAllowances = [
    { date: "2026-06-01", description: "Monthly Allowance - June", amount: 150000, status: "paid" },
    { date: "2026-05-01", description: "Monthly Allowance - May", amount: 150000, status: "paid" },
    { date: "2026-04-01", description: "Monthly Allowance - April", amount: 150000, status: "paid" },
    { date: "2026-03-01", description: "Monthly Allowance - March", amount: 150000, status: "paid" },
    { date: "2026-02-01", description: "Monthly Allowance - February", amount: 150000, status: "paid" },
  ];

  const totalReceived = mockAllowances.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Staff Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Personal allowance and payment history —{" "}
          <span className="text-xs px-2 py-0.5 rounded bg-gold/10 text-gold-royal font-mono">
            Mock Data
          </span>
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-6 rounded-xl border border-border bg-surface">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center mb-3">
            <CircleDollarSign className="w-5 h-5 text-success" />
          </div>
          <p className="text-sm text-muted mb-1">Total Received</p>
          <p className="text-2xl font-bold text-success">
            ₦{totalReceived.toLocaleString()}
          </p>
          <p className="text-xs text-muted-dark mt-1">Across {mockAllowances.length} payments</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface">
          <div className="w-10 h-10 rounded-lg bg-pending/10 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-pending" />
          </div>
          <p className="text-sm text-muted mb-1">Next Payment</p>
          <p className="text-2xl font-bold text-pending">₦150,000</p>
          <p className="text-xs text-muted-dark mt-1">Expected July 1, 2026</p>
        </div>
        <div className="p-6 rounded-xl border border-border bg-surface">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center mb-3">
            <CreditCard className="w-5 h-5 text-info" />
          </div>
          <p className="text-sm text-muted mb-1">Nomba Account</p>
          <p className="text-2xl font-bold text-info">Linked</p>
          <p className="text-xs text-muted-dark mt-1">•••• 4567</p>
        </div>
      </div>

      {/* Allowance History */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-primary">Allowance History</h2>
          <p className="text-xs text-muted mt-0.5">Last 5 payments — mock data</p>
        </div>
        <div className="divide-y divide-border-subtle">
          {mockAllowances.map((allowance, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between hover:bg-hover transition-colors duration-150"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">{allowance.description}</p>
                  <p className="text-xs text-muted">{new Date(allowance.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-mono font-medium text-success">
                  +₦{allowance.amount.toLocaleString()}
                </p>
                <span className="text-xs px-2 py-0.5 rounded bg-success/10 text-success">
                  {allowance.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nomba Account Card */}
      <div className="p-5 rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Nomba Account</p>
              <p className="text-xs text-muted">Receive allowances directly to your linked Nomba account</p>
            </div>
          </div>
          <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-success/10 text-success border border-success/20">
            ✓ Linked
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-xl bg-gold-subtle border border-gold/15">
        <p className="text-xs text-gold-royal flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-gold-royal flex-shrink-0 mt-0.5" />
          <span>This is a mockup dashboard. Connect to the institution&apos;s payroll/allowance system to display real payment data. Contact your Institution Admin to set up allowance disbursement.</span>
        </p>
      </div>
    </div>
  );
}
