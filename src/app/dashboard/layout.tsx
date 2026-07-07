"use client";

import { useEffect, useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { syncSuperAdminRole } from "@/lib/clerk-sync";

const ROLE_NAV_ITEMS: Record<string, { key: string; label: string; icon: string }[]> = {
  INSTITUTION_ADMIN: [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "users", label: "Users", icon: "👥" },
    { key: "students", label: "Students", icon: "🎓" },
    { key: "staff", label: "Staff", icon: "👔" },
    { key: "sessions", label: "Sessions", icon: "📅" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ],
  FINANCE: [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "fees", label: "Fees & Rules", icon: "💰" },
  ],
  STUDENT_AFFAIRS: [
    { key: "overview", label: "Overview (SUG)", icon: "🏛️" },
    { key: "associations", label: "Associations", icon: "🤝" },
    { key: "advisors", label: "Staff Advisors", icon: "👨‍🏫" },
    { key: "excos", label: "Student Excos", icon: "🎓" },
  ],
  DEAN: [
    { key: "overview", label: "Faculty Wallet", icon: "🏛️" },
  ],
  HOD: [
    { key: "overview", label: "Dept Wallet", icon: "🏛️" },
  ],
  STAFF_ADVISOR: [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "withdrawals", label: "Withdrawals", icon: "💸" },
  ],
  STUDENT_EXCO: [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "withdrawals", label: "Withdrawals", icon: "💸" },
  ],
  STAFF: [
    { key: "overview", label: "Overview", icon: "📊" },
  ],
  STUDENT: [
    { key: "overview", label: "Overview", icon: "📊" },
    { key: "pay", label: "Pay Dues", icon: "💳" },
    { key: "history", label: "Payment History", icon: "📜" },
  ],
};

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  INSTITUTION_ADMIN: "Institution Admin",
  FINANCE: "Finance",
  STUDENT_AFFAIRS: "Student Affairs",
  DEAN: "Dean",
  HOD: "HOD",
  STAFF: "Staff",
  STAFF_ADVISOR: "Staff Advisor",
  STUDENT_EXCO: "Student Exco",
  STUDENT: "Student",
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const activeRole = useQuery(api.auth.getMyActiveRole);
  const switchRole = useMutation(api.auth.switchActiveRole);
  const myInstitution = useQuery(api.auth.getMyInstitution);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const activeTab = searchParams.get("tab") || "overview";

  if (!currentUser || !activeRole) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="skeleton h-10 w-full rounded-lg" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="space-y-2 mt-4">
          <div className="skeleton h-10 w-full rounded-md" />
          <div className="skeleton h-10 w-full rounded-md" />
          <div className="skeleton h-10 w-full rounded-md" />
        </div>
      </div>
    );
  }

  const items = ROLE_NAV_ITEMS[activeRole] || [];

  const handleTabClick = (key: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", key);
    router.push(`${pathname}?${params.toString()}`);
    onNavigate?.();
  };

  const handleRoleSwitch = async (role: string) => {
    try {
      await switchRole({ role });
      setDropdownOpen(false);
      // Redirect to overview tab on switch to avoid missing tabs
      router.push(`${pathname}?tab=overview`);
      onNavigate?.();
    } catch (err) {
      console.error("Failed to switch role:", err);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0 h-full">
      {/* Brand & Institution Info */}
      <div className="p-6 border-b border-border flex flex-col gap-1">
        <h1 className="text-lg font-bold text-primary truncate">
          {myInstitution?.name || "Institution"}
        </h1>
        <p className="text-xs text-muted">Dashboard Portal</p>
      </div>

      {/* Role Selector dropdown */}
      <div className="p-4 border-b border-border relative">
        <div className="text-xs text-muted-dark font-medium mb-1.5 px-2">Active Role</div>
        {currentUser.roles.length > 1 ? (
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface-secondary border border-border text-sm font-semibold text-primary hover:border-gold-royal transition-all duration-200"
            >
              <span className="truncate">{ROLE_LABELS[activeRole] || activeRole}</span>
              <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute left-4 right-4 mt-1 bg-surface-secondary border border-border rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl animate-in fade-in duration-200">
                <div className="py-1">
                  {currentUser.roles.map((role: string) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                        activeRole === role
                          ? "bg-gold/10 text-gold font-semibold"
                          : "text-secondary hover:bg-hover hover:text-primary"
                      }`}
                    >
                      {ROLE_LABELS[role] || role}
                      {activeRole === role && <span className="text-gold text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-surface-secondary border border-border-subtle text-sm font-semibold text-primary truncate">
            {ROLE_LABELS[activeRole] || activeRole}
          </div>
        )}
      </div>

      {/* Sidebar Nav */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleTabClick(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gold text-black border-gold shadow-lg shadow-gold/10"
                  : "text-secondary hover:bg-hover hover:text-primary"
              }`}
            >
              <span className={`text-base ${isActive ? "text-black" : "text-muted"}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (currentUser) {
      const isSuper = currentUser.roles.includes("SUPER_ADMIN");
      
      if (isSuper) {
        // Auto-heal Clerk metadata to true and redirect
        if (clerkUser && clerkUser.publicMetadata?.isSuperAdmin !== true) {
          syncSuperAdminRole(currentUser.clerkId, true).catch(console.error);
        }
        router.push("/admin");
      } else {
        // Auto-heal Clerk metadata to false if they hit dashboard
        if (clerkUser && clerkUser.publicMetadata?.isSuperAdmin !== false) {
          syncSuperAdminRole(currentUser.clerkId, false).catch(console.error);
        }
      }
    }
  }, [currentUser, clerkUser, router]);

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (currentUser === null || currentUser.roles.includes("SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <p className="text-muted">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-app">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - desktop: static sidebar, mobile: slide-over drawer */}
      <div
        className={`
          fixed md:sticky top-16 md:top-16 z-50 h-[calc(100vh-4rem)]
          w-64 border-r border-border bg-surface/40 backdrop-blur-lg
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Suspense fallback={<div className="p-4"><div className="skeleton h-10 w-full" /></div>}>
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </Suspense>
      </div>

      {/* Main dashboard content area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {/* Mobile header bar with sidebar toggle */}
        <div className="sticky top-16 z-30 md:hidden border-b border-border-subtle bg-app/95 backdrop-blur-lg px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-muted hover:bg-hover transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-primary">Dashboard Menu</span>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
