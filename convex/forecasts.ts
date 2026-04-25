import { v } from "convex/values";
import { action, query, type ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";

const MARINE = "https://marine-api.open-meteo.com/v1/marine";
const HOURLY =
  "wave_height,wave_direction,wave_period,wind_wave_height,wind_wave_period,swell_wave_height,swell_wave_direction,swell_wave_period";

// nudge points around (lat, lon) in a ~1km radius. 1 deg latitude ~= 111km,
// so 1km ~= 0.009 deg; longitude is shortened by cos(lat).
function nearbyProbes(lat: number, lon: number): Array<{ lat: number; lon: number }> {
  const probes: Array<{ lat: number; lon: number }> = [{ lat, lon }];
  const latStep = 0.009; // ~1km
  const lonStep = 0.009 / Math.max(0.1, Math.cos((lat * Math.PI) / 180));
  const rings = [1, 2]; // 1km then 2km
  const dirs = [
    [0, 1], [1, 1], [1, 0], [1, -1],
    [0, -1], [-1, -1], [-1, 0], [-1, 1],
  ] as const;
  for (const r of rings) {
    for (const [dLat, dLon] of dirs) {
      probes.push({ lat: lat + dLat * latStep * r, lon: lon + dLon * lonStep * r });
    }
  }
  return probes;
}

type MarineJson = {
  error?: boolean;
  reason?: string;
  hourly?: {
    time?: string[];
    wave_height?: number[];
    wave_period?: number[];
    swell_wave_height?: number[];
    swell_wave_period?: number[];
    swell_wave_direction?: number[];
  };
};

async function fetchMarineWithFallback(
  baseLat: number,
  baseLon: number,
): Promise<{ marine: MarineJson; lat: number; lon: number } | null> {
  for (const p of nearbyProbes(baseLat, baseLon)) {
    const url = `${MARINE}?latitude=${p.lat}&longitude=${p.lon}&hourly=${HOURLY}&timezone=auto&forecast_days=2&length_unit=metric&cell_selection=sea`;
    let res: Response;
    try {
      res = await fetch(url);
    } catch {
      continue;
    }
    if (!res.ok) continue;
    const json = (await res.json()) as MarineJson;
    if (json.error) continue;
    const sh = json.hourly?.swell_wave_height ?? [];
    const wh = json.hourly?.wave_height ?? [];
    const hasData =
      sh.some((x) => typeof x === "number" && !Number.isNaN(x)) ||
      wh.some((x) => typeof x === "number" && !Number.isNaN(x));
    if (!hasData) continue;
    return { marine: json, lat: p.lat, lon: p.lon };
  }
  return null;
}

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

/** shared by `refreshMarineForecast` and `beaches` slug-based actions (re-exported from `openMeteoActions`) */
export async function refreshMarineHandler(
  ctx: ActionCtx,
  args: RefreshArgs,
): Promise<RefreshResult> {
  let source: "api" | "mock" = "api";
  let payload: string;
  try {
    const r = await fetchMarineWithFallback(args.latitude, args.longitude);
    if (!r) {
      throw new Error("no sea cell");
    }
    payload = JSON.stringify(r.marine);
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
 * fetches open-meteo marine, stores the raw response in one table, and runs backend parsing
 * into `marineForecasts`. on failure, stores mock json so the demo still works.
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

/**
 * Heuristic: marine ingest does not store weather API wind; map wind-wave energy to kt band.
 */
function estWindKnots(wwh: number | undefined): number {
  if (wwh == null || Number.isNaN(wwh)) return 10;
  return Math.min(34, Math.max(4, 6 + wwh * 38));
}

function pickHourIndex(time: string[], nowMs: number): number {
  const idx = time.findIndex((t) => new Date(t).getTime() >= nowMs);
  return idx === -1 ? 0 : idx;
}

function bestWindowStr(h: Doc<"marineForecasts">["hourly"]): string {
  const { time, swellWaveHeight, waveHeight, windWaveHeight } = h;
  const n = Math.min(18, time.length);
  if (n === 0) return "7–10am";
  const winds = Array.from(
    { length: n },
    (_, i) => estWindKnots(windWaveHeight[i]),
  );
  const heights = Array.from(
    { length: n },
    (_, i) => (swellWaveHeight[i] ?? waveHeight[i] ?? 0) as number,
  );
  let bestI = 0;
  let bestS = -1;
  for (let i = 0; i < n; i++) {
    const w = winds[i] ?? 10;
    const wh = heights[i] ?? 0.5;
    const s = wh * 50 - w * 2;
    if (s > bestS) {
      bestS = s;
      bestI = i;
    }
  }
  const d = new Date(time[bestI]!);
  if (Number.isNaN(d.getTime())) return "7–10am";
  const end = new Date(d.getTime() + 2 * 3600 * 1000);
  const fmt = (x: Date) => `${x.getHours()}${x.getHours() < 12 ? "am" : "pm"}`;
  return `${fmt(d)}–${fmt(end)}`;
}

function toCached(
  m: Doc<"marineForecasts">,
  raw: Doc<"openMeteoRaw"> | null,
  nowMs: number,
) {
  const h = m.hourly;
  const i = pickHourIndex(h.time, nowMs);
  const waveHeight = h.swellWaveHeight[i] ?? h.waveHeight[i] ?? 0.8;
  const swellPeriod = h.swellWavePeriod[i] ?? h.wavePeriod[i] ?? 8;
  const swellDirection = Math.round(
    h.swellWaveDirection[i] ?? h.waveDirection[i] ?? 200,
  );
  const windSpeed = estWindKnots(h.windWaveHeight[i]);
  const bestWindow = bestWindowStr(h);
  const source: "open-meteo" | "mock" =
    raw?.source === "api" ? "open-meteo" : "mock";
  return {
    waveHeight: +Number(waveHeight).toFixed(2),
    swellPeriod: +Number(swellPeriod).toFixed(1),
    swellDirection,
    windSpeed: +Number(windSpeed).toFixed(1),
    bestWindow,
    updatedAt: new Date(m.createdAt).toISOString(),
    source,
  };
}

export const getCached = query({
  args: { beachSlug: v.string() },
  handler: async (ctx, { beachSlug }) => {
    const beach = await ctx.db
      .query("beaches")
      .withIndex("by_slug", (q) => q.eq("slug", beachSlug))
      .unique();
    if (!beach) return null;
    const m = await ctx.db
      .query("marineForecasts")
      .withIndex("by_lat_lng_created", (q) =>
        q.eq("latitude", beach.latitude).eq("longitude", beach.longitude),
      )
      .order("desc")
      .first();
    if (!m) return null;
    const raw: Doc<"openMeteoRaw"> | null = await ctx.db.get(
      m.rawId as Id<"openMeteoRaw">,
    );
    return toCached(m, raw, Date.now());
  },
});
