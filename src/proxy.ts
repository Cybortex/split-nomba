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
  "/privacy",
  "/terms",
  "/refund-policy",
  "/support-materials",
  "/_next(.*)",
  "/favicon.ico",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isDashboardRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicAuthGate = createRouteMatcher(["/", "/register", "/sign-in(.*)"]);

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

    // Prevent logged-in users from visiting public auth pages (/, /register, /sign-in)
    if (isPublicAuthGate(req)) {
      if (isSuperAdmin === true) {
        return Response.redirect(new URL("/admin", req.url));
      } else {
        // Redirect to dashboard (if isSuperAdmin is undefined/unsynced, dashboard layout will redirect to /admin)
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
