"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { syncSuperAdminRole } from "@/lib/clerk-sync";
import { Suspense } from "react";
import Image from "next/image";
import {
  LayoutDashboard, CheckCircle, Building2, ScrollText,
  Menu, X,
} from "lucide-react";
import Link from "next/link";

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/admin/approvals", label: "Approvals", icon: <CheckCircle className="w-4 h-4" /> },
  { href: "/admin/institutions", label: "Institutions", icon: <Building2 className="w-4 h-4" /> },
  { href: "/admin/audit", label: "Audit Log", icon: <ScrollText className="w-4 h-4" /> },
];

function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const currentUser = useQuery(api.auth.getCurrentUser);

  return (
    <div className="flex flex-col flex-shrink-0 h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Split Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-primary truncate">
              Admin Panel
            </h1>
            <p className="text-[11px] text-muted">Super Admin</p>
          </div>
        </Link>
      </div>

      {/* Super Admin Info */}
      {currentUser && (
        <div className="px-3 py-3 border-b border-border-subtle">
          <div className="px-3 py-2 rounded-xl bg-surface-secondary border border-border-subtle text-sm font-medium text-primary truncate">
            {currentUser.name || currentUser.email || "Super Admin"}
          </div>
        </div>
      )}

      {/* Sidebar Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="text-[11px] text-muted-dark font-medium px-2 pb-2 uppercase tracking-wider">
          Menu
        </p>
        {ADMIN_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gold text-black shadow-button"
                  : "text-secondary hover:bg-hover hover:text-primary"
              }`}
            >
              <span className={`flex-shrink-0 ${isActive ? "text-black" : "text-muted"}`}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-border-subtle">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-muted">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span>Connected</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!timerRef.current && isSignedIn && currentUser === undefined) {
      timerRef.current = setTimeout(() => setGracePeriodExpired(true), 5000);
    }

    if (currentUser !== undefined && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSignedIn, currentUser]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (currentUser === undefined) return;

    if (currentUser === null) {
      if (gracePeriodExpired) {
        router.push("/dashboard");
      }
      return;
    }

    const isSuper = currentUser.roles?.includes("SUPER_ADMIN");

    if (!isSuper) {
      router.push("/dashboard");
    } else {
      const alreadySynced = clerkUser?.publicMetadata?.isSuperAdmin === true;
      if (!alreadySynced && currentUser.clerkId) {
        syncSuperAdminRole(currentUser.clerkId, true).catch(console.error);
      }
    }
  }, [currentUser, clerkUser, gracePeriodExpired, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <p className="text-xs text-muted animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  const stillLoading =
    currentUser === undefined || (currentUser === null && !gracePeriodExpired);

  if (stillLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <p className="text-xs text-muted animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (currentUser === null || !currentUser.roles?.includes("SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-8 h-8 rounded-full" />
          <p className="text-xs text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-app">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-200 ease-out ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar — fixed (stationary) */}
      <aside
        className={`
          fixed top-16 z-50 h-[calc(100vh-4rem)]
          w-[260px] border-r border-border bg-surface-secondary
          transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Suspense fallback={<div className="p-4"><div className="skeleton h-10 w-full rounded-xl" /></div>}>
          <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
        </Suspense>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto md:ml-[260px]">
        {/* Mobile header bar — fixed below navbar */}
        <div className="fixed top-16 z-30 md:hidden border-b border-border bg-app/90 backdrop-blur-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-muted hover:bg-hover transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-sm font-medium text-primary">Admin</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
