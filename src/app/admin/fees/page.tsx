"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Category = "tuition" | "department_dues" | "faculty_dues" | "sug_dues";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "tuition", label: "Tuition" },
  { value: "department_dues", label: "Department Dues" },
  { value: "faculty_dues", label: "Faculty Dues" },
  { value: "sug_dues", label: "SUG Dues" },
];

const LEVELS = [100, 200, 300, 400, 500];

export default function AdminFeesPage() {
  const myInst = useQuery(api.auth.getMyInstitution);
  const [selectedLevel, setSelectedLevel] = useState<number>(100);
  const feeSummary = useQuery(
    api.fees.getFeeSummary,
    myInst?._id ? { institutionId: myInst._id as any } : "skip"
  );
  const addFeeItem = useMutation(api.fees.addFeeItem);
  const removeFeeItem = useMutation(api.fees.removeFeeItem);

  const [newItem, setNewItem] = useState({ itemName: "", amount: "", category: "tuition" as Category });
  const [adding, setAdding] = useState(false);

  const levelData = Array.isArray(feeSummary) ? (feeSummary as any).find((l: any) => l.level === selectedLevel) : null;
  const levelFees = levelData?.categories?.flatMap((c: any) => c.items) || [];

  const handleAdd = async () => {
    if (!newItem.itemName || !newItem.amount || !myInst?._id) return;
    setAdding(true);
    try {
      await addFeeItem({
        institutionId: myInst._id as any,
        level: selectedLevel,
        itemName: newItem.itemName,
        amount: Number(newItem.amount),
        category: newItem.category,
      });
      setNewItem({ itemName: "", amount: "", category: "tuition" });
    } catch (err: any) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeFeeItem({ itemId: itemId as any });
    } catch (err: any) {
      console.error(err);
    }
  };

  const totalAmount = levelData?.total || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">Level Fee Configuration</h1>
        <p className="text-sm text-muted mt-1">Configure fixed fee items per academic level. Total = sum of all items.</p>
      </div>

      {/* Level Selector */}
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 ${
              selectedLevel === level
                ? "bg-gold text-black border-gold"
                : "bg-transparent text-secondary border-border hover:bg-hover"
            }`}
          >
            {level} Level
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fee Items */}
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <h2 className="font-semibold text-primary mb-4">Fee Items — {selectedLevel} Level</h2>
          {levelFees.length > 0 ? (
            <div className="space-y-2">
              {levelFees.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary">
                  <div>
                    <span className="text-sm font-medium text-primary">{item.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      item.category === "tuition" ? "bg-gold/10 text-gold" :
                      item.category === "department_dues" ? "bg-info/10 text-info" :
                      item.category === "faculty_dues" ? "bg-success/10 text-success" :
                      "bg-pending/10 text-pending"
                    }`}>
                      {CATEGORIES.find(c => c.value === item.category)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-medium text-primary">₦{item.amount.toLocaleString()}</span>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-sm text-muted hover:text-error transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-3 border-t border-border mt-3">
                <span className="text-sm font-semibold text-primary">Total</span>
                <span className="text-sm font-mono font-bold text-gold">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center">No fee items configured for this level.</p>
          )}
        </div>

        {/* Add Fee Item */}
        <div className="p-6 rounded-2xl border border-border bg-surface">
          <h2 className="font-semibold text-primary mb-4">Add Fee Item</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Item Name</label>
              <input
                type="text"
                placeholder="e.g., Tuition, Lab Fee"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as Category })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-secondary">Amount (₦)</label>
              <input
                type="number"
                placeholder="50000"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              />
            </div>
            <button
              onClick={handleAdd}
              disabled={adding || !newItem.itemName || !newItem.amount}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
            >
              {adding ? "Adding..." : "Add Fee Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
