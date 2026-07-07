import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-border bg-gold-soft text-gold-royal animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse-gold" />
            Nomba Hackathon 2026
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-primary">
            Route Every Payment
            <br />
            <span className="text-gold">Where It Belongs.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed text-muted">
            One student payment. Multiple wallets. Zero reconciliation.
            Split automatically routes fees to institution, faculty, department,
            and association wallets with complete transparency.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-24 sm:mb-32">
            <Link
              href="/dashboard/pay"
              className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200 shadow-button"
            >
              Pay Your Dues
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-semibold rounded-xl border border-border text-primary hover:bg-hover transition-all duration-200"
            >
              Register Your Institution
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 text-base sm:text-lg font-semibold rounded-xl text-muted hover:text-primary transition-colors duration-200"
            >
              View Dashboard →
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            How It Works
          </h2>
          <p className="text-sm text-muted mt-2 max-w-lg mx-auto">
            From registration to automatic routing — four simple steps.
          </p>
        </div>
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { num: "01", title: "Institution Registers", desc: "University signs up and gets approved. Configures their fee structure." },
              { num: "02", title: "Finance Configures Fees", desc: "Sets fee items per level and fixed allocation rules for each wallet." },
              { num: "03", title: "Student Pays via Nomba", desc: "Enters matric, sees full breakdown, pays securely in seconds." },
              { num: "04", title: "Split Routes Automatically", desc: "Funds atomically routed to wallets. Withdrawals require consensus approval." },
            ].map((step, i) => (
              <div
                key={step.num}
                className="card p-6 sm:p-8 text-left transition-all duration-300 hover:border-gold-royal hover:shadow-card-hover animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold/10 text-gold font-bold text-sm font-mono mb-4">
                  {step.num}
                </span>
                <h3 className="font-semibold text-base sm:text-lg mb-2 text-primary">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            Platform Features
          </h2>
          <p className="text-sm text-muted mt-2">
            Everything you need to manage institutional payments.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {[
            { label: "10 Role RBAC", icon: "🔐" },
            { label: "Multi-Role Users", icon: "👥" },
            { label: "Fee per Level", icon: "📊" },
            { label: "Dept/Faculty Dues", icon: "🏛️" },
            { label: "Nomba Integration", icon: "💳" },
            { label: "Fixed Allocation", icon: "⚖️" },
            { label: "Withdrawal Consensus", icon: "🤝" },
            { label: "Immutable Ledger", icon: "📜" },
            { label: "Institution Onboarding", icon: "🚀" },
            { label: "CSV Import", icon: "📁" },
          ].map((badge) => (
            <div
              key={badge.label}
              className="card p-4 sm:p-5 text-center transition-all duration-200 hover:border-gold-royal hover:shadow-card-hover group cursor-default"
            >
              <span className="text-xl sm:text-2xl mb-2 block">{badge.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-muted group-hover:text-gold transition-colors duration-200">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Role Hierarchy */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            Role Hierarchy
          </h2>
          <p className="text-sm text-muted mt-2">
            Every role has specific capabilities in the ecosystem.
          </p>
        </div>
        <div className="card p-4 sm:p-8">
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
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 sm:py-2.5 border-b border-border-subtle last:border-0"
              >
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded sm:min-w-[170px] w-fit bg-gold-soft text-gold">
                  {role}
                </span>
                <span className="text-sm text-secondary">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Tagline */}
      <section className="text-center pb-16 sm:pb-20">
        <div className="max-w-xl mx-auto px-4">
          <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mb-6" />
          <p className="text-sm text-muted-dark">
            Every payment. Every allocation. Complete transparency.
          </p>
        </div>
      </section>
    </div>
  );
}
