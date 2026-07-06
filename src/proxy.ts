import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/register",
  "/api/webhooks(.*)",
  "/api/clerk(.*)",
  "/_next(.*)",
  "/favicon.ico",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes — unauthenticated users are redirected to /sign-in
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // For public API routes (like /api/clerk/sync-role), skip entirely
  if (isPublicRoute(req) && req.nextUrl.pathname.startsWith("/api/")) {
    return;
  }

  const { userId } = await auth();

  if (userId) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const isSuperAdmin = clerkUser.publicMetadata.isSuperAdmin as boolean | undefined;

    // After sign-in: redirect authenticated users from the root landing page to their correct area.
    // Only redirect to /admin if explicitly marked as super admin.
    // If isSuperAdmin is undefined (not yet synced), fall through to /dashboard and let the
    // client-side layout handle auto-sync and re-routing.
    if (req.nextUrl.pathname === "/") {
      if (isSuperAdmin === true) {
        return Response.redirect(new URL("/admin", req.url));
      } else {
        // Covers both false and undefined — non-admin users go to /dashboard
        return Response.redirect(new URL("/dashboard", req.url));
      }
    }

    // Block confirmed super admins from accessing /dashboard — always redirect to /admin
    if (isSuperAdmin === true && isDashboardRoute(req)) {
      return Response.redirect(new URL("/admin", req.url));
    }

    // Block confirmed non-super-admins from accessing /admin — redirect to /dashboard
    // NOTE: Only redirect if isSuperAdmin is explicitly false. If it's undefined (unsynced),
    // let the admin layout page load so it can trigger the sync to Clerk.
    if (isSuperAdmin === false && isAdminRoute(req)) {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
