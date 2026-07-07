"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Check } from "lucide-react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    adminEmail: "",
    adminName: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const register = useMutation(api.auth.registerInstitution);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border border-border bg-surface text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-success/10">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-primary">Registration Submitted</h2>
          <p className="mb-6 text-sm text-muted">
            Your institution registration has been submitted for review. The Super Admin will review and approve your account. You&apos;ll receive an email once approved.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 text-sm font-semibold rounded-lg bg-gold text-black hover:brightness-110 transition-all duration-200"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Register Your Institution</h1>
          <p className="mt-2 text-sm text-muted">
            Fill in the details below. A Super Admin will review and approve your registration.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 rounded-2xl border border-border bg-surface space-y-5"
        >
          {error && (
            <div className="p-3 rounded-lg text-sm bg-error/10 text-error border border-error/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">Institution Name</label>
            <input
              type="text"
              placeholder="e.g., Federal University of Technology, Minna"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">Admin Email</label>
            <input
              type="email"
              placeholder="admin@institution.edu.ng"
              value={form.adminEmail}
              onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">Admin Name</label>
            <input
              type="text"
              placeholder="Full name of the institution admin"
              value={form.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              required
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">Phone (Optional)</label>
            <input
              type="tel"
              placeholder="+234 800 000 0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-secondary">Address (Optional)</label>
            <textarea
              placeholder="Institution address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-lg border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 resize-none focus:border-gold"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-semibold rounded-lg bg-gold text-black transition-all duration-200 disabled:opacity-50 hover:brightness-110"
          >
            {loading ? "Submitting..." : "Submit Registration"}
          </button>

          <p className="text-xs text-center text-muted-dark">
            After submission, a Super Admin will review your application.
          </p>
        </form>
      </div>
    </div>
  );
}
