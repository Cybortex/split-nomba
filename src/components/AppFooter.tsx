"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ArrowUp, Mail, Phone } from "lucide-react";

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
    <footer id="about" className="relative border-t border-border bg-surface-alt overflow-hidden">
      {/* ── Decorative Top Glow ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* ── Background Orbs ── */}
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-gold/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-24 py-16 lg:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-12">

          {/* ── Column 1: Brand ── */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Split Logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain transition-transform duration-300 group-hover:rotate-12"
              />
              <span className="text-lg font-bold tracking-tight text-primary">
                Split<span className="text-gold">.</span>
              </span>
            </Link>

            <p className="text-sm text-muted leading-relaxed max-w-xs">
              Route every payment where it belongs. Automated fee distribution
              for institutions — fully transparent, fully instant.
            </p>
          </div>

          {/* ── Column 2: Product ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/#features", label: "Features" },
                { href: "/#pricing", label: "Pricing" },
                { href: "/privacy", label: "Security" },
                { href: "/#technology", label: "Developers" },
                { href: "/#technology", label: "API" },
                { href: "/support-materials", label: "Documentation" },
              ].map((link) => (
                <li key={link.label}>
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

          {/* ── Column 3: Company ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-5">
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/#about", label: "About" },
                { href: "mailto:info@cybortex.tech", label: "Contact" },
                { href: "/support-materials", label: "Documentation" },
              ].map((link) => (
                <li key={link.label}>
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

          {/* ── Column 4: Legal ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "/refund-policy", label: "Compliance" },
              ].map((link) => (
                <li key={link.label}>
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

          {/* ── Column 5: Built By ── */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-dark mb-5">
              Built By
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/CybortexLogo.png"
                  alt="Cybortex Technologies Logo"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    Cybortex Technologies
                  </p>
                  <p className="text-xs text-muted-dark">
                    Software Development &amp; Innovation
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-muted">
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
        <div className="mt-16 pt-8 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-dark">
            &copy; {new Date().getFullYear()} Split. All rights reserved. Built with{" "}
            <span className="text-error">❤️</span> using{" "}
            <a
              href="https://nomba.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-royal transition-colors"
            >
              Nomba Infrastructure
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
