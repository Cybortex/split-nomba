"use client";

import { Lightbulb, CircleDollarSign, Clock, CreditCard, Check } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";

export function StaffDashboard({ activeTab }: { activeTab?: string }) {
  // MOCKUP: Staff personal allowance dashboard

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Received"
          value={`₦${totalReceived.toLocaleString()}`}
          valueColor="text-success"
          icon={<CircleDollarSign />}
          subtitle={`Across ${mockAllowances.length} payments`}
        />
        <StatCard
          label="Next Payment"
          value="₦150,000"
          valueColor="text-pending"
          icon={<Clock />}
          subtitle="Expected July 1, 2026"
        />
        <StatCard
          label="Nomba Account"
          value="Linked"
          valueColor="text-info"
          icon={<CreditCard />}
          subtitle="•••• 4567"
        />
      </div>

      {/* Allowance History */}
      <div className="card overflow-hidden">
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
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Nomba Account</p>
              <p className="text-xs text-muted">Receive allowances directly to your linked Nomba account</p>
            </div>
          </div>
          <span className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-success/10 text-success border border-success/20">
            ✓ Linked
          </span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card p-4 bg-gold-subtle border-gold/15">
        <p className="text-xs text-gold-royal flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 text-gold-royal flex-shrink-0 mt-0.5" />
          <span>This is a mockup dashboard. Connect to the institution&apos;s payroll/allowance system to display real payment data. Contact your Institution Admin to set up allowance disbursement.</span>
        </p>
      </div>
    </div>
  );
}
