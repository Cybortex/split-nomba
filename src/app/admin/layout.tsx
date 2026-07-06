"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (currentUser) {
      const isSuper = currentUser.roles.includes("SUPER_ADMIN");
      
      if (!isSuper) {
        // Redirect non-super-admins and auto-heal Clerk metadata to false
        if (clerkUser && clerkUser.publicMetadata?.isSuperAdmin !== false) {
          syncSuperAdminRole(currentUser.clerkId, false).catch(console.error);
        }
        router.push("/dashboard");
      } else {
        // Auto-heal Clerk metadata to true for super admins
        if (clerkUser && clerkUser.publicMetadata?.isSuperAdmin !== true) {
          syncSuperAdminRole(currentUser.clerkId, true).catch(console.error);
        }
      }
    } else if (currentUser === null) {
      // If user isn't in database, route them to dashboard
      router.push("/dashboard");
    }
  }, [currentUser, clerkUser, router]);

  if (!isLoaded || currentUser === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <div className="skeleton w-12 h-12 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  if (currentUser === null || !currentUser.roles.includes("SUPER_ADMIN")) {
    return (
      <div className="flex items-center justify-center h-screen bg-app">
        <p className="text-muted">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
