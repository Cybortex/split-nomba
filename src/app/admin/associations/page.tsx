"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminAssociationsPage() {
  const myInst = useQuery(api.auth.getMyInstitution);
  const associations = useQuery(api.associations.listAssociations, myInst?._id ? { institutionId: myInst._id as any } : "skip");
  const createAssociation = useMutation(api.associations.createAssociation);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "department" as "faculty" | "department",
    parentEntityId: "",
    parentName: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async () => {
    if (!form.name || !form.parentName) return;
    setCreating(true);
    setError("");
    try {
      await createAssociation({
        institutionId: myInst!._id as any,
        name: form.name,
        type: form.type,
        entityId: form.parentEntityId || form.name.toLowerCase().replace(/\s+/g, "_"),
      });
      setShowCreate(false);
      setForm({ name: "", type: "department", parentEntityId: "", parentName: "", description: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary">Association Management</h1>
          <p className="text-sm text-muted mt-1">Create and manage student associations.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
        >
          {showCreate ? "Cancel" : "Create Association"}
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">{error}</div>
      )}

      {showCreate && (
        <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
          <h2 className="font-semibold text-primary">New Association</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Association Name</label>
              <input type="text" placeholder="e.g., CS Association" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold">
                <option value="faculty">Faculty-level</option>
                <option value="department">Department-level</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Parent Name</label>
              <input type="text" placeholder="e.g., Computer Science" value={form.parentName}
                onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none focus:border-gold" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium mb-1.5 text-secondary">Description (Optional)</label>
              <textarea placeholder="Brief description of the association" value={form.description} rows={2}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none resize-none focus:border-gold" />
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !form.name || !form.parentName}
            className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110">
            {creating ? "Creating..." : "Create Association"}
          </button>
        </div>
      )}

      {associations && associations.length > 0 ? (
        <div className="grid gap-3">
          {associations.map((assoc: any) => (
            <div key={assoc._id} className="p-4 rounded-xl border border-border bg-surface transition-all duration-200 hover:border-gold-royal">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-primary">{assoc.name}</h3>
                  <div className="flex gap-3 mt-1 text-xs text-muted">
                    <span className="px-2 py-0.5 rounded bg-gold/10 text-gold-royal">{assoc.type}</span>
                    <span>{assoc.parentName}</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-muted-dark">ID: {assoc._id.substring(0, 8)}...</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-border bg-surface text-center">
          <p className="text-muted">No associations created yet.</p>
        </div>
      )}
    </div>
  );
}
