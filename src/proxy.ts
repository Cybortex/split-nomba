import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/register",
  "/api/webhooks(.*)",
  "/_next(.*)",
  "/favicon.ico",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes — unauthenticated users are redirected to /sign-in
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // After sign-in: redirect authenticated users from the root landing page
  // to their role-appropriate dashboard. SUPER_ADMIN will be further
  // redirected to /admin by the dashboard page client-side.
  // All other roles land on /dashboard directly.
  const { userId } = await auth();
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
