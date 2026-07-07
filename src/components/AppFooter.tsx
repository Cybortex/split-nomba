"use client";

import { usePathname } from "next/navigation";

export default function AppFooter() {
  const pathname = usePathname();

  // Hide footer on dashboard and admin pages
  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-border-subtle py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-muted">
          Split — Institutional Payment Routing Platform
        </p>
        <p className="text-xs mt-1 text-muted-dark">
          Route Every Payment Where It Belongs.
        </p>
      </div>
    </footer>
  );
}
