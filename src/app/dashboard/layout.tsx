"use client";

import { useEffect, useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { syncSuperAdminRole } from "@/lib/clerk-sync";
import Image from "next/image";
import { 
  BarChart3, Users, GraduationCap, Calendar, Settings, Coins, 
  Landmark, Banknote, CreditCard, ScrollText, Handshake, Briefcase, 
  ChevronDown, Menu, X, LayoutDashboard, UserCog
} from "lucide-react";

const ROLE_NAV_ITEMS: Record<string, { key: string; label: string; icon: React.ReactNode }[]> = {
  INSTITUTION_ADMIN: [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "users", label: "Users", icon: <Users className="w-4 h-4" /> },
    { key: "students", label: "Students", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "staff", label: "Staff", icon: <Briefcase className="w-4 h-4" /> },
    { key: "sessions", label: "Sessions", icon: <Calendar className="w-4 h-4" /> },
    { key: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ],
  FINANCE: [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "fees", label: "Fees & Rules", icon: <Coins className="w-4 h-4" /> },
  ],
  STUDENT_AFFAIRS: [
    { key: "overview", label: "Overview (SUG)", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "associations", label: "Associations", icon: <Handshake className="w-4 h-4" /> },
    { key: "advisors", label: "Staff Advisors", icon: <GraduationCap className="w-4 h-4" /> },
    { key: "excos", label: "Student Excos", icon: <UserCog className="w-4 h-4" /> },
  ],
  DEAN: [
    { key: "overview", label: "Faculty Wallet", icon: <Landmark className="w-4 h-4" /> },
  ],
  HOD: [
    { key: "overview", label: "Dept Wallet", icon: <Landmark className="w-4 h-4" /> },
  ],
  STAFF_ADVISOR: [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "withdrawals", label: "Withdrawals", icon: <Banknote className="w-4 h-4" /> },
  ],
  STUDENT_EXCO: [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "withdrawals", label: "Withdrawals", icon: <Banknote className="w-4 h-4" /> },
  ],
  STAFF: [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
  ],
  STUDENT: [
    { key: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: "pay", label: "Pay Dues", icon: <CreditCard className="w-4 h-4" /> },
    { key: "history", label: "Payment History", icon: <ScrollText className="w-4 h-4" /> },
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
        <div className="skeleton h-10 w-full rounded-xl" />
        <div className="skeleton h-6 w-3/4 rounded" />
        <div className="space-y-2 mt-4">
          <div className="skeleton h-10 w-full rounded-xl" />
          <div className="skeleton h-10 w-full rounded-xl" />
          <div className="skeleton h-10 w-full rounded-xl" />
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
      router.push(`${pathname}?tab=overview`);
      onNavigate?.();
    } catch (err) {
      console.error("Failed to switch role:", err);
    }
  };

  return (
    <div className="flex flex-col flex-shrink-0 h-full">
      {/* Brand & Institution Info */}
      <div className="px-5 py-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Split Logo"
            width={32}
            height={32}
            className="w-8 h-8 object-contain flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-primary truncate">
              {myInstitution?.name || "Institution"}
            </h1>
            <p className="text-[11px] text-muted">Dashboard Portal</p>
          </div>
        </div>
      </div>

      {/* Role Selector */}
      <div className="px-3 py-3 border-b border-border-subtle relative">
        <p className="text-[11px] text-muted-dark font-medium mb-1.5 px-2 uppercase tracking-wider">
          Active Role
        </p>
        {currentUser.roles.length > 1 ? (
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface-secondary border border-border text-sm font-medium text-primary hover:border-gold-royal transition-all duration-200"
            >
              <span className="truncate">{ROLE_LABELS[activeRole] || activeRole}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute left-3 right-3 mt-1 bg-surface-secondary border border-border rounded-xl shadow-dropdown z-50 overflow-hidden animate-fade-in-fast">
                <div className="py-1">
                  {currentUser.roles.map((role: string) => (
                    <button
                      key={role}
                      onClick={() => handleRoleSwitch(role)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between ${
                        activeRole === role
                          ? "bg-gold/10 text-gold font-medium"
                          : "text-secondary hover:bg-hover hover:text-primary"
                      }`}
                    >
                      {ROLE_LABELS[role] || role}
                      {activeRole === role && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="px-3 py-2 rounded-xl bg-surface-secondary border border-border-subtle text-sm font-medium text-primary truncate">
            {ROLE_LABELS[activeRole] || activeRole}
          </div>
        )}
      </div>

      {/* Sidebar Nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className="text-[11px] text-muted-dark font-medium px-2 pb-2 uppercase tracking-wider">
          Menu
        </p>
        {items.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleTabClick(item.key)}
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
            </button>
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const router = useRouter();
  const pathname = usePathname();
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
        if (clerkUser && clerkUser.publicMetadata?.isSuperAdmin !== true) {
          syncSuperAdminRole(currentUser.clerkId, true).catch(console.error);
        }
        router.push("/admin");
      } else {
        if (clerkUser && clerkUser.publicMetadata?.isSuperAdmin !== false) {
          syncSuperAdminRole(currentUser.clerkId, false).catch(console.error);
        }
      }
    }
  }, [currentUser, clerkUser, router]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <p className="text-xs text-muted animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (currentUser === null || currentUser.roles.includes("SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-8 h-8 rounded-full" />
          <p className="text-sm text-muted">Redirecting...</p>
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
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </Suspense>
      </aside>

      {/* Main content — left margin on desktop to account for fixed sidebar */}
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
            <span className="text-sm font-medium text-primary">Dashboard</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
