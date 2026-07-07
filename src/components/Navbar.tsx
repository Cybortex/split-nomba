"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { X, Menu } from "lucide-react";
import Image from "next/image";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSuperAdmin = currentUser?.roles?.includes("SUPER_ADMIN");

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close on backdrop click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [mobileMenuOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-app/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary group"
            >
              <Image
                src="/logo.png"
                alt="Split Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
              <span>
                Split<span className="text-gold">.</span>
              </span>
            </Link>
            {isSignedIn && (
              <div className="hidden md:flex items-center gap-1">
                {currentUser === undefined ? (
                  <div className="h-4 w-20 rounded bg-border animate-pulse" />
                ) : isSuperAdmin ? (
                  <NavLinks pathname={pathname} />
                ) : (
                  <Link
                    href="/dashboard"
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      pathname?.startsWith("/dashboard") 
                        ? "bg-gold/10 text-gold" 
                        : "text-secondary hover:text-primary hover:bg-hover"
                    }`}
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            {isSignedIn ? (
              <>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-muted hover:bg-hover transition-colors duration-200"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8",
                      userButtonPopoverCard: {
                        backgroundColor: "#121317",
                        border: "1px solid #313541",
                        borderRadius: "16px",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                      },
                      userButtonPopoverActionItem: {
                        color: "#D5DBE5",
                      },
                      userButtonPopoverFooter: {
                        display: "none",
                      },
                    },
                  }}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-muted hover:bg-hover transition-colors duration-200"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                <Link
                  href="/register"
                  className="hidden md:inline-flex text-sm font-medium px-3 py-1.5 rounded-lg border border-border text-secondary hover:bg-hover transition-all duration-200"
                >
                  Register
                </Link>
                <Link
                  href="/sign-in"
                  className="hidden md:inline-flex text-sm font-semibold px-4 py-1.5 rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div
          ref={menuRef}
          className={`md:hidden grid transition-[grid-template-rows,opacity] duration-200 ease-out border-t border-border-subtle ${
            mobileMenuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="py-2 pb-4 space-y-1">
            <p className="px-3 py-2 text-xs font-medium text-muted-dark uppercase tracking-wider">
              Navigation
            </p>
            {isSignedIn && currentUser ? (
              isSuperAdmin ? (
                <>
                  <MobileNavLink href="/admin" label="Overview" active={pathname === "/admin"} />
                  <MobileNavLink href="/admin/approvals" label="Approvals" active={pathname === "/admin/approvals"} />
                  <MobileNavLink href="/admin/institutions" label="Institutions" active={pathname === "/admin/institutions"} />
                  <MobileNavLink href="/admin/audit" label="Audit Log" active={pathname === "/admin/audit"} />
                </>
              ) : (
                <MobileNavLink href="/dashboard" label="Dashboard" active={pathname?.startsWith("/dashboard") ?? false} />
              )
            ) : (
              <>
                <MobileNavLink href="/register" label="Register Institution" active={pathname === "/register"} />
                <MobileNavLink href="/sign-in" label="Sign In" active={pathname === "/sign-in"} />
              </>
            )}
          </div>
        </div>
      </div>
      </div>
    </nav>
  );
}

/* ── Desktop Nav Links ── */
function NavLinks({ pathname }: { pathname: string }) {
  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/approvals", label: "Approvals" },
    { href: "/admin/institutions", label: "Institutions" },
    { href: "/admin/audit", label: "Audit Log" },
  ];

  return (
    <div className="flex items-center gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 ${
            pathname === link.href
              ? "bg-gold/10 text-gold"
              : "text-secondary hover:text-primary hover:bg-hover"
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

/* ── Mobile Nav Link ── */
function MobileNavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gold/10 text-gold"
          : "text-secondary hover:bg-hover hover:text-primary"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        active ? "bg-gold" : "bg-transparent"
      }`} />
      {label}
    </Link>
  );
}
