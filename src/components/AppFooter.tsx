"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, Mail, Phone, ShieldCheck, FileText, RotateCcw } from "lucide-react";

export default function AppFooter() {
  const pathname = usePathname();

  // Hide footer on dashboard and admin pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t border-border bg-surface-alt overflow-hidden">
      {/* ── Decorative Top Glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* ── Background Orbs ── */}
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── Column 1: Brand ── */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold/20 transition-all duration-300">
                <span className="text-sm font-bold text-gold font-mono">S</span>
              </div>
              <span className="text-lg font-bold tracking-tight text-primary">
                Split<span className="text-gold">.</span>
              </span>
            </Link>

            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Route every payment where it belongs. Automated fee distribution
              for institutions — fully transparent, fully instant.
            </p>

            {/* Contact */}
            <div className="space-y-2 pt-2">
              <a
                href="mailto:info@cybortex.tech"
                className="flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-200 group"
              >
                <span className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-200">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                info@cybortex.tech
              </a>
              <a
                href="tel:+2349071649725"
                className="flex items-center gap-2 text-sm text-muted hover:text-gold transition-colors duration-200 group"
              >
                <span className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-200">
                  <Phone className="w-3.5 h-3.5" />
                </span>
                +234 907 164 9725
              </a>
            </div>
          </div>

          {/* ── Column 2: Platform ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Home" },
                { href: "/register", label: "Register Institution" },
                { href: "/dashboard/pay", label: "Pay Dues" },
                { href: "/sign-in", label: "Sign In" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-gold transition-colors duration-200 inline-flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-border group-hover:bg-gold transition-colors duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Policies ── */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-4">
              Policies
            </h4>
            <ul className="space-y-3">
              {[
                {
                  href: "/privacy",
                  label: "Privacy Policy",
                  icon: ShieldCheck,
                },
                {
                  href: "/terms",
                  label: "Terms of Service",
                  icon: FileText,
                },
                {
                  href: "/refund-policy",
                  label: "Refund Policy",
                  icon: RotateCcw,
                },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted hover:text-gold transition-colors duration-200 inline-flex items-center gap-2 group"
                    >
                      <span className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-200">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* ── Column 4: Built By ── */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-4">
              Built By
            </h4>
            <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center border border-gold/20">
                  <span className="text-sm font-bold text-gold font-mono">C</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Cybortex Technologies
                  </p>
                  <p className="text-xs text-muted-dark">
                    Software Development &amp; Innovation
                  </p>
                </div>
              </div>
              <div className="pt-1 space-y-1.5 text-xs text-muted">
                <a
                  href="mailto:info@cybortex.tech"
                  className="flex items-center gap-1.5 hover:text-gold transition-colors duration-200"
                >
                  <Mail className="w-3 h-3" />
                  info@cybortex.tech
                </a>
                <a
                  href="tel:+2349071649725"
                  className="flex items-center gap-1.5 hover:text-gold transition-colors duration-200"
                >
                  <Phone className="w-3 h-3" />
                  +234 907 164 9725
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="mt-12 pt-6 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-dark">
            &copy; {new Date().getFullYear()} Split. All rights reserved. Built by{" "}
            <a
              href="mailto:info@cybortex.tech"
              className="text-gold hover:text-gold-royal transition-colors"
            >
              Cybortex Technologies
            </a>
            .
          </p>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-gold transition-colors duration-200 group"
            aria-label="Scroll to top"
          >
            Back to top
            <span className="w-6 h-6 rounded-lg bg-surface border border-border flex items-center justify-center group-hover:border-gold/30 group-hover:bg-gold/5 transition-all duration-200">
              <ArrowUp className="w-3 h-3" />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
