import type { Beach, SurfForecast, HourlyForecast, SkillLevel } from "./types";
import { computeSurfScore } from "./surfScore";

const MARINE = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER = "https://api.open-meteo.com/v1/forecast";

type MarineResp = {
  hourly?: {
    time: string[];
    wave_height: number[];
    wave_period: number[];
    swell_wave_height: number[];
    swell_wave_period: number[];
    swell_wave_direction: number[];
  };
};

type WeatherResp = {
  hourly?: {
    time: string[];
    wind_speed_10m: number[];
    cloud_cover: number[];
    precipitation: number[];
  };
};

function mockForecast(beach: Beach, opts: { skillLevel: SkillLevel; preferredHeight: number }): SurfForecast {
  const seed = beach.latitude + beach.longitude;
  const waveHeight = 0.6 + Math.abs(Math.sin(seed)) * 1.4;
  const swellPeriod = 7 + Math.abs(Math.cos(seed)) * 5;
  const windSpeed = 6 + Math.abs(Math.sin(seed * 2)) * 12;
  const surfScore = computeSurfScore({
    waveHeight,
    swellPeriod,
    windSpeed,
    skillLevel: opts.skillLevel,
    preferredHeight: opts.preferredHeight,
  });
  return {
    waveHeight: +waveHeight.toFixed(2),
    swellPeriod: +swellPeriod.toFixed(1),
    swellDirection: Math.round((seed * 73) % 360),
    windSpeed: +windSpeed.toFixed(1),
    surfScore,
    bestWindow: "7–10am",
    updatedAt: new Date().toISOString(),
    source: "mock",
  };
}

export async function fetchForecast(
  beach: Beach,
  opts: { skillLevel: SkillLevel; preferredHeight: number }
): Promise<SurfForecast> {
  try {
    const marineUrl = `${MARINE}?latitude=${beach.latitude}&longitude=${beach.longitude}&hourly=wave_height,wave_period,swell_wave_height,swell_wave_period,swell_wave_direction&timezone=auto&forecast_days=2`;
    const weatherUrl = `${WEATHER}?latitude=${beach.latitude}&longitude=${beach.longitude}&hourly=wind_speed_10m,cloud_cover,precipitation&wind_speed_unit=kn&timezone=auto&forecast_days=2`;
    const [mRes, wRes] = await Promise.all([
      fetch(marineUrl, { next: { revalidate: 1800 } }),
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
    ]);
    if (!mRes.ok || !wRes.ok) return mockForecast(beach, opts);
    const m: MarineResp = await mRes.json();
    const w: WeatherResp = await wRes.json();
    if (!m.hourly || !w.hourly) return mockForecast(beach, opts);
    // pick the nearest upcoming hour
    const now = Date.now();
    const idx = m.hourly.time.findIndex((t) => new Date(t).getTime() >= now);
    const i = idx === -1 ? 0 : idx;
    const waveHeight = m.hourly.swell_wave_height[i] ?? m.hourly.wave_height[i] ?? 0.8;
    const swellPeriod = m.hourly.swell_wave_period[i] ?? m.hourly.wave_period[i] ?? 8;
    const swellDirection = m.hourly.swell_wave_direction[i] ?? 270;
    const windSpeed = w.hourly.wind_speed_10m[i] ?? 10;
    const surfScore = computeSurfScore({
      waveHeight,
      swellPeriod,
      windSpeed,
      skillLevel: opts.skillLevel,
      preferredHeight: opts.preferredHeight,
    });
    return {
      waveHeight: +waveHeight.toFixed(2),
      swellPeriod: +swellPeriod.toFixed(1),
      swellDirection: Math.round(swellDirection),
      windSpeed: +windSpeed.toFixed(1),
      surfScore,
      bestWindow: bestWindowFrom(m.hourly.time, m.hourly.swell_wave_height, w.hourly.wind_speed_10m, opts),
      updatedAt: new Date().toISOString(),
      source: "open-meteo",
    };
  } catch {
    return mockForecast(beach, opts);
  }
}

export async function fetchHourly(
  beach: Beach,
  opts: { skillLevel: SkillLevel; preferredHeight: number }
): Promise<HourlyForecast[]> {
  try {
    const marineUrl = `${MARINE}?latitude=${beach.latitude}&longitude=${beach.longitude}&hourly=wave_height,swell_wave_height,swell_wave_period&timezone=auto&forecast_days=1`;
    const weatherUrl = `${WEATHER}?latitude=${beach.latitude}&longitude=${beach.longitude}&hourly=wind_speed_10m&wind_speed_unit=kn&timezone=auto&forecast_days=1`;
    const [mRes, wRes] = await Promise.all([
      fetch(marineUrl, { next: { revalidate: 1800 } }),
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
    ]);
    if (!mRes.ok || !wRes.ok) return [];
    const m: MarineResp = await mRes.json();
    const w: WeatherResp = await wRes.json();
    if (!m.hourly || !w.hourly) return [];
    const out: HourlyForecast[] = [];
    for (let i = 0; i < Math.min(m.hourly.time.length, 24); i += 2) {
      const waveHeight = m.hourly.swell_wave_height[i] ?? m.hourly.wave_height[i] ?? 0.8;
      const swellPeriod = m.hourly.swell_wave_period[i] ?? 8;
      const windSpeed = w.hourly.wind_speed_10m[i] ?? 10;
      const surfScore = computeSurfScore({
        waveHeight,
        swellPeriod,
        windSpeed,
        skillLevel: opts.skillLevel,
        preferredHeight: opts.preferredHeight,
      });
      out.push({
        time: m.hourly.time[i],
        waveHeight: +waveHeight.toFixed(2),
        swellPeriod: +swellPeriod.toFixed(1),
        windSpeed: +windSpeed.toFixed(1),
        surfScore,
      });
    }
    return out;
  } catch {
    return [];
  }
}

function bestWindowFrom(
  times: string[],
  waveHeights: number[],
  winds: number[],
  opts: { skillLevel: SkillLevel; preferredHeight: number }
): string {
  let bestI = 0;
  let bestScore = -1;
  for (let i = 0; i < Math.min(times.length, 18); i++) {
    const s = computeSurfScore({
      waveHeight: waveHeights[i] ?? 0.8,
      swellPeriod: 9,
      windSpeed: winds[i] ?? 10,
      skillLevel: opts.skillLevel,
      preferredHeight: opts.preferredHeight,
    });
    if (s > bestScore) {
      bestScore = s;
      bestI = i;
    }
  }
  const d = new Date(times[bestI] ?? times[0]);
  const end = new Date(d.getTime() + 2 * 3600 * 1000);
  const fmt = (x: Date) => `${x.getHours()}${x.getHours() < 12 ? "am" : "pm"}`;
  return `${fmt(d)}–${fmt(end)}`;
}
