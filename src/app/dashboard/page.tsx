"use client";

import { Suspense, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock } from "lucide-react";
import { 
  FinanceDashboard, 
  DeanDashboard, 
  StudentDashboard,
  StaffDashboard,
  HODDashboard,
  StaffAdvisorDashboard,
  StudentExcoDashboard,
  StudentAffairsDashboard,
  InstitutionAdminDashboard,
} from "@/components/dashboards";

function DashboardContent() {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const activeRole = useQuery(api.auth.getMyActiveRole);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-2xl border border-border bg-surface text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold/10">
          <Lock className="w-8 h-8 text-gold" />
        </div>
        <h2 className="text-xl font-semibold mb-2 text-primary">Sign In Required</h2>
        <p className="text-sm mb-6 text-muted">Sign in to access your role-based dashboard.</p>
        <Link
          href="/sign-in"
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
        >
          Sign In
        </Link>
      </div>
    );
  }

  useEffect(() => {
    if (currentUser?.roles.includes("SUPER_ADMIN")) {
      router.push("/admin");
    }
  }, [currentUser, router]);

  if (!currentUser || !activeRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const activeTab = searchParams.get("tab") || "overview";

  return (
    <div className="space-y-6">
      {activeRole === "INSTITUTION_ADMIN" && <InstitutionAdminDashboard activeTab={activeTab} />}
      {activeRole === "FINANCE" && <FinanceDashboard activeTab={activeTab} />}
      {activeRole === "STUDENT_AFFAIRS" && <StudentAffairsDashboard activeTab={activeTab} />}
      {activeRole === "DEAN" && <DeanDashboard activeTab={activeTab} />}
      {activeRole === "HOD" && <HODDashboard activeTab={activeTab} />}
      {activeRole === "STAFF" && <StaffDashboard activeTab={activeTab} />}
      {activeRole === "STAFF_ADVISOR" && <StaffAdvisorDashboard activeTab={activeTab} />}
      {activeRole === "STUDENT_EXCO" && <StudentExcoDashboard activeTab={activeTab} />}
      {activeRole === "STUDENT" && <StudentDashboard activeTab={activeTab} />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)]">
      <div className="max-w-7xl mx-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 bg-app">
            <div className="skeleton w-8 h-8 rounded-full" />
          </div>
        }>
          <DashboardContent />
        </Suspense>
      </div>
    </div>
  );
}
