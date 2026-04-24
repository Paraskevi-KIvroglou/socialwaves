import type { AuthConfig } from "convex/server";

// Issuer domain: Convex sets CONVEX_SITE_URL on the deployment (read-only).
export default {
  providers: [
    {
      domain:
        process.env.CONVEX_SITE_URL ?? "http://127.0.0.1:3210",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
