"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  School, 
  Library, 
  Folder, 
  Users, 
  GraduationCap, 
  Wallet as WalletIcon, 
  ArrowDownToLine, 
  Zap 
} from "lucide-react";

type Wallet = {
  _id: string;
  name: string;
  type: string;
  availableBalance: number;
  totalCollected: number;
  transactionCount: number;
  entityId: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
};

type Transaction = {
  _id: string;
  amount: number;
  direction: "credit" | "debit";
  reason: string;
  timestamp: number;
};

// ============================================================================
// TYPE CONFIG — badge colors per wallet type
// ============================================================================

const WALLET_TYPE_CONFIG: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  institution: {
    label: "Institution Wallet",
    badgeClass: "bg-gold/10 text-gold border-gold/20",
    icon: <School className="w-5 h-5 text-gold flex-shrink-0" />,
  },
  faculty: {
    label: "Faculty Wallet",
    badgeClass: "bg-success/10 text-success border-success/20",
    icon: <Library className="w-5 h-5 text-success flex-shrink-0" />,
  },
  department: {
    label: "Department Wallet",
    badgeClass: "bg-info/10 text-info border-info/20",
    icon: <Folder className="w-5 h-5 text-info flex-shrink-0" />,
  },
  association: {
    label: "Association Wallet",
    badgeClass: "bg-pending/10 text-pending border-pending/20",
    icon: <Users className="w-5 h-5 text-pending flex-shrink-0" />,
  },
  sug: {
    label: "SUG Wallet",
    badgeClass: "bg-gold/10 text-gold border-gold/20",
    icon: <GraduationCap className="w-5 h-5 text-gold flex-shrink-0" />,
  },
};

// ============================================================================
// WALLET CARD
// ============================================================================

interface WalletCardProps {
  wallet: Wallet;
  access?: "view" | "transact";
  subtitle?: string;
}

export function WalletCard({ wallet, access, subtitle }: WalletCardProps) {
  const creditDirectly = useMutation(api.wallets.creditWalletDirectly);

  const config = WALLET_TYPE_CONFIG[wallet.type] || {
    label: wallet.type,
    badgeClass: "bg-gold/10 text-gold border-gold/20",
    icon: <WalletIcon className="w-5 h-5 text-gold flex-shrink-0" />,
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 flex items-center justify-center">{config.icon}</span>
          <div className="min-w-0">
            <h2 className="font-semibold text-primary text-lg truncate">{wallet.name}</h2>
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded border ${config.badgeClass}`}>
            {config.label}
          </span>
          {access && (
            <span
              className={`text-xs px-2 py-0.5 rounded border ${
                access === "transact"
                  ? "bg-gold/10 text-gold border-gold/20"
                  : "bg-success/10 text-success border-success/20"
              }`}
            >
              {access === "transact" ? "Can Transact" : "View Only"}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Available Balance"
          value={`₦${(wallet.availableBalance || 0).toLocaleString()}`}
          color="text-success"
        />
        <StatCard
          label="Total Collected"
          value={`₦${(wallet.totalCollected || 0).toLocaleString()}`}
          color="text-gold"
        />
        <StatCard
          label="Transactions"
          value={(wallet.transactionCount || 0).toLocaleString()}
          color="text-info"
        />
      </div>

      {wallet.accountNumber && wallet.bankName && (
        <div className="mt-4 p-4 rounded-xl border border-border bg-surface-secondary space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1.5">
                <ArrowDownToLine className="w-3.5 h-3.5 text-muted" />
                Dedicated Virtual Bank Account
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="text-secondary"><strong className="text-primary font-medium">Bank:</strong> {wallet.bankName}</span>
                <span className="text-secondary"><strong className="text-primary font-medium">Account Name:</strong> {wallet.accountName || wallet.name}</span>
              </div>
              <p className="text-lg font-bold text-primary mt-1 font-mono tracking-wide flex items-center gap-2">
                {wallet.accountNumber}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(wallet.accountNumber!);
                    alert("Account number copied!");
                  }}
                  className="text-xs px-2 py-0.5 rounded bg-surface hover:bg-hover border border-border text-muted hover:text-primary transition-all font-sans font-normal"
                >
                  Copy
                </button>
              </p>
            </div>
            <button
              onClick={async () => {
                const amountStr = prompt(`Simulate direct transfer to ${wallet.name} (${wallet.bankName}):`, "50000");
                if (!amountStr) return;
                const amt = parseFloat(amountStr);
                if (isNaN(amt) || amt <= 0) {
                  alert("Please enter a valid transfer amount.");
                  return;
                }
                try {
                  await creditDirectly({
                    walletId: wallet._id as any,
                    amount: amt,
                    paymentReference: `SIM-BANK-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`,
                    reason: "direct_bank_transfer_simulation",
                  });
                  alert(`Successfully simulated a ₦${amt.toLocaleString()} bank transfer to this wallet!`);
                } catch (err: any) {
                  alert("Simulation failed: " + err.message);
                }
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-center"
            >
              <Zap className="w-3.5 h-3.5 text-black" fill="currentColor" />
              Simulate Transfer
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/80 italic">
            You can simulate external bank transfers directly to this account number to bypass the main checkout split payments flow.
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-surface-secondary p-4 rounded-xl">
      <p className="text-xs text-muted mb-1">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

// ============================================================================
// TRANSACTION LIST
// ============================================================================

interface TransactionListProps {
  transactions: Transaction[];
  maxItems?: number;
  title?: string;
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  maxItems = 15,
  title = "Recent Transactions",
  emptyMessage = "No transactions yet.",
}: TransactionListProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-surface text-center">
        <p className="text-sm text-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-surface">
      <h2 className="font-semibold text-primary mb-4">{title}</h2>
      <div className="space-y-2">
        {transactions.slice(0, maxItems).map((txn) => (
          <div
            key={txn._id}
            className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  txn.direction === "credit" ? "bg-success" : "bg-error"
                }`}
              />
              <div className="min-w-0">
                <p className="text-sm text-primary capitalize truncate">
                  {txn.reason.replace(/_/g, " ")}
                </p>
                <p className="text-xs text-muted">
                  {new Date(txn.timestamp).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            <span
              className={`text-sm font-mono font-medium flex-shrink-0 ml-4 ${
                txn.direction === "credit" ? "text-success" : "text-error"
              }`}
            >
              {txn.direction === "credit" ? "+" : "-"}₦{txn.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
