"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function AdminImportStudentsPage() {
  const [csvText, setCsvText] = useState("");
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const myInst = useQuery(api.auth.getMyInstitution);
  const importStudents = useMutation(api.auth.bulkCreateStudents);

  const handleImport = async () => {
    if (!csvText.trim()) return;
    setImporting(true);
    setResult(null);
    try {
      const lines = csvText.trim().split("\n");
      const students = lines.map((line) => {
        const [clerkId, email, matric] = line.split(",").map(s => s.trim());
        return { clerkId: clerkId || matric, email, matric };
      });

      const res = await importStudents({ institutionId: myInst!._id as any, students });
      setResult({ success: res.imported, failed: res.results.filter((r: any) => r.status === "skipped").length, errors: [] });
    } catch (err: any) {
      setResult({ success: 0, failed: 1, errors: [err.message] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-primary">Import Students</h1>
        <p className="text-sm text-muted mt-1">Bulk import students via CSV. Format: matric,email,faculty,department,level,fullName (one per line).</p>
      </div>

      <div className="p-4 rounded-xl border border-border bg-surface-secondary">
        <p className="text-xs text-muted font-mono">FUT/2022/CSC/001,student@school.edu.ng,Computing,Computer Science,200,John Doe</p>
        <p className="text-xs text-muted font-mono mt-1">FUT/2022/CYB/002,student2@school.edu.ng,Computing,Cyber Security,100,Jane Smith</p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-surface space-y-4">
        <label className="block text-sm font-medium text-secondary">Paste CSV Data</label>
        <textarea
          placeholder="matric,email,faculty,department,level,fullName&#10;FUT/2022/CSC/001,student@edu.ng,Computing,CS,200,John Doe"
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          rows={8}
          className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none resize-y focus:border-gold font-mono"
        />
        <button
          onClick={handleImport}
          disabled={importing || !csvText.trim()}
          className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
        >
          {importing ? "Importing..." : `Import ${csvText.trim().split("\n").length} Students`}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-xl border ${
          result.failed === 0
            ? "border-success/20 bg-success/5"
            : "border-pending/20 bg-pending/5"
        }`}>
          <div className="flex gap-4 text-sm">
            <span className="text-success">✅ {result.success} succeeded</span>
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
