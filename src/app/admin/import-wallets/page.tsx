"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminImportWalletsPage() {
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const myInst = useQuery(api.auth.getMyInstitution);
  const importWallets = useAction(api.import.importWallets);

  const handleImport = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    setResult(null);
    try {
      const lines = csvText.trim().split("\n");
      const errors: string[] = [];
      let success = 0;

      for (const line of lines) {
        const [name, type, entityId] = line.split(",").map(s => s.trim());
        if (!name || !type || !entityId) {
          errors.push(`Invalid line: ${line}`);
          continue;
        }
        try {
          await importWallets({ csvContent: `${name},${type},${entityId}`, institutionId: myInst!._id as any });
          success++;
        } catch (err: any) {
          errors.push(`${name}: ${err.message}`);
        }
      }

      setResult({ success, failed: errors.length, errors });
    } catch (err: any) {
      setResult({ success: 0, failed: 1, errors: [err.message] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">Import Wallets</h1>
        <p className="text-sm text-muted mt-1">Bulk create wallets via CSV. Format: name,type,institution|faculty|department|association,entityId (one per line).</p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-surface-secondary">
        <p className="text-xs text-muted font-mono">Main Wallet,institution,inst_001</p>
        <p className="text-xs text-muted font-mono mt-1">Computing Faculty Wallet,faculty,faculty_comp_001</p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
        <label className="block text-sm font-medium text-secondary">Paste CSV Data</label>
        <textarea
          placeholder="name,type,entityId&#10;Main Wallet,institution,inst_001"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={6}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none resize-y focus:border-gold font-mono"
        />
        <button
          onClick={handleImport}
          disabled={importing || !csvText.trim()}
          className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
        >
          {importing ? "Importing..." : `Import ${csvText.trim().split("\n").length} Wallets`}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-xl border ${
          result.failed === 0
            ? "border-success/20 bg-success/5"
            : "border-pending/20 bg-pending/5"
        }`}>
          <div className="flex gap-4 text-sm">
            <span className="text-success">✅ {result.success} created</span>
            {result.failed > 0 && <span className="text-error">❌ {result.failed} failed</span>}
          </div>
          {result.errors.length > 0 && (
            <div className="mt-2 space-y-1">
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-error">{err}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
