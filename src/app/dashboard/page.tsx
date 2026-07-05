"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
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

function RoleSwitcher({ roles, activeRole, onSwitch }: {
  roles: string[];
  activeRole: string;
  onSwitch: (role: string) => void;
}) {
  const roleLabels: Record<string, string> = {
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

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {roles.map((role) => (
        <button
          key={role}
          onClick={() => onSwitch(role)}
          className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
            activeRole === role
              ? "bg-gold text-black border-gold"
              : "bg-transparent text-secondary border-border hover:bg-hover"
          }`}
        >
          {roleLabels[role] || role}
        </button>
      ))}
    </div>
  );
}

function DashboardContent() {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const activeRole = useQuery(api.auth.getMyActiveRole);
  const switchRole = useMutation(api.auth.switchActiveRole);
  const myInstitution = useQuery(api.auth.getMyInstitution);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-2xl border border-border bg-surface text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-gold/10">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
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

  if (!currentUser || !activeRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const currentRole = selectedRole || activeRole;

  const handleRoleSwitch = async (role: string) => {
    try {
      await switchRole({ role });
      setSelectedRole(role);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">
          {myInstitution?.name || "Dashboard"}
        </h1>
        <p className="text-sm mt-1 text-muted">
          Signed in as{" "}
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-gold-soft text-gold">
            {currentRole}
          </span>
        </p>
      </div>

      {/* Role Switcher */}
      {currentUser.roles.length > 1 && (
        <RoleSwitcher
          roles={currentUser.roles}
          activeRole={currentRole}
          onSwitch={handleRoleSwitch}
        />
      )}

      {/* Role-based Dashboard — all dashboards self-resolve their scoping */}
      {currentRole === "INSTITUTION_ADMIN" && <InstitutionAdminDashboard />}
      {currentRole === "FINANCE" && <FinanceDashboard />}
      {currentRole === "STUDENT_AFFAIRS" && <StudentAffairsDashboard />}
      {currentRole === "DEAN" && <DeanDashboard />}
      {currentRole === "HOD" && <HODDashboard />}
      {currentRole === "STAFF" && <StaffDashboard />}
      {currentRole === "STAFF_ADVISOR" && <StaffAdvisorDashboard />}
      {currentRole === "STUDENT_EXCO" && <StudentExcoDashboard />}
      {currentRole === "STUDENT" && <StudentDashboard />}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <DashboardContent />
      </div>
    </div>
  );
}
