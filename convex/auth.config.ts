/**
 * Convex auth configuration.
 *
 * This file tells Convex which JWT providers to trust for authentication.
 * We use Clerk as our auth provider — Convex verifies the JWT tokens issued
 * by Clerk before allowing any authenticated queries/mutations to proceed.
 *
 * The `domain` must match your Clerk "JWT Issuer" domain, found in:
 *   Clerk Dashboard → Configure → API Keys → Advanced → JWT Templates → Issuer
 *   (or the CLERK_JWT_ISSUER_DOMAIN environment variable)
 *
 * @see https://docs.convex.dev/auth/clerk
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN as string,
      applicationID: "convex",
    },
  ],
};
