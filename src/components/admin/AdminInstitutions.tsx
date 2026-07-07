"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Search, X } from "lucide-react";

export function AdminInstitutions() {
  const institutions = useQuery(api.admin.getInstitutionSummaries);
  const createInstitution = useMutation(api.auth.createInstitutionDirect);

  const [selectedInst, setSelectedInst] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    name: "",
    adminClerkId: "",
    adminEmail: "",
  });

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreate = async () => {
    if (!form.name || !form.adminClerkId || !form.adminEmail) return;
    setCreating(true);
    setMessage(null);
    try {
      const result = await createInstitution({
        name: form.name,
        adminClerkId: form.adminClerkId,
        adminEmail: form.adminEmail,
      });
      showMessage("success", `Institution "${result.name}" created with admin ${result.adminEmail}!`);
      setShowCreateModal(false);
      setForm({ name: "", adminClerkId: "", adminEmail: "" });
    } catch (err: any) {
      showMessage("error", err.message || "Failed to create institution");
    } finally {
      setCreating(false);
    }
  };

  if (!institutions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-12 h-12 rounded-xl" />
      </div>
    );
  }

  const filtered = search
    ? institutions.filter((inst: any) =>
        inst.name.toLowerCase().includes(search.toLowerCase())
      )
    : institutions;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Institutions</h1>
          <p className="text-sm mt-1 text-muted">
            {institutions.length} institution{institutions.length !== 1 ? "s" : ""} · Sorted by payment volume
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-sm text-primary outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200 flex-shrink-0 shadow-button"
          >
            + New
          </button>
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

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          {search ? (
            <div>
              <p className="text-muted">No institutions match "{search}".</p>
              <button
                onClick={() => setSearch("")}
                className="mt-2 text-sm text-gold hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div>
              <p className="text-muted">No institutions yet.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-3 px-4 py-2 text-sm font-semibold rounded-xl bg-gold text-black hover:brightness-110 transition-all duration-200 shadow-button"
              >
                Create your first institution
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-secondary text-left">
                  <th className="px-6 py-3 font-medium text-muted">Institution</th>
                  <th className="px-6 py-3 font-medium text-muted text-right">Users</th>
                  <th className="px-6 py-3 font-medium text-muted text-right">Payments</th>
                  <th className="px-6 py-3 font-medium text-muted text-right">Volume</th>
                  <th className="px-6 py-3 font-medium text-muted text-right">Wallets</th>
                  <th className="px-6 py-3 font-medium text-muted text-right">Collected</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst: any) => (
                  <tr
                    key={inst._id}
                    className="border-t border-border-subtle hover:bg-hover transition-colors duration-150 cursor-pointer"
                    onClick={() =>
                      setSelectedInst(
                        selectedInst === inst._id ? null : inst._id
                      )
                    }
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-primary">{inst.name}</p>
                      <p className="text-xs text-muted mt-0.5">
                        Created{" "}
                        {new Date(inst.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-secondary">
                      {inst.userCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-secondary font-mono">
                        {inst.completedPaymentCount}
                      </span>
                      <span className="text-xs text-muted ml-1">
                        / {inst.paymentCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-gold font-medium">
                      ₦{inst.paymentVolume.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-secondary">
                      {inst.walletCount}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-success">
                      ₦{inst.totalCollected.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Institution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-4 card p-0 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-bold text-primary">Create Institution</h2>
                <p className="text-xs text-muted mt-0.5">
                  Creates the institution and an INSTITUTION_ADMIN user atomically.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-muted hover:bg-hover transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Institution Name */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-secondary">
                  Institution Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., University of Lagos"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
                />
              </div>

              {/* Admin Section */}
              <div className="p-4 rounded-xl border border-border bg-surface-secondary">
                <h3 className="text-sm font-semibold text-primary mb-3">Institution Admin</h3>
                <p className="text-xs text-muted mb-3">
                  First, create the user in{" "}
                  <a
                    href="https://dashboard.clerk.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline hover:no-underline"
                  >
                    Clerk Dashboard
                  </a>{" "}
                  (email + password). Then paste their Clerk ID below.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-secondary">
                      Clerk ID <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="user_2xxxxxxxxxxxxxxxxxxxxxx"
                      value={form.adminClerkId}
                      onChange={(e) => setForm({ ...form, adminClerkId: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-primary text-sm font-mono text-xs outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-secondary">
                      Admin Email <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="admin@institution.edu.ng"
                      value={form.adminEmail}
                      onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface text-primary text-sm outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 text-sm font-medium rounded-xl border border-border text-secondary hover:bg-hover transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !form.name || !form.adminClerkId || !form.adminEmail}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110 shadow-button"
              >
                {creating ? (
                  <span className="flex items-center gap-2">
                    <span className="skeleton w-3 h-3 rounded-full" />
                    Creating...
                  </span>
                ) : (
                  "Create Institution"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
