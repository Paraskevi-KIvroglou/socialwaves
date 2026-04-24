import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { action, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";

const HOURLY =
  "wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period";

function mockMarineJson(lat: number, lng: number) {
  const t0 = new Date();
  t0.setUTCHours(0, 0, 0, 0);
  const time: string[] = [];
  for (let i = 0; i < 48; i++) {
    const d = new Date(t0);
    d.setUTCHours(d.getUTCHours() + i);
    time.push(d.toISOString().replace(/\.\d{3}Z$/, ""));
  }
  return JSON.stringify({
    latitude: lat,
    longitude: lng,
    generationtime_ms: 0,
    utc_offset_seconds: 0,
    timezone: "GMT",
    timezone_abbreviation: "GMT",
    elevation: 0,
    hourly_units: {
      time: "iso8601",
      wave_height: "m",
      wave_direction: "°",
      wave_period: "s",
    },
    hourly: {
      time,
      wave_height: time.map((_, i) => 0.6 + 0.05 * Math.sin(i / 3)),
      wave_direction: time.map((_, i) => (180 + i * 2) % 360),
      wave_period: time.map((_, i) => 8 + (i % 4)),
      wind_wave_height: time.map((_, i) => 0.2 + 0.02 * i),
      wind_wave_period: time.map((_, i) => 4 + (i % 3)),
      swell_wave_height: time.map((_, i) => 0.5 + 0.04 * Math.sin(i / 2)),
      swell_wave_direction: time.map((_, i) => (190 + i) % 360),
      swell_wave_period: time.map((_, i) => 10 + (i % 2)),
    },
  });
}

type RefreshArgs = {
  latitude: number;
  longitude: number;
  locationName?: string;
};

type RefreshResult = {
  rawId: Id<"openMeteoRaw">;
  forecastId: Id<"marineForecasts">;
  latitude: number;
  longitude: number;
};

/** Shared by `refreshMarineForecast` and `forecasts` slug-based actions (avoids circular `api` imports). */
export async function refreshMarineHandler(
  ctx: ActionCtx,
  args: RefreshArgs,
): Promise<RefreshResult> {
  const url = new URL("https://marine-api.open-meteo.com/v1/marine");
  url.searchParams.set("latitude", String(args.latitude));
  url.searchParams.set("longitude", String(args.longitude));
  url.searchParams.set("hourly", HOURLY);

  let source: "api" | "mock" = "api";
  let payload: string;
  try {
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(String(res.status));
    }
    const json: unknown = await res.json();
    payload = JSON.stringify(json);
  } catch {
    source = "mock";
    payload = mockMarineJson(args.latitude, args.longitude);
  }

  return await ctx.runMutation(internal.openMeteo.ingestFromApiResponse, {
    latitude: args.latitude,
    longitude: args.longitude,
    locationName: args.locationName,
    payload,
    source,
  });
}

/**
 * Fetches Open-Meteo Marine, stores the **raw** response in one table, and runs backend parsing
 * into `marineForecasts`. On failure, stores mock JSON so the demo still works.
 */
export const refreshMarineForecast = action({
  args: {
    latitude: v.number(),
    longitude: v.number(),
    locationName: v.optional(v.string()),
  },
  returns: v.object({
    rawId: v.id("openMeteoRaw"),
    forecastId: v.id("marineForecasts"),
    latitude: v.number(),
    longitude: v.number(),
  }),
  handler: async (ctx, args) => refreshMarineHandler(ctx, args),
});
