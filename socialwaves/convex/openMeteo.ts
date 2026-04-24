import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

type OpenMeteoHourly = {
  time?: unknown;
} & Record<string, unknown>;

function asNumberArray(
  timeLen: number,
  series: unknown,
): number[] {
  if (!Array.isArray(series)) {
    return Array.from({ length: timeLen }, () => 0);
  }
  return Array.from({ length: timeLen }, (_, i) => {
    const x = series[i];
    if (typeof x === "number" && !Number.isNaN(x)) {
      return x;
    }
    return 0;
  });
}

/** Separates the raw Open-Meteo `hourly` object into a typed forecast row. */
export function parseOpenMeteoMarineFromPayload(
  rawJson: string,
): { latitude: number; longitude: number; hourly: ReturnType<typeof toHourlyFields> } {
  const data = JSON.parse(rawJson) as {
    latitude?: unknown;
    longitude?: unknown;
    hourly?: OpenMeteoHourly;
  };
  const lat = typeof data.latitude === "number" ? data.latitude : 0;
  const lng = typeof data.longitude === "number" ? data.longitude : 0;
  const h = data.hourly;
  if (!h || !Array.isArray(h.time) || h.time.length === 0) {
    return {
      latitude: lat,
      longitude: lng,
      hourly: toHourlyFields([], h ?? {}),
    };
  }
  const time = h.time.map((t) => (typeof t === "string" ? t : String(t)));
  return {
    latitude: lat,
    longitude: lng,
    hourly: toHourlyFields(time, h),
  };
}

function toHourlyFields(time: string[], h: OpenMeteoHourly) {
  const n = time.length;
  return {
    time,
    waveHeight: asNumberArray(n, h.wave_height),
    waveDirection: asNumberArray(n, h.wave_direction),
    wavePeriod: asNumberArray(n, h.wave_period),
    windWaveHeight: asNumberArray(n, h.wind_wave_height),
    windWavePeriod: asNumberArray(n, h.wind_wave_period),
    swellWaveHeight: asNumberArray(n, h.swell_wave_height),
    swellWaveDirection: asNumberArray(n, h.swell_wave_direction),
    swellWavePeriod: asNumberArray(n, h.swell_wave_period),
  };
}

/** Stores raw + derived marine rows in one transaction (action calls this after fetch). */
export const ingestFromApiResponse = internalMutation({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.optional(v.string()),
    payload: v.string(),
    source: v.union(v.literal("api"), v.literal("mock")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const rawId = await ctx.db.insert("openMeteoRaw", {
      latitude: args.latitude,
      longitude: args.longitude,
      locationName: args.locationName,
      payload: args.payload,
      createdAt: now,
      source: args.source,
    });

    const parsed = parseOpenMeteoMarineFromPayload(args.payload);
    const forecastId = await ctx.db.insert("marineForecasts", {
      rawId,
      latitude: args.latitude,
      longitude: args.longitude,
      createdAt: now,
      hourly: parsed.hourly,
    });

    return { rawId, forecastId, latitude: args.latitude, longitude: args.longitude };
  },
});

/** Latest processed marine forecast for exact lat/lng (match saved user coordinates). */
export const getMarineForecastForLocation = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("marineForecasts")
      .withIndex("by_lat_lng_created", (q) =>
        q.eq("latitude", args.latitude).eq("longitude", args.longitude),
      )
      .order("desc")
      .first();
    if (!row) {
      return null;
    }
    return {
      _id: row._id,
      rawId: row.rawId,
      createdAt: row.createdAt,
      latitude: row.latitude,
      longitude: row.longitude,
      hourly: row.hourly,
    };
  },
});

/** Inspect raw ingests for debugging (optional). */
export const listRawIngestsForLocation = query({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const take = Math.min(args.limit ?? 5, 20);
    return await ctx.db
      .query("openMeteoRaw")
      .withIndex("by_lat_lng_created", (q) =>
        q.eq("latitude", args.latitude).eq("longitude", args.longitude),
      )
      .order("desc")
      .take(take);
  },
});
