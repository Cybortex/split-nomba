"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const WALLET_TYPES = [
  { value: "institution", label: "Institution" },
  { value: "faculty", label: "Faculty" },
  { value: "department", label: "Department" },
  { value: "association", label: "Association" },
] as const;

export default function AdminAllocationPage() {
  const myInst = useQuery(api.auth.getMyInstitution);
  const rules = useQuery(
    api.payments.getAllocationRules,
    myInst?._id ? { institutionId: myInst._id as any } : "skip"
  );
  const saveRules = useMutation(api.payments.saveAllocationRules);

  const [newRule, setNewRule] = useState({
    walletType: "institution" as string,
    targetEntityId: "",
    targetName: "",
    amount: "",
    priority: "1",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleAdd = async () => {
    if (!newRule.targetName || !newRule.amount || !myInst?._id) return;
    setSaving(true);
    setMessage("");
    try {
      await saveRules({
        institutionId: myInst._id as any,
        rules: [{                        walletType: newRule.walletType as "institution" | "faculty" | "department" | "association",
          entityKey: newRule.targetEntityId || newRule.targetName.toLowerCase().replace(/\s+/g, "_"),
          targetEntityId: newRule.targetEntityId || newRule.targetName.toLowerCase().replace(/\s+/g, "_"),
          targetName: newRule.targetName,
          amount: Number(newRule.amount),
          priority: Number(newRule.priority),
        }],
      });
      setMessage("Allocation rule added successfully!");
      setNewRule({ walletType: "institution", targetEntityId: "", targetName: "", amount: "", priority: "1" });
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(err.message || "Failed to add rule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">Fixed Allocation Rules</h1>
        <p className="text-sm text-muted mt-1">Define fixed ₦ amounts each wallet receives per student payment. Applied in priority order until the fee total is fully allocated.</p>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes("success") || message.includes("Success")
            ? "bg-success/10 text-success border border-success/20"
            : "bg-error/10 text-error border border-error/20"
        }`}>
          {message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Current Rules */}
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <h2 className="font-semibold text-primary mb-4">Current Allocation Rules</h2>
          {rules && rules.length > 0 ? (
            <div className="space-y-2">
              {rules.map((rule: any, i: number) => (
                <div key={rule._id || i} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-muted-dark">#{rule.priority}</span>
                    <div>
                      <span className="text-sm font-medium text-primary">{rule.targetName}</span>
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gold/10 text-gold-royal">
                        {rule.walletType}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-medium text-primary">
                    ₦{rule.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center">No allocation rules configured.</p>
          )}
        </div>

        {/* Add Rule */}
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <h2 className="font-semibold text-primary mb-4">Add Allocation Rule</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Wallet Type</label>
              <select
                value={newRule.walletType}
                onChange={(e) => setNewRule({ ...newRule, walletType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              >
                {WALLET_TYPES.map((wt) => (
                  <option key={wt.value} value={wt.value}>{wt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Wallet Name</label>
              <input
                type="text"
                placeholder="e.g., Main Institution Wallet"
                value={newRule.targetName}
                onChange={(e) => setNewRule({ ...newRule, targetName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Fixed Amount (₦)</label>
              <input
                type="number"
                placeholder="50000"
                value={newRule.amount}
                onChange={(e) => setNewRule({ ...newRule, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Priority</label>
              <input
                type="number"
                placeholder="1"
                value={newRule.priority}
                onChange={(e) => setNewRule({ ...newRule, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              />
              <p className="text-xs text-muted mt-1">Lower number = higher priority (applied first)</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={saving || !newRule.targetName || !newRule.amount}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
            >
              {saving ? "Adding..." : "Add Rule"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
