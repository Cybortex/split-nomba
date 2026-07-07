"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { syncSuperAdminRole } from "@/lib/clerk-sync";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const currentUser = useQuery(api.auth.getCurrentUser);
  const router = useRouter();

  // Grace period: if currentUser stays null for > 4s while signed in,
  // it's genuinely not in the DB (not just a loading lag).
  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Start grace period timer when signed in but Convex hasn't returned a user yet
  useEffect(() => {
    if (!timerRef.current && isSignedIn && currentUser === undefined) {
      timerRef.current = setTimeout(() => setGracePeriodExpired(true), 5000);
    }

    if (currentUser !== undefined && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSignedIn, currentUser]);

  // Redirect unauthenticated users to sign-in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  // Handle role checking and auto-sync once we have a definitive Convex user
  useEffect(() => {
    if (currentUser === undefined) return; // still loading

    if (currentUser === null) {
      // Not in DB — only redirect after grace period to avoid token-sync lag
      if (gracePeriodExpired) {
        router.push("/dashboard");
      }
      return;
    }

    const isSuper = currentUser.roles?.includes("SUPER_ADMIN");

    if (!isSuper) {
      // Confirmed not a super admin — redirect to dashboard
      router.push("/dashboard");
    } else {
      // IS a super admin — ensure Clerk metadata is synced so middleware works next time
      const alreadySynced = clerkUser?.publicMetadata?.isSuperAdmin === true;
      if (!alreadySynced && currentUser.clerkId) {
        syncSuperAdminRole(currentUser.clerkId, true).catch(console.error);
      }
    }
  }, [currentUser, clerkUser, gracePeriodExpired, router]);

  // ── Rendering guards ────────────────────────────────────────────────────────

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="skeleton w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!isSignedIn) return null;

  // Still loading Convex user (undefined) OR brief null before grace period expires
  const stillLoading =
    currentUser === undefined || (currentUser === null && !gracePeriodExpired);

  if (stillLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl animate-pulse" />
          <p className="text-xs text-muted animate-pulse">Loading your profile…</p>
        </div>
      </div>
    );
  }

  // User not in DB (after grace period) or not a super admin
  if (currentUser === null || !currentUser.roles?.includes("SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-8 h-8 rounded-full animate-pulse" />
          <p className="text-xs text-muted">Redirecting…</p>
        </div>
      </div>
    );
  }

  // ── Confirmed SUPER_ADMIN — render the admin page ───────────────────────────
  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
