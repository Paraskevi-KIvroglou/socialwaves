import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: { userHandle: v.string() },
  handler: async (ctx, { userHandle }) => {
    const rows = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userHandle", userHandle))
      .collect();
    return rows.map((r) => r.beachSlug);
  },
});

export const toggle = mutation({
  args: { userHandle: v.string(), beachSlug: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_beach", (q) =>
        q.eq("userHandle", args.userHandle).eq("beachSlug", args.beachSlug),
      )
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false as const };
    }
    await ctx.db.insert("favorites", {
      userHandle: args.userHandle,
      beachSlug: args.beachSlug,
      createdAt: Date.now(),
    });
    return { favorited: true as const };
  },
});
