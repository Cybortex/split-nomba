"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { WalletCard, TransactionList } from "@/components/WalletCard";

export function StudentAffairsDashboard() {
  const myInst = useQuery(api.auth.getMyInstitution);
  const effectiveInstId = myInst?._id as string | undefined;

  const associations = useQuery(
    api.associations.listAssociations,
    effectiveInstId ? { institutionId: effectiveInstId as any } : "skip"
  );
  const advisors = useQuery(
    api.auth.getUsersByRole,
    effectiveInstId ? { institutionId: effectiveInstId as any, roles: ["STAFF_ADVISOR"] } : "skip"
  );
  const excos = useQuery(
    api.auth.getUsersByRole,
    effectiveInstId ? { institutionId: effectiveInstId as any, roles: ["STUDENT_EXCO"] } : "skip"
  );
  const accessibleWallets = useQuery(api.wallets.getMyAccessibleWallets);

  // Find the SUG wallet from accessible wallets
  const sugWalletData = accessibleWallets?.find(
    (w: any) => w.association?.type === "sug"
  );
  const sugWallet = sugWalletData?.wallet;

  const sugTransactions = useQuery(
    api.wallets.getTransactions,
    sugWallet && effectiveInstId
      ? { walletEntityId: sugWallet.entityId, institutionId: effectiveInstId as any }
      : "skip"
  );

  const createAssociation = useMutation(api.associations.createAssociation);
  const createSUG = useMutation(api.associations.createSUG);
  const assignStaffAdvisor = useMutation(api.associations.assignStaffAdvisor);
  const assignStudentExco = useMutation(api.associations.assignStudentExco);
  const removeStudentExco = useMutation(api.associations.removeStudentExco);

  const [showCreate, setShowCreate] = useState(false);
  const [showCreateSUG, setShowCreateSUG] = useState(false);
  const [creating, setCreating] = useState(false);
  const [creatingSUG, setCreatingSUG] = useState(false);
  const [createError, setCreateError] = useState("");
  const [assocForm, setAssocForm] = useState({
    name: "",
    slug: "",
    type: "department" as "faculty" | "department",
    entityId: "",
  });

  // Assign staff advisor state
  const [assigningAdvisor, setAssigningAdvisor] = useState<string | null>(null);
  const [selectedAdvisorId, setSelectedAdvisorId] = useState("");

  // Manage excos state
  const [managingExcos, setManagingExcos] = useState<string | null>(null);
  const [selectedExcoId, setSelectedExcoId] = useState("");
  const [processingAction, setProcessingAction] = useState<string | null>(null);

  // Build a map of clerkId → user for quick lookups
  const advisorMap = new Map(
    (advisors || []).map((u: any) => [u.clerkId, u])
  );
  const excoMap = new Map(
    (excos || []).map((u: any) => [u.clerkId, u])
  );

  const sugExists = !!sugWallet;

  if (!associations || !advisors || !excos || !accessibleWallets) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const totalAssociations = associations.length;
  const assignedAdvisors = associations.filter((a: any) => a.staffAdvisorClerkId).length;
  const totalExcoSlots = associations.reduce(
    (sum: number, a: any) => sum + a.studentExcoClerkIds.length,
    0
  );

  const handleCreate = async () => {
    if (!assocForm.name || !assocForm.slug || !effectiveInstId) return;
    setCreating(true);
    setCreateError("");
    try {
      await createAssociation({
        institutionId: effectiveInstId as any,
        name: assocForm.name,
        slug: assocForm.slug.toUpperCase(),
        type: assocForm.type,
        entityId: assocForm.entityId || undefined,
      });
      setShowCreate(false);
      setAssocForm({ name: "", slug: "", type: "department", entityId: "" });
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateSUG = async () => {
    if (!effectiveInstId) return;
    setCreatingSUG(true);
    setCreateError("");
    try {
      await createSUG({
        institutionId: effectiveInstId as any,
      });
      setShowCreateSUG(false);
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreatingSUG(false);
    }
  };

  const handleAssignAdvisor = async (associationId: string) => {
    if (!selectedAdvisorId) return;
    setProcessingAction(associationId);
    try {
      await assignStaffAdvisor({
        associationId: associationId as any,
        clerkId: selectedAdvisorId,
      });
      setAssigningAdvisor(null);
      setSelectedAdvisorId("");
    } catch (err: any) {
      console.error(err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleAddExco = async (associationId: string) => {
    if (!selectedExcoId) return;
    setProcessingAction(`add-${associationId}`);
    try {
      await assignStudentExco({
        associationId: associationId as any,
        clerkId: selectedExcoId,
      });
      setSelectedExcoId("");
    } catch (err: any) {
      console.error(err);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRemoveExco = async (associationId: string, clerkId: string) => {
    setProcessingAction(`remove-${associationId}-${clerkId}`);
    try {
      await removeStudentExco({
        associationId: associationId as any,
        clerkId,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setProcessingAction(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Associations Management</h1>
          <p className="text-sm text-muted mt-1">
            Create and manage student associations, assign advisors and executives.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateSUG(!showCreateSUG)}
            className="px-4 py-2 text-sm font-semibold rounded-lg border border-gold text-gold-royal hover:bg-gold/5 transition-all duration-200"
          >
            {showCreateSUG ? "Cancel" : "Create SUG"}
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            {showCreate ? "Cancel" : "Create Association"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">Total Associations</p>
          <p className="text-2xl font-bold text-gold">{totalAssociations}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">With Advisors</p>
          <p className="text-2xl font-bold text-success">
            {assignedAdvisors}
            <span className="text-sm text-muted ml-1">/ {totalAssociations}</span>
          </p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">Total Exco Members</p>
          <p className="text-2xl font-bold text-info">{totalExcoSlots}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-surface">
          <p className="text-xs text-muted mb-1">Available Advisors</p>
          <p className="text-2xl font-bold text-pending">
            {advisors.length}
          </p>
        </div>
      </div>

      {/* SUG Wallet Section */}
      {sugWallet ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">SUG Treasury</h2>
          <WalletCard wallet={sugWallet} access="view" subtitle="Student Union Government" />
          <TransactionList
            transactions={sugTransactions || []}
            title="SUG Wallet Transactions"
            emptyMessage="No transactions for the SUG wallet yet."
          />
        </div>
      ) : (
        <div className="p-6 rounded-xl border border-border bg-surface">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">🎓</span>
              <div>
                <p className="font-semibold text-primary">SUG Wallet</p>
                <p className="text-xs text-muted">
                  {showCreateSUG
                    ? "Create the SUG association to enable the treasury."
                    : "No SUG association created yet. Click 'Create SUG' above to get started."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create SUG Form */}
      {showCreateSUG && (
        <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
          <h2 className="font-semibold text-primary">Create SUG Association</h2>
          {createError && (
            <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">
              {createError}
            </div>
          )}
          <p className="text-sm text-muted">
            Creates the Student Union Government association for this institution.
            Only one SUG can exist per institution.
          </p>
          <button
            onClick={handleCreateSUG}
            disabled={creatingSUG}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
          >
            {creatingSUG ? "Creating..." : "Create SUG"}
          </button>
        </div>
      )}

      {/* Create Association Form */}
      {showCreate && (
        <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
          <h2 className="font-semibold text-primary">New Association</h2>
          {createError && (
            <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">
              {createError}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">
                Association Name
              </label>
              <input
                type="text"
                placeholder="e.g., Computer Science Association"
                value={assocForm.name}
                onChange={(e) =>
                  setAssocForm({ ...assocForm, name: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">
                Slug (unique identifier)
              </label>
              <input
                type="text"
                placeholder="e.g., COMP-SCI"
                value={assocForm.slug}
                onChange={(e) =>
                  setAssocForm({ ...assocForm, slug: e.target.value.toUpperCase() })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold"
              />
              <p className="text-xs text-muted mt-1">
                Unique slug used for payment routing. E.g., &quot;SCIENCE&quot; for Faculty of Science.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">
                Type
              </label>
              <select
                value={assocForm.type}
                onChange={(e) =>
                  setAssocForm({ ...assocForm, type: e.target.value as any })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold"
              >
                <option value="department">Department-level</option>
                <option value="faculty">Faculty-level</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating || !assocForm.name || !assocForm.slug}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
          >
            {creating ? "Creating..." : "Create Association"}
          </button>
        </div>
      )}

      {/* Associations List */}
      {associations.length > 0 ? (
        <div className="space-y-3">
          {associations.map((assoc: any) => {
            const advisor = advisorMap.get(assoc.staffAdvisorClerkId);
            return (
              <div
                key={assoc._id}
                className="p-5 rounded-xl border border-border bg-surface hover:border-gold-royal transition-all duration-200"
              >
                {/* Association Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-primary truncate">
                        {assoc.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gold/10 text-gold-royal flex-shrink-0">
                        {assoc.type}
                      </span>
                      {!assoc.isActive && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-error/10 text-error flex-shrink-0">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted mt-1">
                      Entity: <span className="font-mono">{assoc.entityId}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {/* Assign Advisor Button */}
                    {assigningAdvisor === assoc._id ? (
                      <button
                        onClick={() => {
                          setAssigningAdvisor(null);
                          setSelectedAdvisorId("");
                        }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-hover transition-colors"
                      >
                        Cancel
                      </button>
                    ) : (
                      <button
                        onClick={() => setAssigningAdvisor(assoc._id)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-hover transition-colors"
                      >
                        {assoc.staffAdvisorClerkId ? "Reassign Advisor" : "Assign Advisor"}
                      </button>
                    )}
                    {/* Manage Excos Button */}
                    <button
                      onClick={() =>
                        setManagingExcos(
                          managingExcos === assoc._id ? null : assoc._id
                        )
                      }
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        managingExcos === assoc._id
                          ? "bg-gold text-black border-gold"
                          : "border-border text-secondary hover:bg-hover"
                      }`}
                    >
                      {managingExcos === assoc._id ? "Done" : `Excos (${assoc.studentExcoClerkIds.length})`}
                    </button>
                  </div>
                </div>

                {/* Current Staff Advisor */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-muted font-medium">Staff Advisor:</span>
                  {assoc.staffAdvisorClerkId ? (
                    advisor ? (
                      <span className="text-xs font-medium text-primary bg-surface-secondary px-2 py-0.5 rounded">
                        {advisor.email}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-dark bg-surface-secondary px-2 py-0.5 rounded">
                        Unknown ({assoc.staffAdvisorClerkId.substring(0, 12)}...)
                      </span>
                    )
                  ) : (
                    <span className="text-xs text-muted-dark italic">Not assigned</span>
                  )}
                </div>

                {/* Assign Advisor Dropdown */}
                {assigningAdvisor === assoc._id && (
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border mb-3 space-y-3">
                    <p className="text-sm font-medium text-primary">Select Staff Advisor</p>
                    <div className="flex gap-3">
                      <select
                        value={selectedAdvisorId}
                        onChange={(e) => setSelectedAdvisorId(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-primary text-sm outline-none focus:border-gold"
                      >
                        <option value="">Choose an advisor...</option>
                        {advisors.map((u: any) => (
                          <option key={u.clerkId} value={u.clerkId}>
                            {u.email}
                          </option>
                        ))}
                        {advisors.length === 0 && (
                          <option value="" disabled>
                            No Staff Advisor users available
                          </option>
                        )}
                      </select>
                      <button
                        onClick={() => handleAssignAdvisor(assoc._id)}
                        disabled={
                          !selectedAdvisorId || processingAction === assoc._id
                        }
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                      >
                        {processingAction === assoc._id ? "..." : "Assign"}
                      </button>
                    </div>
                    {advisors.length === 0 && (
                      <p className="text-xs text-muted">
                        No STAFF_ADVISOR users found in your institution. Create them first in User Management.
                      </p>
                    )}
                  </div>
                )}

                {/* Current Exco Members */}
                {assoc.studentExcoClerkIds.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted font-medium">Exco Members:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {assoc.studentExcoClerkIds.map((clerkId: string) => {
                        const exco = excoMap.get(clerkId);
                        return (
                          <span
                            key={clerkId}
                            className="text-xs font-medium bg-info/10 text-info px-2 py-0.5 rounded"
                          >
                            {exco ? exco.email : `${clerkId.substring(0, 12)}...`}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Manage Excos Panel */}
                {managingExcos === assoc._id && (
                  <div className="p-4 rounded-xl bg-surface-secondary border border-border space-y-4">
                    <p className="text-sm font-medium text-primary">
                      Manage Executive Members
                    </p>

                    {/* Current Exco List */}
                    {assoc.studentExcoClerkIds.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted">Current Members</p>
                        {assoc.studentExcoClerkIds.map((clerkId: string) => {
                          const exco = excoMap.get(clerkId);
                          return (
                            <div
                              key={clerkId}
                              className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface border border-border-subtle"
                            >
                              <span className="text-sm text-primary">
                                {exco ? exco.email : `${clerkId.substring(0, 16)}...`}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveExco(assoc._id, clerkId)
                                }
                                disabled={
                                  processingAction ===
                                  `remove-${assoc._id}-${clerkId}`
                                }
                                className="px-3 py-1 text-xs font-medium rounded-lg border border-error/30 text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                              >
                                {processingAction ===
                                `remove-${assoc._id}-${clerkId}`
                                  ? "..."
                                  : "Remove"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Add Exco */}
                    <div className="space-y-2">
                      <p className="text-xs text-muted">Add Member</p>
                      <div className="flex gap-3">
                        <select
                          value={selectedExcoId}
                          onChange={(e) => setSelectedExcoId(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-border bg-surface text-primary text-sm outline-none focus:border-gold"
                        >
                          <option value="">Choose an executive...</option>
                          {excos
                            .filter(
                              (u: any) =>
                                !assoc.studentExcoClerkIds.includes(u.clerkId)
                            )
                            .map((u: any) => (
                              <option key={u.clerkId} value={u.clerkId}>
                                {u.email}
                              </option>
                            ))}
                          {excos.filter(
                            (u: any) =>
                              !assoc.studentExcoClerkIds.includes(u.clerkId)
                          ).length === 0 && (
                            <option value="" disabled>
                              {excos.length === 0
                                ? "No STUDENT_EXCO users available"
                                : "All excos are already assigned"}
                            </option>
                          )}
                        </select>
                        <button
                          onClick={() => handleAddExco(assoc._id)}
                          disabled={
                            !selectedExcoId ||
                            processingAction === `add-${assoc._id}`
                          }
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200 disabled:opacity-50"
                        >
                          {processingAction === `add-${assoc._id}`
                            ? "..."
                            : "Add"}
                        </button>
                      </div>
                      {excos.length === 0 && (
                        <p className="text-xs text-muted">
                          No STUDENT_EXCO users in your institution. Create them first.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer: created date */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
                  <span className="text-xs text-muted-dark">
                    Created {new Date(assoc.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-muted-dark">·</span>
                  <span className="text-xs text-muted-dark font-mono">
                    ID: {assoc._id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-border bg-surface text-center">
          <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-muted font-medium">No associations created yet.</p>
          <p className="text-xs text-muted-dark mt-1">
            Click &quot;Create Association&quot; above to get started.
          </p>
        </div>
      )}
    </div>
  );
}
