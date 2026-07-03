"use client";

type Wallet = {
  _id: string;
  name: string;
  type: string;
  availableBalance: number;
  totalCollected: number;
  transactionCount: number;
  entityId: string;
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

const WALLET_TYPE_CONFIG: Record<string, { label: string; badgeClass: string; icon: string }> = {
  institution: {
    label: "Institution Wallet",
    badgeClass: "bg-gold/10 text-gold border-gold/20",
    icon: "🏛️",
  },
  faculty: {
    label: "Faculty Wallet",
    badgeClass: "bg-success/10 text-success border-success/20",
    icon: "📚",
  },
  department: {
    label: "Department Wallet",
    badgeClass: "bg-info/10 text-info border-info/20",
    icon: "📁",
  },
  association: {
    label: "Association Wallet",
    badgeClass: "bg-pending/10 text-pending border-pending/20",
    icon: "🤝",
  },
  sug: {
    label: "SUG Wallet",
    badgeClass: "bg-gold/10 text-gold border-gold/20",
    icon: "🎓",
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
  const config = WALLET_TYPE_CONFIG[wallet.type] || {
    label: wallet.type,
    badgeClass: "bg-gold/10 text-gold border-gold/20",
    icon: "💰",
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg flex-shrink-0">{config.icon}</span>
          <div className="min-w-0">
            <h2 className="font-semibold text-primary text-lg truncate">{wallet.name}</h2>
            {subtitle && (
              <p className="text-xs text-muted mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
