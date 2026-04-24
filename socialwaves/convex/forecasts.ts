import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

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

function bestWindowStr(h: Doc<"marineForecasts">["hourly"], nowMs: number): string {
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
  const bestWindow = bestWindowStr(h, nowMs);
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

