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

  const [gracePeriodExpired, setGracePeriodExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (currentUser === undefined) return;

    if (currentUser === null) {
      if (gracePeriodExpired) {
        router.push("/dashboard");
      }
      return;
    }

    const isSuper = currentUser.roles?.includes("SUPER_ADMIN");

    if (!isSuper) {
      router.push("/dashboard");
    } else {
      const alreadySynced = clerkUser?.publicMetadata?.isSuperAdmin === true;
      if (!alreadySynced && currentUser.clerkId) {
        syncSuperAdminRole(currentUser.clerkId, true).catch(console.error);
      }
    }
  }, [currentUser, clerkUser, gracePeriodExpired, router]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <p className="text-xs text-muted animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) return null;

  const stillLoading =
    currentUser === undefined || (currentUser === null && !gracePeriodExpired);

  if (stillLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-4">
          <div className="skeleton w-12 h-12 rounded-xl" />
          <p className="text-xs text-muted animate-pulse">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (currentUser === null || !currentUser.roles?.includes("SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-8 h-8 rounded-full" />
          <p className="text-xs text-muted">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
