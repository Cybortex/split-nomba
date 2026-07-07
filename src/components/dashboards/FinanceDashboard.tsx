"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BarChart3, Coins } from "lucide-react";

type Tab = "overview" | "fees";

const FEE_CATEGORIES = [
  { value: "tuition" as const, label: "Tuition" },
  { value: "department_dues" as const, label: "Department Dues" },
  { value: "faculty_dues" as const, label: "Faculty Dues" },
  { value: "sug_dues" as const, label: "SUG Dues" },
];

const LEVELS = [100, 200, 300, 400, 500];

const WALLET_TYPES = [
  { value: "institution", label: "Institution" },
  { value: "faculty", label: "Faculty" },
  { value: "department", label: "Department" },
  { value: "association", label: "Association" },
] as const;

// ============================================================================
// TAB BAR
// ============================================================================
function TabBar({ activeTab, onTabChange }: { activeTab: Tab; onTabChange: (tab: Tab) => void }) {
  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <BarChart3 className="w-4 h-4" /> },
    { key: "fees", label: "Fees", icon: <Coins className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`inline-flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg border transition-all duration-200 ${
            activeTab === tab.key
              ? "bg-gold text-black border-gold"
              : "bg-transparent text-secondary border-border hover:bg-hover"
          }`}
        >
          <span className="mr-1 sm:mr-1.5">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB (existing wallet stats)
// ============================================================================
function OverviewTab({ institutionId }: { institutionId: string }) {
  const wallets = useQuery(api.wallets.listAll, { institutionId: institutionId as any });
  const students = useQuery(api.studentRecords.listStudents, { institutionId: institutionId as any });

  if (!wallets) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  const totalCollected = wallets.reduce((sum: number, w: any) => sum + w.totalCollected, 0);
  const totalBalance = wallets.reduce((sum: number, w: any) => sum + w.availableBalance, 0);
  const totalTransactions = wallets.reduce((sum: number, w: any) => sum + w.transactionCount, 0);
  const totalStudents = students?.length ?? 0;

  const stats = [
    { label: "Total Collected", value: `₦${totalCollected.toLocaleString()}`, color: "text-gold" },
    { label: "Available Balance", value: `₦${totalBalance.toLocaleString()}`, color: "text-success" },
    { label: "Transactions", value: totalTransactions.toLocaleString(), color: "text-info" },
    { label: "Active Students", value: totalStudents.toLocaleString(), color: "text-pending" },
  ];

  const walletTypeGroups = [
    { type: "institution", label: "Institution", gradient: "from-gold/10 to-gold/5" },
    { type: "faculty", label: "Faculty", gradient: "from-success/10 to-success/5" },
    { type: "department", label: "Department", gradient: "from-info/10 to-info/5" },
    { type: "association", label: "Association", gradient: "from-pending/10 to-pending/5" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 rounded-xl border border-border bg-surface">
            <p className="text-sm text-muted mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Wallet Breakdown */}
      {walletTypeGroups.map(({ type, label, gradient }) => {
        const typeWallets = wallets.filter((w: any) => w.type === type);
        if (typeWallets.length === 0) return null;

        return (
          <div key={type} className={`rounded-xl border border-border bg-gradient-to-br ${gradient} p-6`}>
            <h3 className="font-semibold text-primary mb-4">{label} Wallets</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium text-right">Balance</th>
                    <th className="pb-2 font-medium text-right">Collected</th>
                    <th className="pb-2 font-medium text-right">Txns</th>
                  </tr>
                </thead>
                <tbody>
                  {typeWallets.map((wallet: any) => (
                    <tr key={wallet._id} className="border-t border-border-subtle">
                      <td className="py-2 font-medium text-primary">{wallet.name}</td>
                      <td className="py-2 text-right font-mono text-success">
                        ₦{wallet.availableBalance.toLocaleString()}
                      </td>
                      <td className="py-2 text-right font-mono text-gold">
                        ₦{wallet.totalCollected.toLocaleString()}
                      </td>
                      <td className="py-2 text-right text-secondary">{wallet.transactionCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {wallets.length === 0 && (
        <div className="p-12 rounded-xl border border-border bg-surface text-center">
          <p className="text-muted">No wallets created yet. Import an institution structure to get started.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// FEES TAB (moved from InstitutionAdminDashboard)
// ============================================================================
function FeesTab({ institutionId }: { institutionId: string }) {
  const [selectedLevel, setSelectedLevel] = useState<number>(100);
  const feeSummary = useQuery(api.fees.getFeeSummary, { institutionId: institutionId as any });
  const addFeeItem = useMutation(api.fees.addFeeItem);
  const removeFeeItem = useMutation(api.fees.removeFeeItem);

  const [newItem, setNewItem] = useState({ itemName: "", amount: "", category: "tuition" as "tuition" | "department_dues" | "faculty_dues" | "sug_dues" });
  const [adding, setAdding] = useState(false);
  const [feeMessage, setFeeMessage] = useState("");

  const levelData = Array.isArray(feeSummary)
    ? (feeSummary as any).find((l: any) => l.level === selectedLevel)
    : null;
  const levelFees = levelData?.categories?.flatMap((c: any) => c.items) || [];
  const totalAmount = levelData?.total || 0;

  const handleAdd = async () => {
    if (!newItem.itemName || !newItem.amount) return;
    setAdding(true);
    setFeeMessage("");
    try {
      await addFeeItem({
        institutionId: institutionId as any,
        level: selectedLevel,
        itemName: newItem.itemName,
        amount: Number(newItem.amount),
        category: newItem.category,
      });
      setNewItem({ itemName: "", amount: "", category: "tuition" });
      setFeeMessage("Fee item added successfully!");
      setTimeout(() => setFeeMessage(""), 3000);
    } catch (err: any) {
      setFeeMessage(err.message || "Failed to add fee item");
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

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-primary">Level Fee Configuration</h2>
        <p className="text-xs text-muted mt-0.5">Configure fixed fee items per academic level.</p>
      </div>

      {/* Level Selector */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg border transition-all duration-200 ${
              selectedLevel === level
                ? "bg-gold text-black border-gold"
                : "bg-transparent text-secondary border-border hover:bg-hover"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {feeMessage && (
        <div className={`p-3 rounded-lg text-sm border ${
          feeMessage.includes("success") || feeMessage.includes("Success")
            ? "bg-success/10 text-success border-success/20"
            : "bg-error/10 text-error border-error/20"
        }`}>
          {feeMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fee Items */}
        <div className="p-5 rounded-xl border border-border bg-surface">
          <h3 className="font-semibold text-primary mb-3">Fee Items — {selectedLevel} Level</h3>
          {levelFees.length > 0 ? (
            <div className="space-y-2">
              {levelFees.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium text-primary truncate">{item.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ${
                      item.category === "tuition" ? "bg-gold/10 text-gold" :
                      item.category === "department_dues" ? "bg-info/10 text-info" :
                      item.category === "faculty_dues" ? "bg-success/10 text-success" :
                      "bg-pending/10 text-pending"
                    }`}>
                      {FEE_CATEGORIES.find((c) => c.value === item.category)?.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm font-mono font-medium text-primary">
                      ₦{item.amount.toLocaleString()}
                    </span>
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
                <span className="text-sm font-mono font-bold text-gold">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted py-8 text-center">No fee items configured for this level.</p>
          )}
        </div>

        {/* Add Fee Item */}
        <div className="p-5 rounded-xl border border-border bg-surface">
          <h3 className="font-semibold text-primary mb-3">Add Fee Item</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Item Name</label>
              <input
                type="text"
                placeholder="e.g., Tuition, Lab Fee"
                value={newItem.itemName}
                onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Category</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
              >
                {FEE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1 text-secondary">Amount (₦)</label>
              <input
                type="number"
                placeholder="50000"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
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

// ============================================================================
// MAIN FINANCE DASHBOARD
// ============================================================================
export function FinanceDashboard({ 
  institutionId,
  activeTab = "overview"
}: { 
  institutionId?: string;
  activeTab?: string;
}) {
  const myInst = useQuery(api.auth.getMyInstitution);
  const effectiveInstId = institutionId || (myInst?._id as string | undefined);

  if (!effectiveInstId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="skeleton w-8 h-8 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-primary">Finance Dashboard</h2>
          <span className="text-xs px-2 py-0.5 rounded bg-gold/10 text-gold-royal font-mono">
            FINANCE
          </span>
        </div>
        <p className="text-xs text-muted mt-0.5">Manage fee structures, allocation rules, and view wallet performance.</p>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab institutionId={effectiveInstId} />}
      {activeTab === "fees" && <FeesTab institutionId={effectiveInstId} />}
    </div>
  );
}
