"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function CustomSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!isLoaded || !signIn) return;

      // Basic client-side validation
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signIn.create({
          identifier: email.trim(),
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/dashboard");
        } else {
          // Handle other statuses (e.g., MFA, etc.)
          setError("Additional verification is required. Please try again.");
        }
      } catch (err: any) {
        const message =
          err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          "Invalid email or password. Please try again.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, password, isLoaded, signIn, setActive, router],
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* ── Background Glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gold/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* ── Header ── */}
        <div className="text-center mb-8 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-6 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold/20 transition-all duration-300">
              <span className="text-xl font-bold text-gold font-mono">S</span>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            Welcome back
          </h1>
          <p className="text-sm text-muted mt-2">
            Sign in to access your dashboard and manage payments.
          </p>
        </div>

        {/* ── Form Card ── */}
        <form
          onSubmit={handleSubmit}
          className="card p-6 sm:p-8 space-y-5 animate-slide-up"
        >
          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 animate-fade-in-fast">
              <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
              <p className="text-sm text-error leading-relaxed">{error}</p>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Email address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@institution.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 placeholder:text-muted-dark focus:border-gold focus:ring-1 focus:ring-gold/20 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-secondary mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 placeholder:text-muted-dark focus:border-gold focus:ring-1 focus:ring-gold/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-dark hover:text-muted transition-colors duration-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-medium text-muted hover:text-gold transition-colors duration-200"
              onClick={() => {
                // Clerk's built-in forgot password flow — can be extended later
                setError("Please contact your institution administrator to reset your password.");
              }}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isLoaded}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-button group"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border-subtle" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 text-xs text-muted-dark bg-surface">
                or
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-xs text-muted-dark">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="inline-flex items-center gap-1 text-xs font-medium text-gold hover:text-gold-royal transition-colors group"
              >
                Register your institution
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </p>
          </div>
        </form>

        {/* ── Footer Note ── */}
        <p className="mt-6 text-xs text-center text-muted-dark leading-relaxed animate-fade-in">
          This is a private platform. Accounts are created by your institution administrator.
        </p>
      </div>
    </div>
  );
}
