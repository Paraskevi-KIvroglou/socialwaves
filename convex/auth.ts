import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";

/**
 * Convex Auth — required Convex env vars (Dashboard → Deployments → env):
 *
 * - `SITE_URL`: Public origin of your Next.js app exactly as users open it:
 *     production → `https://socialwaves.vercel.app` (no trailing slash).
 * - `AUTH_RESEND_KEY`: API key from Resend.
 * - `AUTH_RESEND_FROM` (recommended): Verified sender domain, e.g.
 *     `SocialWave <auth@yourdomain.com>`.
 * - `JWT_PRIVATE_KEY`, `JWKS`: From manual setup (`labs.convex.dev/auth`).
 *
 * Magic-link emails use `SITE_URL`; if emails point at localhost while you test
 * production, prod `SITE_URL` is missing or stale.
 *
 * Next.js/Vercel also needs `NEXT_PUBLIC_CONVEX_URL` for the Convex deployment URL.
 *
 * Temporary debug logs (Next): set `CONVEX_AUTH_VERBOSE=1` on Vercel and here in dev.
 *
 * (`CONVEX_SITE_URL` for the Convex HTTP host is injected by Convex — do not set manually.)
 */
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Resend({
      from:
        process.env.AUTH_RESEND_FROM ??
        "SocialWaves <onboarding@paraskevikivroglou.com>",
    }),
  ],
});
