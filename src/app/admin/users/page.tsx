"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

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

const ALL_ROLES = [
  "FINANCE",
  "STUDENT_AFFAIRS",
  "DEAN",
  "HOD",
  "STAFF",
  "STAFF_ADVISOR",
  "STUDENT_EXCO",
  "STUDENT",
] as const;

export default function AdminUsersPage() {
  const currentUser = useQuery(api.auth.getCurrentUser);
  const myInst = useQuery(api.auth.getMyInstitution);
  const users = useQuery(
    api.auth.listInstitutionUsers,
    myInst?._id ? { institutionId: myInst._id as any } : "skip"
  );

  // Mutations
  const addRole = useMutation(api.auth.addUserRole);
  const removeRole = useMutation(api.auth.removeUserRole);
  const deactivate = useMutation(api.auth.deactivateUser);

  // UI state
  const [processing, setProcessing] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAddRole = async (userId: string, role: string) => {
    setProcessing(`add-${userId}-${role}`);
    try {
      await addRole({ userId: userId as any, role });
      showMessage("success", `Added ${ROLE_LABELS[role] || role} role`);
    } catch (err: any) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    setProcessing(`remove-${userId}-${role}`);
    try {
      await removeRole({ userId: userId as any, role });
      showMessage("success", `Removed ${ROLE_LABELS[role] || role} role`);
    } catch (err: any) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    if (!confirm("Deactivate this user? They will not be able to log in.")) return;
    setProcessing(`deactivate-${userId}`);
    try {
      await deactivate({ userId: userId as any });
      showMessage("success", "User deactivated");
    } catch (err: any) {
      showMessage("error", err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (!currentUser || !myInst) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  const isSuperAdmin = currentUser.roles.includes("SUPER_ADMIN");
  const isInstAdmin = currentUser.roles.includes("INSTITUTION_ADMIN");
  const canManage = isSuperAdmin || isInstAdmin;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">User Management</h1>
          <p className="text-sm text-muted mt-1">
            {myInst?.name || "Your Institution"} — {users?.length ?? 0} users
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm border ${
          message.type === "success"
            ? "bg-success/10 text-success border-success/20"
            : "bg-error/10 text-error border-error/20"
        }`}>
          {message.text}
        </div>
      )}

      {!users ? (
        <div className="flex items-center justify-center h-32">
          <div className="skeleton w-8 h-8 rounded-full" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-12 rounded-2xl border border-border bg-surface text-center">
          <p className="text-muted">No users found in this institution.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user: any) => (
            <div
              key={user._id}
              className="p-5 rounded-2xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal"
            >
              {/* User Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-gold">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-primary">{user.email}</p>
                      <p className="text-xs text-muted font-mono">
                        Clerk: {user.clerkId.substring(0, 12)}...
                      </p>
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {user.roles.map((role: string) => (
                      <span
                        key={role}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium ${
                          !user.isActive
                            ? "bg-surface-secondary text-muted"
                            : role === "SUPER_ADMIN" || role === "INSTITUTION_ADMIN"
                            ? "bg-gold/10 text-gold"
                            : "bg-surface-secondary text-secondary"
                        }`}
                      >
                        {ROLE_LABELS[role] || role}
                        {canManage && role !== "SUPER_ADMIN" && role !== "INSTITUTION_ADMIN" && role !== "STUDENT" && user.roles.length > 1 && (
                          <button
                            onClick={() => handleRemoveRole(user._id, role)}
                            disabled={processing === `remove-${user._id}-${role}`}
                            className="ml-1 hover:text-error transition-colors duration-200"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                    {!user.isActive && (
                      <span className="px-2.5 py-1 rounded text-xs font-medium bg-error/10 text-error">
                        Deactivated
                      </span>
                    )}
                    {user.isActive && (
                      <span className="px-2 py-0.5 rounded text-xs bg-success/10 text-success">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canManage && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setExpandedUser(expandedUser === user._id ? null : user._id)}
                      className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-hover transition-all duration-200"
                    >
                      {expandedUser === user._id ? "Close" : "Manage"}
                    </button>
                    {user.isActive && (
                      <button
                        onClick={() => handleDeactivate(user._id)}
                        disabled={processing === `deactivate-${user._id}`}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-error hover:bg-error/10 transition-all duration-200 disabled:opacity-50"
                      >
                        {processing === `deactivate-${user._id}` ? "..." : "Deactivate"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded: Add Role */}
              {expandedUser === user._id && canManage && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <p className="text-xs font-medium text-muted mb-2">Add Role</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_ROLES.filter(
                      (role) =>
                        !user.roles.includes(role) &&
                        (isSuperAdmin || !role.includes("ADMIN"))
                    ).map((role) => (
                      <button
                        key={role}
                        onClick={() => handleAddRole(user._id, role)}
                        disabled={processing === `add-${user._id}-${role}`}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-border text-secondary bg-surface-secondary hover:bg-hover transition-all duration-200 disabled:opacity-50"
                      >
                        + {ROLE_LABELS[role] || role}
                      </button>
                    ))}
                    {ALL_ROLES.filter(
                      (role) =>
                        !user.roles.includes(role) &&
                        (isSuperAdmin || !role.includes("ADMIN"))
                    ).length === 0 && (
                      <p className="text-xs text-muted">User has all assignable roles.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
