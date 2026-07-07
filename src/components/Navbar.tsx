"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isSuperAdmin = currentUser?.roles?.includes("SUPER_ADMIN");

  return (
    <nav className="sticky top-0 z-50 border-b border-border-subtle bg-app/95 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-primary"
            >
              Split<span className="text-gold">.</span>
            </Link>
            {isSignedIn && (
              <div className="hidden md:flex items-center gap-6">
                {currentUser === undefined ? (
                  <div className="h-4 w-20 rounded bg-border animate-pulse" />
                ) : isSuperAdmin ? (
                  <>
                    <Link
                      href="/admin"
                      className={`text-sm font-medium transition-all duration-200 ${
                        pathname === "/admin" ? "text-gold" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Overview
                    </Link>
                    <Link
                      href="/admin/approvals"
                      className={`text-sm font-medium transition-all duration-200 ${
                        pathname === "/admin/approvals" ? "text-gold" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Approvals
                    </Link>
                    <Link
                      href="/admin/institutions"
                      className={`text-sm font-medium transition-all duration-200 ${
                        pathname === "/admin/institutions" ? "text-gold" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Institutions
                    </Link>
                    <Link
                      href="/admin/audit"
                      className={`text-sm font-medium transition-all duration-200 ${
                        pathname === "/admin/audit" ? "text-gold" : "text-secondary hover:text-primary"
                      }`}
                    >
                      Audit Log
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/dashboard"
                    className={`text-sm font-medium transition-all duration-200 ${
                      pathname?.startsWith("/dashboard") ? "text-gold" : "text-secondary hover:text-primary"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-muted hover:bg-hover transition-colors duration-200"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonPopoverCard: {
                        backgroundColor: "#121317",
                        border: "1px solid #313541",
                      },
                      userButtonPopoverActionItem: {
                        color: "#D5DBE5",
                      },
                    },
                  }}
                />
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Mobile menu toggle - also show on mobile when not signed in */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-muted hover:bg-hover transition-colors duration-200"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex text-sm font-medium px-4 py-2 rounded-lg border border-border text-secondary hover:bg-hover transition-colors duration-200"
                >
                  Register Institution
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-subtle py-3 space-y-1 animate-fade-in">
            {/* Navigation links for signed-in users */}
            {isSignedIn && currentUser && (
              <>
                {isSuperAdmin ? (
                  <>
                    <MobileNavLink href="/admin" label="Overview" active={pathname === "/admin"} onClick={() => setMobileMenuOpen(false)} />
                    <MobileNavLink href="/admin/approvals" label="Approvals" active={pathname === "/admin/approvals"} onClick={() => setMobileMenuOpen(false)} />
                    <MobileNavLink href="/admin/institutions" label="Institutions" active={pathname === "/admin/institutions"} onClick={() => setMobileMenuOpen(false)} />
                    <MobileNavLink href="/admin/audit" label="Audit Log" active={pathname === "/admin/audit"} onClick={() => setMobileMenuOpen(false)} />
                  </>
                ) : (
                  <MobileNavLink href="/dashboard" label="Dashboard" active={pathname?.startsWith("/dashboard") ?? false} onClick={() => setMobileMenuOpen(false)} />
                )}
              </>
            )}

            {/* Links for non-signed-in users */}
            {!isSignedIn && (
              <>
                <MobileNavLink href="/register" label="Register Institution" active={pathname === "/register"} onClick={() => setMobileMenuOpen(false)} />
                <MobileNavLink href="/sign-in" label="Sign In" active={pathname === "/sign-in"} onClick={() => setMobileMenuOpen(false)} />
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

function MobileNavLink({
  href,
  label,
  active,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gold/10 text-gold"
          : "text-secondary hover:bg-hover hover:text-primary"
      }`}
    >
      {label}
    </Link>
  );
}
