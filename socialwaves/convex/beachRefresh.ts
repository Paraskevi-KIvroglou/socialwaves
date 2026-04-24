import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

/** Lookup for marine refresh actions (`convex/beaches.ts`) — lives in its own file to avoid TS cycles on `internal`. */
export const lookupCoords = internalQuery({
  args: { beachSlug: v.string() },
  handler: async (ctx, { beachSlug }) => {
    const b = await ctx.db
      .query("beaches")
      .withIndex("by_slug", (q) => q.eq("slug", beachSlug))
      .unique();
    if (!b) return null;
    return { name: b.name, latitude: b.latitude, longitude: b.longitude };
  },
});
