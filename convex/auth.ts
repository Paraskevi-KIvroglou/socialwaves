import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";

// Resend: AUTH_RESEND_KEY + AUTH_RESEND_FROM on the Convex deployment.
// Magic links use SITE_URL per deployment (dev: localhost; prod: your hosted Next URL).
// CONVEX_SITE_URL is injected by Convex (issuer); do not set it yourself.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Resend({
      from: process.env.AUTH_RESEND_FROM ?? "My App <onboarding@resend.dev>",
    }),
  ],
});
