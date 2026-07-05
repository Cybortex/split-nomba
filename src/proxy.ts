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

  // SUPER_ADMIN routing — middleware runs BEFORE the page loads,
  // so there's zero flash of the wrong dashboard.
  // The isSuperAdmin flag is stored in Clerk's public metadata, synced
  // automatically when the SUPER_ADMIN role is assigned (via the
  // bootstrap action or /api/clerk/sync-role endpoint).
  if (userId && (isDashboardRoute(req) || isAdminRoute(req))) {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const isSuperAdmin = clerkUser.publicMetadata.isSuperAdmin as boolean;

    if (isSuperAdmin && isDashboardRoute(req)) {
      return Response.redirect(new URL("/admin", req.url));
    }

    if (!isSuperAdmin && isAdminRoute(req)) {
      return Response.redirect(new URL("/dashboard", req.url));
    }
  }

  // After sign-in: redirect authenticated users from the root landing page
  // to their dashboard.
  if (userId && req.nextUrl.pathname === "/") {
    return Response.redirect(new URL("/dashboard", req.url));
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
