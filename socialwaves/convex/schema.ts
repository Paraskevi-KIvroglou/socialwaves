import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    location: v.optional(
      v.object({
        name: v.string(),
        latitude: v.number(),
        longitude: v.number(),
      }),
    ),
  }).index("email", ["email"]),

  /** One row per Open-Meteo response: full JSON as stored by the backend (no client shaping). */
  openMeteoRaw: defineTable({
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.optional(v.string()),
    /** Stringified JSON from the Marine API (or mock) — single source of truth. */
    payload: v.string(),
    createdAt: v.number(),
    source: v.union(v.literal("api"), v.literal("mock")),
  }).index("by_lat_lng_created", [
    "latitude",
    "longitude",
    "createdAt",
  ]),

  beaches: defineTable({
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
  }).index("by_slug", ["slug"]),

  reports: defineTable({
    beachSlug: v.string(),
    kind: v.union(
      v.literal("waves_there"),
      v.literal("no_waves"),
      v.literal("smaller_than_predicted"),
      v.literal("too_windy"),
      v.literal("too_crowded"),
      v.literal("unsafe"),
      v.literal("perfect_session"),
    ),
    note: v.optional(v.string()),
    userHandle: v.string(),
    createdAt: v.number(),
  })
    .index("by_beach_created", ["beachSlug", "createdAt"])
    .index("by_user_created", ["userHandle", "createdAt"])
    .index("by_created", ["createdAt"]),

  /**
   * Parsed / separated series derived from `openMeteoRaw` in the backend (aligned hourly arrays).
   */
  marineForecasts: defineTable({
    rawId: v.id("openMeteoRaw"),
    latitude: v.number(),
    longitude: v.number(),
    createdAt: v.number(),
    hourly: v.object({
      time: v.array(v.string()),
      waveHeight: v.array(v.number()),
      waveDirection: v.array(v.number()),
      wavePeriod: v.array(v.number()),
      windWaveHeight: v.array(v.number()),
      windWavePeriod: v.array(v.number()),
      swellWaveHeight: v.array(v.number()),
      swellWaveDirection: v.array(v.number()),
      swellWavePeriod: v.array(v.number()),
    }),
  })
    .index("by_raw", ["rawId"])
    .index("by_lat_lng_created", [
      "latitude",
      "longitude",
      "createdAt",
    ]),
});
