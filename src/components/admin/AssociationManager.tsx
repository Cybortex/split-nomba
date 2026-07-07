"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, UserCheck, ShieldAlert, Users, Trash2, Plus } from "lucide-react";

interface AssociationManagerProps {
  entityId: string;
  institutionId: string;
  role: "DEAN" | "HOD" | "STAFF_ADVISOR";
}

export function AssociationManager({
  entityId,
  institutionId,
  role,
}: AssociationManagerProps) {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // 1. Fetch Association
  const association = useQuery(api.associations.getAssociationByEntityId, {
    entityId,
    institutionId: institutionId as any,
  });

  // 2. Fetch Currently Assigned Advisor details (if exists)
  const currentAdvisor = useQuery(
    api.users.getUserByClerkId,
    association?.staffAdvisorClerkId
      ? { clerkId: association.staffAdvisorClerkId }
      : "skip"
  );

  // 3. Fetch Eligible Advisors / Excos depending on active role
  const eligibleAdvisors = useQuery(
    api.associations.listEligibleStaffAdvisors,
    association ? { associationId: association._id } : "skip"
  );

  const eligibleExcos = useQuery(
    api.associations.listEligibleStudentExcos,
    association ? { associationId: association._id } : "skip"
  );

  // Mutations
  const assignAdvisorMutation = useMutation(api.associations.assignStaffAdvisor);
  const assignExcoMutation = useMutation(api.associations.assignStudentExco);
  const removeExcoMutation = useMutation(api.associations.removeStudentExco);

  if (association === undefined) {
    return (
      <div className="flex items-center justify-center p-6 border border-border bg-surface rounded-2xl">
        <Loader2 className="w-6 h-6 text-gold animate-spin mr-2" />
        <span className="text-sm text-secondary">Loading association settings...</span>
      </div>
    );
  }

  if (!association) {
    return null; // Silent return if no association is configured for this entity
  }

  const handleAssignAdvisor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await assignAdvisorMutation({
        associationId: association._id,
        clerkId: selectedUser,
      });
      setSuccess("Staff Advisor assigned successfully!");
      setSelectedUser("");
    } catch (err: any) {
      setError(err.message || "Failed to assign staff advisor");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignExco = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await assignExcoMutation({
        associationId: association._id,
        clerkId: selectedUser,
      });
      setSuccess("Student Exco assigned successfully!");
      setSelectedUser("");
    } catch (err: any) {
      setError(err.message || "Failed to assign student exco");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExco = async (clerkId: string) => {
    if (!confirm("Are you sure you want to remove this Student Exco?")) return;
    setError(null);
    setSuccess(null);
    try {
      await removeExcoMutation({
        associationId: association._id,
        clerkId,
      });
      setSuccess("Student Exco removed successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to remove student exco");
    }
  };

  return (
    <div className="border border-border bg-surface rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="p-5 border-b border-border-subtle bg-surface-secondary flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-primary">
            {role === "STAFF_ADVISOR" ? "Student Association Executives" : "Staff Advisor Management"}
          </h2>
          <p className="text-[11px] text-muted mt-0.5">
            {role === "STAFF_ADVISOR"
              ? `Manage student executives for the ${association.name}`
              : `Assign a Staff Advisor to oversee the ${association.name}`}
          </p>
        </div>
        <span className="text-[10px] bg-gold/10 border border-gold/20 text-gold px-2 py-0.5 rounded font-mono font-semibold uppercase">
          {association.slug}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-xs">
            ❌ {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-success/10 border border-success/20 text-success text-xs">
            ✅ {success}
          </div>
        )}

        {/* 1. DEAN / HOD VIEW: Staff Advisor Management */}
        {(role === "DEAN" || role === "HOD") && (
          <div className="space-y-4">
            {/* Current Advisor Card */}
            <div className="p-4 rounded-xl border border-border-subtle bg-surface-secondary flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted">Current Staff Advisor</p>
                {currentAdvisor ? (
                  <div>
                    <p className="text-sm font-bold text-primary">{currentAdvisor.name || currentAdvisor.email}</p>
                    <p className="text-xs text-secondary font-mono">{currentAdvisor.email}</p>
                  </div>
                ) : association.staffAdvisorClerkId ? (
                  <p className="text-sm text-secondary font-mono">Loading advisor details...</p>
                ) : (
                  <div className="flex items-center gap-1.5 text-warning text-xs font-medium">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    No Advisor Assigned (Withdrawals will require fallback processing)
                  </div>
                )}
              </div>
            </div>

            {/* Select New Advisor Form */}
            <form onSubmit={handleAssignAdvisor} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                Assign / Replace Staff Advisor
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full text-sm rounded-lg border border-border bg-app px-3 py-2 text-primary focus:outline-none focus:border-gold"
                  disabled={loading}
                >
                  <option value="">-- Select Advisor Staff member --</option>
                  {eligibleAdvisors?.map((staff: any) => (
                    <option key={staff.clerkId} value={staff.clerkId}>
                      {staff.name || staff.email} ({staff.email})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={loading || !selectedUser}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-gold text-black hover:brightness-110 disabled:opacity-50 transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Assign Advisor
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. STAFF ADVISOR VIEW: Student Exco Management */}
        {role === "STAFF_ADVISOR" && (
          <div className="space-y-6">
            {/* List of Excos */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                Currently Assigned Executives
              </label>
              {association.studentExcoClerkIds && association.studentExcoClerkIds.length > 0 ? (
                <div className="space-y-2">
                  {association.studentExcoClerkIds.map((excoClerkId) => (
                    <ExcoRow
                      key={excoClerkId}
                      clerkId={excoClerkId}
                      onRemove={handleRemoveExco}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border text-center text-xs text-muted">
                  No Student Executives assigned yet.
                </div>
              )}
            </div>

            {/* Assign Form */}
            <form onSubmit={handleAssignExco} className="space-y-3 border-t border-border-subtle pt-4">
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
                Assign New Student Executive
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full text-sm rounded-lg border border-border bg-app px-3 py-2 text-primary focus:outline-none focus:border-gold"
                  disabled={loading}
                >
                  <option value="">-- Select Student Exco --</option>
                  {eligibleExcos
                    ?.filter((u) => !association.studentExcoClerkIds.includes(u.clerkId))
                    ?.map((stud: any) => (
                      <option key={stud.clerkId} value={stud.clerkId}>
                        {stud.name || stud.email} ({stud.email})
                      </option>
                    ))}
                </select>
                <button
                  type="submit"
                  disabled={loading || !selectedUser}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-gold text-black hover:brightness-110 disabled:opacity-50 transition-all shrink-0 flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  Add Executive
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Child Helper component to resolve Exco details asynchronously
function ExcoRow({
  clerkId,
  onRemove,
}: {
  clerkId: string;
  onRemove: (id: string) => void;
}) {
  const profile = useQuery(api.users.getUserByClerkId, { clerkId });

  if (profile === undefined) {
    return (
      <div className="p-3 rounded-lg border border-border bg-surface-secondary animate-pulse h-12" />
    );
  }

  if (!profile) return null;

  return (
    <div className="p-3.5 rounded-xl border border-border-subtle bg-surface-secondary flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gold/5 border border-gold/15 text-gold flex items-center justify-center shrink-0">
          <Users className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-primary">{profile.name || profile.email}</p>
          <p className="text-[10px] text-muted font-mono">{profile.email}</p>
        </div>
      </div>
      <button
        onClick={() => onRemove(clerkId)}
        className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
        title="Remove Executive"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
