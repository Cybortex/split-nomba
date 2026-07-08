"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  CreditCard,
  GitBranch,
  Users,
  BarChart3,
  Shield,
  Settings,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Layers,
  Zap,
  Lock,
  Eye,
  Workflow,
  Building2,
  Landmark,
  GraduationCap,
  BadgeCheck,
  LandmarkIcon,
  TrendingUp,
  Globe,
  Clock,
  CheckCircle2,
  Quote,
  Terminal,
  ArrowUpRight,
} from "lucide-react";

/* ── Intersection Observer Hook ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ── Count-Up Animation ── */
function CountUp({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);

  useEffect(() => {
    if (!inView) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── Fade-In Wrapper ── */
function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`${className}`}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════ */
/*                     LANDING PAGE                           */
/* ════════════════════════════════════════════════════════════ */

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  HERO                                                  */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-[700px] h-[500px] bg-gold/[0.04] rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-gold/[0.03] rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto w-full px-6 sm:px-12 lg:px-24 py-24 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[calc(100vh-200px)]">
            {/* ── Left: Content ── */}
            <div className="max-w-[620px]">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/[0.08] border border-gold/10 text-gold text-sm font-medium mb-8">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse-gold" />
                Financial Infrastructure for Educational Institutions
              </div>

              {/* Heading */}
              <h1 className="text-[48px] sm:text-[56px] lg:text-[64px] font-extrabold leading-[1.1] tracking-[-0.03em] mb-6">
                Route Every{" "}
                <span className="text-gold">Payment</span>
                <br />
                Where It Belongs.
              </h1>

              {/* Supporting text */}
              <p className="text-lg leading-[32px] text-secondary max-w-[560px] mb-10">
                Split automates institutional payment collection, revenue routing,
                and financial governance — giving universities, faculties,
                departments, and student associations complete transparency over
                every payment.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-start gap-4 mb-12">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 px-8 h-14 text-base font-semibold rounded-xl bg-gold text-black hover:shadow-[0_0_32px_rgba(255,215,0,0.25)] transition-all duration-300 hover:scale-[1.03]"
                >
                  Start Free
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#solution"
                  className="inline-flex items-center gap-2 px-8 h-14 text-base font-semibold rounded-xl border border-border text-primary hover:bg-hover transition-all duration-300"
                >
                  Watch Demo
                </Link>
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-6">
                {[
                  { value: 3000, suffix: "+", label: "Institutions" },
                  { value: 1800000, suffix: "+", label: "Students" },
                  { value: 100, suffix: "%", label: "Allocation Transparency" },
                ].map((m) => (
                  <div key={m.label} className="text-left">
                    <div className="text-2xl font-bold text-primary font-mono tracking-tight">
                      <CountUp end={m.value} suffix={m.suffix} />
                    </div>
                    <div className="text-sm text-muted mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Glassmorphism Illustration ── */}
            <div className="hidden lg:block relative h-[520px]">
              {/* Main glass card */}
              <div className="absolute top-8 left-4 right-0 bottom-12 rounded-2xl border border-border bg-surface/60 backdrop-blur-xl shadow-[var(--shadow-modal)] overflow-hidden">
                {/* Dashboard header */}
                <div className="flex items-center gap-2 px-5 py-3 border-b border-border-subtle">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-pending/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-success/60" />
                  </div>
                  <div className="flex-1 text-center text-xs text-muted-dark font-mono">
                    split.app/dashboard
                  </div>
                </div>
                {/* Dashboard body */}
                <div className="p-5 space-y-4">
                  {/* Top stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Total Revenue", val: "₦12.4M", color: "text-success" },
                      { label: "Allocated", val: "₦11.8M", color: "text-gold" },
                      { label: "Pending", val: "₦600K", color: "text-pending" },
                    ].map((s) => (
                      <div key={s.label} className="p-3 rounded-xl bg-surface-secondary border border-border-subtle">
                        <div className="text-[10px] text-muted-dark mb-1">{s.label}</div>
                        <div className={`text-sm font-bold font-mono ${s.color}`}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                  {/* Chart placeholder */}
                  <div className="h-28 rounded-xl bg-surface-secondary border border-border-subtle p-4 flex items-end gap-1.5">
                    {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-gold/20 hover:bg-gold/40 transition-colors"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  {/* Allocation flow */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: "Institution", pct: "40%", color: "bg-gold/20 text-gold" },
                      { name: "Faculty", pct: "25%", color: "bg-info/20 text-info" },
                      { name: "Department", pct: "20%", color: "bg-success/20 text-success" },
                      { name: "Association", pct: "15%", color: "bg-pending/20 text-pending" },
                    ].map((a) => (
                      <div key={a.name} className={`p-2 rounded-lg ${a.color} text-center`}>
                        <div className="text-[10px] font-medium">{a.name}</div>
                        <div className="text-xs font-bold font-mono">{a.pct}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating wallet card */}
              <div className="absolute -top-2 -right-4 w-56 p-4 rounded-2xl border border-border bg-surface/80 backdrop-blur-xl shadow-[var(--shadow-dropdown)] animate-slide-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-dark">Main Wallet</div>
                    <div className="text-sm font-bold font-mono text-primary">₦2,450,000</div>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-surface-secondary overflow-hidden">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-gold/60 to-gold" />
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute bottom-0 left-0 w-64 p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-xl shadow-[var(--shadow-dropdown)] flex items-center gap-3 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>
                <div>
                  <div className="text-xs font-medium text-primary">Payment Received</div>
                  <div className="text-[10px] text-muted">₦85,000 routed to 4 wallets</div>
                </div>
              </div>

              {/* Floating receipt */}
              <div className="absolute top-0 right-8 w-48 p-3 rounded-xl border border-border bg-surface/80 backdrop-blur-xl shadow-[var(--shadow-dropdown)] animate-slide-up" style={{ animationDelay: "0.6s" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-gold/10 flex items-center justify-center">
                    <Receipt />
                  </div>
                  <span className="text-[10px] font-medium text-primary">Receipt #4821</span>
                </div>
                <div className="text-lg font-bold font-mono text-gold">₦125,000</div>
                <div className="text-[9px] text-muted-dark mt-1">Tuition + Faculty Dues</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  TRUSTED BY                                           */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <FadeIn className="text-center mb-12">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight">
              Designed for Every Educational Institution
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: Landmark, label: "University" },
              { icon: Building2, label: "Polytechnic" },
              { icon: GraduationCap, label: "College" },
              { icon: BadgeCheck, label: "Professional Body" },
              { icon: LandmarkIcon, label: "Government Agency" },
            ].map((inst, i) => (
              <FadeIn key={inst.label} delay={i * 0.08}>
                <div className="group p-6 rounded-2xl border border-border bg-surface hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 text-center cursor-default">
                  <inst.icon className="w-8 h-8 text-muted group-hover:text-gold mx-auto mb-3 transition-colors duration-300" />
                  <span className="text-sm font-medium text-secondary">{inst.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  PROBLEM SECTION                                      */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 bg-surface-alt">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <FadeIn className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight mb-4">
              Institutional Payments Shouldn&apos;t End in Uncertainty
            </h2>
            <p className="text-lg text-secondary max-w-2xl mx-auto">
              The current system is broken. Payments disappear into accounts with no
              visibility, no automation, and no accountability.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: "Centralized Collection",
                desc: "Payments are collected into one account but often require manual distribution to faculties, departments, and associations.",
              },
              {
                icon: Eye,
                title: "Limited Transparency",
                desc: "Stakeholders cannot easily verify collections, allocations, or pending balances across the institution.",
              },
              {
                icon: Clock,
                title: "Operational Delays",
                desc: "Projects stall while organizations wait for funds already paid by students, stuck in reconciliation limbo.",
              },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="group relative p-8 rounded-[20px] border border-border bg-surface hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold/0 group-hover:bg-gold transition-colors duration-300" />
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                  <p className="text-base leading-[28px] text-secondary">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  SOLUTION SECTION                                     */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section id="solution" className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Process Flow */}
            <FadeIn>
              <div className="relative p-8 rounded-2xl border border-border bg-surface">
                {/* Student */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-primary">Student</div>
                    <div className="text-xs text-muted">Makes a single payment</div>
                  </div>
                </div>
                {/* Arrow */}
                <div className="ml-5 w-px h-6 bg-border relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-l-2 border-b-2 border-gold rotate-[-45deg] translate-y-1" />
                </div>
                {/* Split */}
                <div className="flex items-center gap-4 my-6">
                  <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center">
                    <Zap className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gold">Split</div>
                    <div className="text-xs text-muted">Automates routing</div>
                  </div>
                </div>
                {/* Arrow */}
                <div className="ml-5 w-px h-6 bg-border relative">
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-l-2 border-b-2 border-gold rotate-[-45deg] translate-y-1" />
                </div>
                {/* Destinations */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    { name: "Institution", color: "bg-gold/10 text-gold border-gold/20" },
                    { name: "Faculty", color: "bg-info/10 text-info border-info/20" },
                    { name: "Department", color: "bg-success/10 text-success border-success/20" },
                    { name: "Association", color: "bg-pending/10 text-pending border-pending/20" },
                  ].map((d) => (
                    <div
                      key={d.name}
                      className={`p-3 rounded-xl border text-center text-sm font-medium ${d.color}`}
                    >
                      {d.name}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Right: Explanation */}
            <div>
              <FadeIn>
                <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight mb-4">
                  Meet Split
                </h2>
                <p className="text-lg text-secondary mb-8 max-w-lg">
                  Financial infrastructure that automates institutional revenue
                  allocation.
                </p>
              </FadeIn>

              <div className="space-y-6">
                {[
                  {
                    icon: Zap,
                    title: "Every payment follows predefined allocation rules.",
                    desc: "Configure split percentages per fee item. Funds route automatically on payment.",
                  },
                  {
                    icon: Eye,
                    title: "No spreadsheets. No manual reconciliation.",
                    desc: "Real-time dashboards show exactly where every naira is, across every wallet.",
                  },
                  {
                    icon: Shield,
                    title: "No uncertainty.",
                    desc: "Every stakeholder — from students to finance officers — has full visibility into the financial flow.",
                  },
                ].map((item, i) => (
                  <FadeIn key={item.title} delay={i * 0.1}>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-5 h-5 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-primary mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  FEATURES SECTION                                     */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 bg-surface-alt">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <FadeIn className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight">
              Everything You Need
            </h2>
            <p className="text-lg text-secondary mt-4 max-w-xl mx-auto">
              A complete platform for institutional financial governance.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: CreditCard,
                title: "Unified Student Payments",
                desc: "Students pay once. Tuition, dues, association fees — all covered in a single transaction.",
              },
              {
                icon: GitBranch,
                title: "Automatic Allocation",
                desc: "Funds are routed instantly to institution, faculty, department, and association wallets.",
              },
              {
                icon: Lock,
                title: "Role-Based Governance",
                desc: "Controlled approvals with multi-step authorization. Student executives, advisors, and finance officers.",
              },
              {
                icon: BarChart3,
                title: "Real-Time Dashboards",
                desc: "Reactive dashboards that update instantly as payments flow through the system.",
              },
              {
                icon: Shield,
                title: "Audit Trails",
                desc: "Every action recorded. Complete financial accountability from collection to allocation.",
              },
              {
                icon: Settings,
                title: "Institution Management",
                desc: "Configure fees, users, wallets, and allocation rules from a single admin panel.",
              },
            ].map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.08}>
                <div className="group h-full p-8 rounded-2xl border border-border bg-surface hover:border-gold/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mb-5 group-hover:bg-gold/15 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-gold" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-base leading-[28px] text-secondary">
                    {feature.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  GOVERNANCE SECTION                                   */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <FadeIn className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight">
              Built for Accountability
            </h2>
            <p className="text-lg text-secondary mt-4 max-w-xl mx-auto">
              Every withdrawal follows a structured approval chain before funds are released.
            </p>
          </FadeIn>

          <FadeIn>
            <div className="max-w-2xl mx-auto">
              {[
                {
                  step: "Student Executive",
                  desc: "Initiates the withdrawal request with purpose, amount, and supporting details.",
                  icon: Users,
                  color: "bg-gold/10 text-gold border-gold/20",
                },
                {
                  step: "Staff Advisor",
                  desc: "Reviews and validates the request against the association's budget and guidelines.",
                  icon: Shield,
                  color: "bg-info/10 text-info border-info/20",
                },
                {
                  step: "Finance Officer",
                  desc: "Final approval and fund release. Payment is processed and recorded in the audit trail.",
                  icon: Lock,
                  color: "bg-success/10 text-success border-success/20",
                },
                {
                  step: "Completed",
                  desc: "Funds are disbursed. Both parties receive confirmation and the full transaction is logged.",
                  icon: CheckCircle2,
                  color: "bg-pending/10 text-pending border-pending/20",
                },
              ].map((item, i) => (
                <div key={item.step} className="flex gap-6 mb-0 last:mb-0">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    {i < 3 && <div className="w-px flex-1 bg-border min-h-[40px]" />}
                  </div>
                  {/* Content */}
                  <div className="pb-10">
                    <h3 className="text-lg font-bold text-primary mb-1">{item.step}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  PRODUCT SHOWCASE                                     */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 bg-surface-alt">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <FadeIn className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight">
              See It in Action
            </h2>
            <p className="text-lg text-secondary mt-4 max-w-xl mx-auto">
              Purpose-built dashboards for every role in the institution.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Student Dashboard", desc: "View payments, download receipts, and track dues status.", color: "from-gold/10 to-transparent" },
              { title: "Institution Dashboard", desc: "Overview of all wallets, collections, and allocation health.", color: "from-info/10 to-transparent" },
              { title: "Faculty Dashboard", desc: "Monitor department budgets and faculty wallet balances.", color: "from-success/10 to-transparent" },
              { title: "Department Dashboard", desc: "Track department-specific collections and association flows.", color: "from-pending/10 to-transparent" },
              { title: "Payment Receipt", desc: "Detailed breakdown of every allocation in a single receipt.", color: "from-gold/10 to-transparent" },
              { title: "Wallet Overview", desc: "Real-time balance tracking across all institutional wallets.", color: "from-info/10 to-transparent" },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.08}>
                <div className="group h-full rounded-2xl border border-border bg-surface overflow-hidden hover:border-gold/30 hover:-translate-y-1 transition-all duration-300">
                  {/* Mock dashboard header */}
                  <div className={`h-36 bg-gradient-to-br ${item.color} p-5 flex items-end`}>
                    <div className="w-full space-y-2">
                      <div className="h-2 w-24 rounded bg-border-subtle" />
                      <div className="h-2 w-16 rounded bg-border-subtle" />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-primary mb-2">{item.title}</h3>
                    <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  TECHNOLOGY SECTION                                   */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <FadeIn className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight">
              Powered by Modern Infrastructure
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { name: "Next.js", desc: "Frontend Framework", icon: Globe },
              { name: "Convex", desc: "Real-time Database", icon: Layers },
              { name: "Clerk", desc: "Authentication", icon: Lock },
              { name: "Nomba", desc: "Payment Processing", icon: CreditCard },
              { name: "Vercel", desc: "Deployment Platform", icon: Zap },
            ].map((tech, i) => (
              <FadeIn key={tech.name} delay={i * 0.08}>
                <div className="group p-6 rounded-2xl border border-border bg-surface hover:border-gold/30 hover:-translate-y-1 transition-all duration-300 text-center">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/15 transition-colors duration-300">
                    <tech.icon className="w-6 h-6 text-gold" />
                  </div>
                  <div className="text-base font-bold text-primary mb-1">{tech.name}</div>
                  <div className="text-sm text-muted">{tech.desc}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  STATISTICS SECTION                                   */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 bg-black">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {[
              { value: 3000, suffix: "+", label: "Institutions" },
              { value: 1800000, suffix: "+", label: "Students" },
              { value: 2000000000000, suffix: "+", label: "Annual Flow" },
              { value: 0, suffix: "∞", label: "Future Possibilities", special: true },
            ].map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-[48px] sm:text-[56px] lg:text-[64px] font-extrabold text-gold tracking-tight leading-none mb-2">
                    {stat.special ? (
                      "∞"
                    ) : (
                      <CountUp end={stat.value} suffix={stat.suffix} />
                    )}
                  </div>
                  <div className="text-base text-muted">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  TESTIMONIALS                                         */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 lg:px-24">
          <FadeIn className="text-center mb-16">
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight">
              Trusted by Institutions
            </h2>
            <p className="text-lg text-secondary mt-4">
              Testimonials coming soon.
            </p>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="p-8 rounded-2xl border border-border bg-surface">
                  <Quote className="w-8 h-8 text-gold/30 mb-4" />
                  <div className="h-4 w-3/4 rounded bg-surface-secondary mb-4" />
                  <div className="h-4 w-1/2 rounded bg-surface-secondary mb-6" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-surface-secondary" />
                    <div>
                      <div className="h-3 w-24 rounded bg-surface-secondary mb-1" />
                      <div className="h-2 w-16 rounded bg-surface-secondary" />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/*  CTA SECTION                                          */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-24 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold/[0.06] rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-[800px] mx-auto px-6 sm:px-12 text-center">
          <FadeIn>
            <h2 className="text-[32px] sm:text-[40px] lg:text-[48px] font-bold text-primary tracking-tight mb-6">
              Bring Transparency to Institutional Finance.
            </h2>
            <p className="text-lg text-secondary mb-10 max-w-2xl mx-auto leading-[32px]">
              Whether you&apos;re managing a university, faculty, department, or
              association, Split gives every stakeholder confidence that every
              payment reaches its destination.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2 px-8 h-14 text-base font-semibold rounded-xl bg-gold text-black hover:shadow-[0_0_32px_rgba(255,215,0,0.25)] transition-all duration-300 hover:scale-[1.03]"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                href="mailto:info@cybortex.tech"
                className="inline-flex items-center gap-2 px-8 h-14 text-base font-semibold rounded-xl border border-border text-primary hover:bg-hover transition-all duration-300"
              >
                Request Demo
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

/* ── Small receipt icon for the floating card ── */
function Receipt() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8h-4" />
      <path d="M16 12h-6" />
    </svg>
  );
}
