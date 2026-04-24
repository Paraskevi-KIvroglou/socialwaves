import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { refreshMarineHandler } from "./openMeteoActions";

const rowValidator = v.object({
  slug: v.string(),
  name: v.string(),
  area: v.string(),
  country: v.string(),
  region: v.string(),
  latitude: v.number(),
  longitude: v.number(),
  skillLevels: v.array(
    v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
  ),
  trustScore: v.number(),
  blurb: v.string(),
  heroEmoji: v.string(),
  heroGradient: v.string(),
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("beaches").collect();
    return all.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("beaches")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
  },
});

export const upsertMany = mutation({
  args: { rows: v.array(rowValidator) },
  handler: async (ctx, { rows }) => {
    let inserted = 0;
    let updated = 0;
    for (const row of rows) {
      const existing = await ctx.db
        .query("beaches")
        .withIndex("by_slug", (q) => q.eq("slug", row.slug))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, row);
        updated++;
      } else {
        await ctx.db.insert("beaches", row);
        inserted++;
      }
    }
    return { inserted, updated, total: rows.length };
  },
});

type MarineRefreshResult = {
  rawId: Id<"openMeteoRaw">;
  forecastId: Id<"marineForecasts">;
  latitude: number;
  longitude: number;
};

type BeachRefreshCoords = {
  name: string;
  latitude: number;
  longitude: number;
};

export const refreshByBeachSlug = action({
  args: { beachSlug: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      rawId: v.id("openMeteoRaw"),
      forecastId: v.id("marineForecasts"),
      latitude: v.number(),
      longitude: v.number(),
    }),
  ),
  handler: async (ctx, { beachSlug }): Promise<MarineRefreshResult | null> => {
    const beach: BeachRefreshCoords | null = await ctx.runQuery(
      internal.beachRefresh.lookupCoords,
      { beachSlug },
    );
    if (!beach) return null;
    return await refreshMarineHandler(ctx, {
      latitude: beach.latitude,
      longitude: beach.longitude,
      locationName: beach.name,
    });
  },
});

export const refreshManyByBeachSlugs = action({
  args: { beachSlugs: v.array(v.string()) },
  returns: v.array(
    v.object({
      rawId: v.id("openMeteoRaw"),
      forecastId: v.id("marineForecasts"),
      latitude: v.number(),
      longitude: v.number(),
    }),
  ),
  handler: async (ctx, { beachSlugs }): Promise<MarineRefreshResult[]> => {
    const out: MarineRefreshResult[] = [];
    for (const beachSlug of beachSlugs) {
      const beach: BeachRefreshCoords | null = await ctx.runQuery(
        internal.beachRefresh.lookupCoords,
        { beachSlug },
      );
      if (!beach) continue;
      out.push(
        await refreshMarineHandler(ctx, {
          latitude: beach.latitude,
          longitude: beach.longitude,
          locationName: beach.name,
        }),
      );
    }
    return out;
  },
});
