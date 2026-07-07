import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-border bg-gold-soft text-gold-royal animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse-gold" />
            Nomba Hackathon 2026
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] text-primary">
            One Payment.
            <br />
            <span className="text-gold">Everything Settled.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed text-muted">
            Students make a single payment. Split instantly delivers tuition to the institution,
            dues to departments, funds to faculties, and fees to associations — fully automated
            and fully transparent.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8">
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
          </div>

          <p className="text-sm text-muted-dark">
            Already an admin?{" "}
            <Link href="/dashboard" className="text-gold hover:text-gold-royal transition-colors underline underline-offset-2">
              Sign in to your dashboard
            </Link>
          </p>
        </div>
      </section>

      {/* ── The Problem ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="card p-8 sm:p-12 md:p-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6">
            University fees are fragmented.
          </h2>
          <p className="text-base sm:text-lg text-secondary max-w-3xl mx-auto leading-relaxed mb-8">
            Tuition goes to one bank, faculty dues to a POS vendor, department dues
            to a different account, and SUG fees to someone&apos;s personal wallet.
            Students waste time juggling multiple payment channels. Administrators
            spend weeks reconciling spreadsheets. No one has a clear picture of
            the full financial flow.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto">
            {[
              { title: "For Students", desc: "One click pays everything — tuition, dues, fees. No more running around." },
              { title: "For Institutions", desc: "Every naira lands in the right wallet automatically. Zero reconciliation." },
              { title: "For Everyone", desc: "Complete transparency. Every payment, every allocation, fully visible." },
            ].map((item) => (
              <div key={item.title} className="p-5 rounded-xl bg-surface-secondary border border-border">
                <h3 className="font-semibold text-primary mb-1.5">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            How It Works
          </h2>
          <p className="text-sm text-muted mt-2 max-w-lg mx-auto">
            Four simple steps from setup to payout.
          </p>
        </div>
        <div className="relative">
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { num: "01", title: "Institution Signs Up", desc: "Your university registers and gets approved. Set up takes minutes." },
              { num: "02", title: "Fees Are Configured", desc: "Finance team sets what each student level pays and where the money goes." },
              { num: "03", title: "Student Pays Once", desc: "One secure payment covers everything — tuition, dues, association fees." },
              { num: "04", title: "Money Routes Automatically", desc: "Funds are split and sent to the right wallets instantly. No manual work." },
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

      {/* ── Who It&apos;s For ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            Built for Every Role on Campus
          </h2>
          <p className="text-sm text-muted mt-2">
            Everyone in the ecosystem gets the right tools and the right access.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { role: "Students", what: "Pay all fees in one place. View every transaction and receipt instantly." },
            { role: "Finance Teams", what: "Configure fee rules per level. Automate allocations. No spreadsheets." },
            { role: "Deans & HODs", what: "Monitor faculty and department wallet balances. See exactly where funds are." },
            { role: "Student Leaders", what: "Request withdrawals for association projects with full transparency." },
            { role: "Staff Advisors", what: "Review and approve withdrawal requests. Ensure funds are used properly." },
            { role: "Institution Admins", what: "Oversee the entire structure — users, wallets, and compliance." },
          ].map((item) => (
            <div
              key={item.role}
              className="card p-5 sm:p-6 transition-all duration-200 hover:border-gold-royal hover:shadow-card-hover"
            >
              <h3 className="font-semibold text-primary mb-1.5">{item.role}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.what}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Registration Guide ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary">
            Register Your Institution
          </h2>
          <p className="text-sm text-muted mt-2 max-w-lg mx-auto">
            Getting your university on Split takes just a few minutes.
          </p>
        </div>

        <div className="card p-6 sm:p-8 md:p-10 space-y-8">
          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <span className="text-sm font-bold text-gold font-mono">1</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary mb-1">Fill out the registration form</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                Provide your institution name, admin email, and admin name. Optional
                phone and address fields help us set up your virtual accounts.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-royal transition-colors"
              >
                Open registration form →
              </Link>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <span className="text-sm font-bold text-gold font-mono">2</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary mb-1">Wait for approval</h3>
              <p className="text-sm text-muted leading-relaxed">
                After submission, a Super Admin reviews your application. You&apos;ll
                receive an email once your institution is approved and ready to go.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <span className="text-sm font-bold text-gold font-mono">3</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary mb-1">Set up your fee structure</h3>
              <p className="text-sm text-muted leading-relaxed">
                Once approved, your Finance team can log in and configure fee items,
                set amounts per academic level, and define how payments are split
                across institution, faculty, department, and association wallets.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Step 4 */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <span className="text-sm font-bold text-gold font-mono">4</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary mb-1">Students start paying</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                Share the payment link with your students. They enter their matric
                number, see a full breakdown of what they owe, and pay securely in
                seconds. Funds route automatically.
              </p>
              <Link
                href="/dashboard/pay"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:text-gold-royal transition-colors"
              >
                Try the student payment flow →
              </Link>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200 shadow-button"
          >
            Register Your Institution Now
          </Link>
          <p className="text-xs text-muted-dark mt-3">
            Free to register. No setup fees. Just transparent institutional payments.
          </p>
        </div>
      </section>

      {/* ── Built With ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24 sm:mb-32">
        <div className="card p-6 sm:p-8 text-center">
          <p className="text-xs text-muted-dark uppercase tracking-wider mb-3 font-medium">
            Built With
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <span>Next.js</span>
            <span className="text-border-subtle">·</span>
            <span>Convex</span>
            <span className="text-border-subtle">·</span>
            <span>Clerk</span>
            <span className="text-border-subtle">·</span>
            <span>Nomba</span>
            <span className="text-border-subtle">·</span>
            <span>Tailwind CSS</span>
          </div>
        </div>
      </section>

      {/* ── Footer Tagline ── */}
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
