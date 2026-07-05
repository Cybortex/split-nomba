/**
 * Sync a user's SUPER_ADMIN status to Clerk's public metadata.
 * This allows middleware (proxy.ts) to read `clerkClient().getUser().publicMetadata.isSuperAdmin`
 * and redirect SUPER_ADMIN users to /admin before the dashboard page loads.
 */
export async function syncSuperAdminRole(clerkId: string, isSuperAdmin: boolean) {
  const res = await fetch("/api/clerk/sync-role", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clerkId, isSuperAdmin }),
  });

  if (!res.ok) {
    const body = await res.json();
    console.error("Failed to sync SUPER_ADMIN role to Clerk:", body.error);
  }

  return res.ok;
}
