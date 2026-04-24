import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Dashboard-facing snapshot from the Evaluation Agent (aggregate verdicts).
 * Replace placeholder logic when beach reports and forecast rows exist.
 */
export const getMyEvaluationSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const hasLocation = Boolean(user?.location);
    if (!hasLocation) {
      return {
        headline: "Set your home surf spot to start personalized evaluations.",
        summary:
          "The Evaluation Agent compares Open-Meteo to real surfer feedback at your favorite beach and rolls that into your analytics.",
        trustPreview: null as number | null,
        bullets: [
          "Add a location to unlock per-beach forecast vs reality.",
          "After sessions, your reports improve trust scores and the dashboard summary.",
        ],
      };
    }

    const name = user.location!.name;
    return {
      headline: `${name}: building your evaluation track record`,
      summary:
        "We’ll score how often the forecast matched what surfers actually saw. More reports = sharper dashboard evaluations.",
      trustPreview: 62,
      bullets: [
        "Not enough surfer reports yet to lock a trust score for this spot.",
        "Log conditions after your next session—the Evaluation Agent updates your dashboard first.",
      ],
    };
  },
});
