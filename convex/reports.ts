import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const reportKind = v.union(
  v.literal("waves_there"),
  v.literal("no_waves"),
  v.literal("smaller_than_predicted"),
  v.literal("too_windy"),
  v.literal("too_crowded"),
  v.literal("unsafe"),
  v.literal("perfect_session"),
);

export const listForBeach = query({
  args: { beachSlug: v.string(), limit: v.number() },
  handler: async (ctx, { beachSlug, limit }) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_beach_created", (q) => q.eq("beachSlug", beachSlug))
      .order("desc")
      .take(Math.min(100, limit));
  },
});

export const listRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_created", (q) => q)
      .order("desc")
      .take(Math.min(200, limit));
  },
});

export const listForHandle = query({
  args: { userHandle: v.string(), limit: v.number() },
  handler: async (ctx, { userHandle, limit }) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_user_created", (q) => q.eq("userHandle", userHandle))
      .order("desc")
      .take(Math.min(500, limit));
  },
});

export const create = mutation({
  args: {
    beachSlug: v.string(),
    kind: reportKind,
    note: v.optional(v.string()),
    userHandle: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("reports", {
      beachSlug: args.beachSlug,
      kind: args.kind,
      note: args.note,
      userHandle: args.userHandle,
      createdAt: Date.now(),
    });
  },
});

export const seedIfEmpty = mutation({
  args: {
    rows: v.array(
      v.object({
        beachSlug: v.string(),
        kind: reportKind,
        note: v.optional(v.string()),
        userHandle: v.string(),
        createdAt: v.number(),
      }),
    ),
  },
  handler: async (ctx, { rows }) => {
    const any = await ctx.db.query("reports").first();
    if (any) {
      return { skipped: true as const, inserted: 0 };
    }
    for (const r of rows) {
      await ctx.db.insert("reports", r);
    }
    return { skipped: false as const, inserted: rows.length };
  },
});
