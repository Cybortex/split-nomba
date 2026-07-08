"use client";

import { useSignIn } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Send,
  LogIn,
  KeyRound,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

type SignInMode = "password" | "otp" | "forgot";
type ForgotStep = "email" | "otp" | "new_password";

export default function CustomSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // Shared state
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<SignInMode>("password");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password state
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const emailAddressIdRef = useRef<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Forgot password state
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetVerified, setIsResetVerified] = useState(false);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startResendTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setResendTimer(30);
    intervalRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setResendTimer(0);
  }, []);

  // ═══ PASSWORD SIGN-IN ═══
  const handlePasswordSignIn = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!isLoaded || !signIn) return;
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

  // ═══ OTP FLOW ═══
  const handleSendOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!isLoaded || !signIn) return;
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signIn.create({ identifier: email.trim() });

        const emailCodeFactor = result.supportedFirstFactors?.find(
          (f: any) => f.strategy === "email_code",
        ) as { strategy: string; emailAddressId: string } | undefined;

        if (!emailCodeFactor?.emailAddressId) {
          setError(
            "This email is not registered or email sign-in is not enabled.",
          );
          setIsSubmitting(false);
          return;
        }

        emailAddressIdRef.current = emailCodeFactor.emailAddressId;

        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });

        setIsOtpSent(true);
        startResendTimer();
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } catch (err: any) {
        const message =
          err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          "Failed to send verification code. Please try again.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isLoaded, signIn, startResendTimer],
  );

  const handleResendOtp = useCallback(async () => {
    if (!isLoaded || !signIn || resendTimer > 0 || !emailAddressIdRef.current)
      return;

    setError("");
    setIsSubmitting(true);

    try {
      const strategy = mode === "forgot" ? "reset_password_email_code" : "email_code";
      await signIn.prepareFirstFactor({
        strategy: strategy as any,
        emailAddressId: emailAddressIdRef.current,
      });
      startResendTimer();
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Failed to resend code.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [isLoaded, signIn, resendTimer, startResendTimer, mode]);

  const handleVerifyOtp = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!isLoaded || !signIn) return;

      const code = otp.join("");
      if (code.length !== 6) {
        setError("Please enter the complete 6-digit code.");
        return;
      }

      setIsSubmitting(true);

      try {
        const strategy = mode === "forgot" ? "reset_password_email_code" : "email_code";
        const result = await signIn.attemptFirstFactor({
          strategy: strategy as any,
          code,
        });

        if (mode === "forgot") {
          if (result.status === "needs_new_password") {
            setIsResetVerified(true);
            setForgotStep("new_password");
          } else if (result.status === "complete") {
            await setActive({ session: result.createdSessionId });
            router.push("/dashboard");
          } else {
            setError("Verification failed. Please try again.");
          }
        } else {
          if (result.status === "complete") {
            await setActive({ session: result.createdSessionId });
            router.push("/dashboard");
          } else {
            setError("Verification failed. Please try again.");
          }
        }
      } catch (err: any) {
        const message =
          err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          "Invalid code. Please try again.";
        setError(message);
        setOtp(["", "", "", "", "", ""]);
        otpInputRefs.current[0]?.focus();
      } finally {
        setIsSubmitting(false);
      }
    },
    [otp, mode, isLoaded, signIn, setActive, router],
  );

  // ═══ FORGOT PASSWORD FLOW ═══
  const handleStartForgot = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!isLoaded || !signIn) return;
      if (!email.trim()) {
        setError("Please enter your email address.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signIn.create({ identifier: email.trim() });

        // Check if reset_password_email_code is supported
        const resetFactor = result.supportedFirstFactors?.find(
          (f: any) => f.strategy === "reset_password_email_code",
        ) as { strategy: string; emailAddressId: string } | undefined;

        if (!resetFactor?.emailAddressId) {
          setError(
            "Password reset is not available for this account. Contact your institution administrator.",
          );
          setIsSubmitting(false);
          return;
        }

        emailAddressIdRef.current = resetFactor.emailAddressId;

        await signIn.prepareFirstFactor({
          strategy: "reset_password_email_code",
          emailAddressId: resetFactor.emailAddressId,
        });

        setForgotStep("otp");
        startResendTimer();
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } catch (err: any) {
        const message =
          err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          "Failed to send reset code. Please try again.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, isLoaded, signIn, startResendTimer],
  );

  const handleResetPassword = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      if (!isLoaded || !signIn) return;
      if (!newPassword || newPassword.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await signIn.resetPassword({
          password: newPassword,
          signOutOfOtherSessions: false,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push("/dashboard");
        } else {
          setError("Failed to reset password. Please try again.");
        }
      } catch (err: any) {
        const message =
          err?.errors?.[0]?.longMessage ??
          err?.errors?.[0]?.message ??
          "Failed to reset password.";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [newPassword, isLoaded, signIn, setActive, router],
  );

  // ═══ OTP INPUT HANDLERS ═══
  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const form = (e.target as HTMLInputElement).closest("form");
      form?.requestSubmit();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ═══ SWITCH MODE ═══
  const switchMode = useCallback((newMode: SignInMode) => {
    setMode(newMode);
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setIsOtpSent(false);
    setForgotStep("email");
    setIsResetVerified(false);
    setNewPassword("");
    stopTimer();
  }, [stopTimer]);

  if (!isLoaded) {
    return <SignInSkeleton />;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* ── Background Glow ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-gold/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* ── Header ── */}
        <div className="text-center mb-6 animate-fade-in">
          <Link
            href="/"
            className="inline-flex items-center gap-2 mb-5 group"
          >
            <Image
              src="/logo.png"
              alt="Split Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-contain transition-transform duration-300 group-hover:scale-110"
              priority
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">
            {mode === "forgot" ? "Reset your password" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted mt-2">
            {mode === "password" && "Sign in with your email and password."}
            {mode === "otp" && !isOtpSent && "Enter your email to receive a one-time code."}
            {mode === "otp" && isOtpSent && `We sent a code to ${email}`}
            {mode === "forgot" && forgotStep === "email" && "Enter your email to receive a reset code."}
            {mode === "forgot" && forgotStep === "otp" && `We sent a reset code to ${email}`}
            {mode === "forgot" && forgotStep === "new_password" && "Choose a new password for your account."}
          </p>
        </div>

        {/* ── Mode Tabs ── */}
        {mode !== "forgot" && (
          <div className="flex mb-5 p-1 rounded-xl bg-surface border border-border">
            <button
              type="button"
              onClick={() => switchMode("password")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "password"
                  ? "bg-gold/10 text-gold shadow-sm"
                  : "text-muted hover:text-secondary"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => switchMode("otp")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                mode === "otp"
                  ? "bg-gold/10 text-gold shadow-sm"
                  : "text-muted hover:text-secondary"
              }`}
            >
              One-Time Code
            </button>
          </div>
        )}

        {/* ════════════════════════════════════════ */}
        {/* ── PASSWORD MODE ── */}
        {/* ════════════════════════════════════════ */}
        {mode === "password" && (
          <form
            onSubmit={handlePasswordSignIn}
            className="card p-6 sm:p-8 space-y-5 animate-slide-up"
          >
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 animate-fade-in-fast">
                <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                <p className="text-sm text-error leading-relaxed">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="pw-email" className="block text-sm font-medium text-secondary mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="pw-email"
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="pw-password" className="block text-sm font-medium text-secondary">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    switchMode("forgot");
                  }}
                  className="text-xs font-medium text-muted hover:text-gold transition-colors duration-200"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="pw-password"
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-button group"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <><LogIn className="w-4 h-4" /> Sign In</>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => switchMode("otp")}
                className="text-xs font-medium text-muted hover:text-gold transition-colors duration-200 inline-flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                Sign in with a one-time code instead
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════ */}
        {/* ── OTP MODE ── */}
        {/* ════════════════════════════════════════ */}
        {mode === "otp" && !isOtpSent && (
          <form
            onSubmit={handleSendOtp}
            className="card p-6 sm:p-8 space-y-5 animate-slide-up"
          >
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 animate-fade-in-fast">
                <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                <p className="text-sm text-error leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="otp-email" className="block text-sm font-medium text-secondary mb-1.5">
                Email address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="otp-email"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-button group"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending code...</>
              ) : (
                <><Send className="w-4 h-4" /> Send One-Time Code</>
              )}
            </button>

            <p className="text-xs text-center text-muted-dark">A 6-digit code will be sent to your email.</p>
          </form>
        )}

        {mode === "otp" && isOtpSent && (
          <form
            onSubmit={handleVerifyOtp}
            className="card p-6 sm:p-8 space-y-6 animate-slide-up"
          >
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 animate-fade-in-fast">
                <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                <p className="text-sm text-error leading-relaxed">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary mb-3 text-center">
                Enter verification code
              </label>
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    disabled={isSubmitting}
                    className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border border-border bg-surface-secondary text-primary outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20 disabled:opacity-50"
                    aria-label={`Digit ${index + 1}`}
                  />
                ))}
              </div>
              <p className="text-xs text-center text-muted-dark mt-3">Can&apos;t find it? Check your spam folder.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || otp.join("").length !== 6}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-button group"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Verify &amp; Sign In</>
              )}
            </button>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setIsOtpSent(false); setError(""); setOtp(["", "", "", "", "", ""]); stopTimer(); }}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-gold transition-colors duration-200"
              >
                <ArrowLeft className="w-3 h-3" />
                Change email
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || isSubmitting}
                className="text-xs font-medium text-gold hover:text-gold-royal transition-colors duration-200 disabled:text-muted-dark disabled:cursor-not-allowed"
              >
                {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {/* ════════════════════════════════════════ */}
        {/* ── FORGOT PASSWORD MODE ── */}
        {/* ════════════════════════════════════════ */}
        {mode === "forgot" && (
          <div className="animate-slide-up">
            {/* Back to sign in */}
            <button
              type="button"
              onClick={() => switchMode("password")}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-gold transition-colors duration-200 mb-4"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to sign in
            </button>

            {/* Step 1: Email */}
            {forgotStep === "email" && (
              <form onSubmit={handleStartForgot} className="card p-6 sm:p-8 space-y-5">
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 animate-fade-in-fast">
                    <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-error leading-relaxed">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-secondary mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      id="reset-email"
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-button"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending reset code...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Send Reset Code</>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {forgotStep === "otp" && (
              <form onSubmit={handleVerifyOtp} className="card p-6 sm:p-8 space-y-6">
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 animate-fade-in-fast">
                    <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-error leading-relaxed">{error}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-secondary mb-3 text-center">
                    Enter reset code
                  </label>
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { otpInputRefs.current[index] = el; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        disabled={isSubmitting}
                        className="w-10 sm:w-12 h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border border-border bg-surface-secondary text-primary outline-none transition-all duration-200 focus:border-gold focus:ring-1 focus:ring-gold/20 disabled:opacity-50"
                        aria-label={`Digit ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.join("").length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-button"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
                  ) : (
                    <><KeyRound className="w-4 h-4" /> Verify Code</>
                  )}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setForgotStep("email"); setError(""); setOtp(["", "", "", "", "", ""]); stopTimer(); }}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-gold transition-colors duration-200"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || isSubmitting}
                    className="text-xs font-medium text-gold hover:text-gold-royal transition-colors duration-200 disabled:text-muted-dark disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend code"}
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password */}
            {forgotStep === "new_password" && (
              <form onSubmit={handleResetPassword} className="card p-6 sm:p-8 space-y-5">
                {error && (
                  <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error/10 border border-error/20 animate-fade-in-fast">
                    <AlertCircle className="w-4 h-4 text-error mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-error leading-relaxed">{error}</p>
                  </div>
                )}

                {isResetVerified && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20">
                    <ShieldCheck className="w-4 h-4 text-success flex-shrink-0" />
                    <p className="text-xs text-success">Identity verified. Choose a new password.</p>
                  </div>
                )}

                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-secondary mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-dark">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-surface-secondary text-primary text-sm outline-none transition-all duration-200 placeholder:text-muted-dark focus:border-gold focus:ring-1 focus:ring-gold/20 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-dark hover:text-muted transition-colors duration-200"
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || newPassword.length < 8}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-xl bg-gold text-black transition-all duration-200 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed shadow-button"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Resetting password...</>
                  ) : (
                    <><RotateCcw className="w-4 h-4" /> Reset Password</>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Footer Note ── */}
        <p className="mt-6 text-xs text-center text-muted-dark leading-relaxed animate-fade-in">
          This is a private platform. Accounts are created by your institution administrator.
        </p>
      </div>
    </div>
  );
}

/* ═══ Loading Skeleton ═══ */
function SignInSkeleton() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl skeleton mx-auto mb-6" />
          <div className="h-8 w-48 skeleton rounded-lg mx-auto mb-3" />
          <div className="h-4 w-64 skeleton rounded-md mx-auto" />
        </div>

        <div className="card p-6 sm:p-8 space-y-5">
          <div className="h-4 w-24 skeleton rounded-md" />
          <div className="h-11 w-full skeleton rounded-xl" />
          <div className="h-4 w-24 skeleton rounded-md" />
          <div className="h-11 w-full skeleton rounded-xl" />
          <div className="h-11 w-full skeleton rounded-xl" />
          <div className="h-4 w-52 skeleton rounded-md mx-auto" />
        </div>

        <div className="h-4 w-72 skeleton rounded-md mx-auto mt-6" />
      </div>
    </div>
  );
}
