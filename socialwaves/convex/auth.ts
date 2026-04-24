import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";

// Resend: set AUTH_RESEND_KEY and AUTH_RESEND_FROM on the Convex deployment.
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Resend({
      from: process.env.AUTH_RESEND_FROM ?? "My App <onboarding@resend.dev>",
    }),
  ],
});
