"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Navbar() {
  const { isSignedIn } = useAuth();

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
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-secondary hover:text-primary transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link
                  href="/pay"
                  className="text-sm font-medium text-secondary hover:text-primary transition-colors duration-200"
                >
                  Pay Dues
                </Link>
                <Link
                  href="/withdrawals"
                  className="text-sm font-medium text-secondary hover:text-primary transition-colors duration-200"
                >
                  Withdrawals
                </Link>
              </div>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <div className="hidden md:flex items-center gap-2">
                  <Link
                    href="/admin/institutions"
                    className="text-xs px-3 py-1.5 rounded-md text-muted bg-surface-secondary hover:bg-hover hover:text-secondary transition-all duration-200"
                  >
                    Institutions
                  </Link>
                  <Link
                    href="/admin/users"
                    className="text-xs px-3 py-1.5 rounded-md text-muted bg-surface-secondary hover:bg-hover hover:text-secondary transition-all duration-200"
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/audit"
                    className="text-xs px-3 py-1.5 rounded-md text-muted bg-surface-secondary hover:bg-hover hover:text-secondary transition-all duration-200"
                  >
                    Audit
                  </Link>
                </div>
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
                <Link
                  href="/register"
                  className="text-sm font-medium px-4 py-2 rounded-lg border border-border text-secondary hover:bg-hover transition-colors duration-200"
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
      </div>
    </nav>
  );
}
