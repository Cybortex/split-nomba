import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-border bg-gold-soft text-gold-royal">
          <span className="w-2 h-2 rounded-full bg-gold" />
          Nomba Hackathon 2026
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight text-primary">
          Route Every Payment
          <br />
          <span className="text-gold">Where It Belongs.</span>
        </h1>

        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed text-muted">
          One student payment. Multiple wallets. Zero reconciliation.
          Split automatically routes fees to institution, faculty, department,
          and association wallets with complete transparency.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
          <Link
            href="/dashboard/pay"
            className="px-8 py-3.5 text-lg font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            Pay Your Dues
          </Link>
          <Link
            href="/register"
            className="px-8 py-3.5 text-lg font-semibold rounded-xl border border-border text-primary hover:bg-hover transition-all duration-200"
          >
            Register Your Institution
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3.5 text-lg font-semibold rounded-xl text-muted hover:text-primary transition-colors duration-200"
          >
            View Dashboard →
          </Link>
        </div>

        {/* How It Works */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold mb-10 text-center text-primary">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { num: "01", title: "Institution Registers", desc: "University signs up and gets approved. Configures their fee structure." },
              { num: "02", title: "Finance Configures Fees", desc: "Sets fee items per level and fixed allocation rules for each wallet." },
              { num: "03", title: "Student Pays via Nomba", desc: "Enters matric, sees full breakdown, pays securely in seconds." },
              { num: "04", title: "Split Routes Automatically", desc: "Funds atomically routed to wallets. Withdrawals require consensus approval." },
            ].map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-xl border border-border bg-surface text-left transition-all duration-200 hover:scale-[1.02] hover:border-gold-royal"
              >
                <span className="text-sm font-mono mb-3 block text-gold">
                  {step.num}
                </span>
                <h3 className="font-semibold mb-2 text-primary">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold mb-8 text-center text-primary">
            Platform Features
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              "10 Role RBAC", "Multi-Role Users", "Fee per Level",
              "Dept/Faculty/SUG Dues", "Nomba Integration",
              "Fixed Allocation", "Withdrawal Consensus", "Immutable Ledger",
              "Institution Onboarding", "CSV Import",
            ].map((badge) => (
              <span
                key={badge}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-border bg-surface text-muted transition-all duration-200 hover:border-gold-royal hover:text-gold"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Role Hierarchy */}
        <div className="rounded-2xl border border-border bg-surface p-8 text-left max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-primary">Role Hierarchy</h2>
          <div className="space-y-1">
            {[
              ["SUPER_ADMIN", "Global oversight, approves institutions"],
              ["INSTITUTION_ADMIN", "Manages structure & users"],
              ["FINANCE", "Configures fees & allocation rules"],
              ["STUDENT_AFFAIRS", "Creates & manages associations"],
              ["DEAN", "Faculty oversight, assigns HODs"],
              ["HOD", "Department oversight, assigns advisors"],
              ["STAFF / STAFF_ADVISOR", "Receives allowances, approves withdrawals"],
              ["STUDENT_EXCO", "Initiates association withdrawals"],
              ["STUDENT", "Pays fees, views transparency data"],
            ].map(([role, desc]) => (
              <div
                key={role}
                className="flex items-center gap-4 py-2.5 border-b border-border-subtle last:border-0"
              >
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded min-w-[160px] bg-gold-soft text-gold">
                  {role}
                </span>
                <span className="text-sm text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <p className="mt-16 text-sm text-muted-dark">
          Every payment. Every allocation. Complete transparency.
        </p>
      </div>
    </div>
  );
}
