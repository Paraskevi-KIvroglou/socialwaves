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

  /** Curated surf spots (seeded for /beach/[id] and picks). */
  beaches: defineTable({
    name: v.string(),
    slug: v.string(),
    region: v.optional(v.string()),
    latitude: v.number(),
    longitude: v.number(),
  }).index("by_slug", ["slug"]),

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
