# Open-Meteo integration (SurfSignal)

This document describes how SurfSignal should use [Open-Meteo](https://open-meteo.com) for forecasts.  
Official reference: [Weather forecast API](https://open-meteo.com/en/docs) and [Marine weather API](https://open-meteo.com/en/docs/marine-weather-api).

**Verified (live docs, April 2026):** The bullet points below were checked against the parameter tables on those pages. If the marketing blurb and the table disagree, **trust the “API Documentation” table** (see marine `forecast_days` below).

## Licence and access

- **MVP / non-commercial:** Public endpoints, **no API key** required (see [Terms](https://open-meteo.com/en/terms); stay under the published daily call limits).
- **Commercial** or high volume: see [Pricing](https://open-meteo.com/en/pricing) and the `apikey` + `customer-` host pattern in the official docs.
- **Attribution:** Per Open-Meteo requirements, the product should credit Open-Meteo and the underlying data providers (e.g. DWD where applicable) in About / settings—see the citation block on each API doc page.

## Architecture: two APIs

| Need | API | Base URL |
|------|-----|----------|
| Swell / wind waves / combined sea state | [Marine Weather API](https://open-meteo.com/en/docs/marine-weather-api) | `https://marine-api.open-meteo.com/v1/marine` |
| Surface wind (speed and direction) at the beach | [Weather Forecast API](https://open-meteo.com/en/docs) | `https://api.open-meteo.com/v1/forecast` |

Swell, period, and wave height come from **Marine**.  
**Weather** supplies `wind_speed_10m` and `wind_direction_10m` (and optionally `current`) for onshore/offshore and “too windy” style logic, aligned with `SurfForecast` in `socialwaves/src/lib/types.ts`.

If either request fails, fall back to **mock** data so the demo still works (see `openmeteo.mdc`).

## Marine API — what we use

**Endpoint:** `GET https://marine-api.open-meteo.com/v1/marine`

**Coordinates:** WGS84 `latitude`, `longitude` (same as stored on each `Beach`).

**Suggested query parameters (MVP):**

| Parameter | Typical value | Notes |
|-----------|---------------|--------|
| `hourly` | Comma-separated list below | One request can request all at once. |
| `current` | Same variable names as needed | “Now” slice; useful for a summary card. |
| `timezone` | `auto` or e.g. `Europe/Lisbon` | If you use `daily=`, `timezone` is **required** for daily aggregations. |
| `forecast_days` | `7` (max **8**) | The marine API’s **parameter table** gives `Integer (0-8)` and “Up to 8 days of forecast are possible.” The same doc page’s intro line sometimes says “up to 16 days” (that text matches the **weather** API, not the marine `forecast_days` cap—ignore it for `/v1/marine`). |
| `past_days` | `0` | Range `0-92` per docs. |
| `length_unit` | `metric` | Wave heights in **meters** (matches `SurfForecast.waveHeight`). `imperial` is also available. |
| `cell_selection` | `sea` (default) | The marine API table’s **Default** column is `sea`. `land` and `nearest` are alternatives (same options as the weather API; semantics in the [marine docs](https://open-meteo.com/en/docs/marine-weather-api)). |

**Hourly / current variable names (snake_case, as in the API):**

- `wave_height` — significant wave height (m)
- `wave_direction` / `wave_period` — mean sea state
- `wind_wave_height`, `wind_wave_period`, `wind_wave_direction` — wind sea
- `swell_wave_height`, `swell_wave_period`, `swell_wave_direction` — primary swell
- Optional: `sea_surface_temperature` for UI copy

**Direction semantics (Marine):** directions are the direction **from which** waves come (0° = from north, 90° = from east), per Open-Meteo’s marine variable table.

**Response shape:** JSON with `hourly.time` and parallel arrays (e.g. `hourly.wave_height`), plus `hourly_units`. The returned `latitude` / `longitude` may differ slightly from the request (grid cell center).

**Errors:** HTTP 400 with JSON `{ "error": true, "reason": "..." }` for bad parameters. Typos in variable names fail at runtime—mirror names exactly from the [marine docs](https://open-meteo.com/en/docs/marine-weather-api).

## Weather Forecast API — wind only

**Endpoint:** `GET https://api.open-meteo.com/v1/forecast`

**Purpose for SurfSignal:** `wind_speed_10m` and `wind_direction_10m` in the same time range as the marine call so hourly rows can be joined by timestamp.

| Parameter | Typical value | Notes |
|-----------|---------------|--------|
| `hourly` | `wind_speed_10m,wind_direction_10m` | Add more later if the product needs them. |
| `wind_speed_unit` | `kn` | **Default in docs is `kmh`.** Set `kn` for knots to match `SurfForecast.windSpeed` in our types. Other values: `ms`, `mph`. |
| `timezone` | Same as Marine call | Aligns time arrays for merging. |
| `forecast_days` | `7` (up to **16**) | Per [weather API table](https://open-meteo.com/en/docs): `Integer (0-16)`, default 7. Can be longer than marine; **clip to the shorter series** when joining with Marine (max 8). |
| `cell_selection` | (default `land`) | Weather API default is `land` (DEM-based cell choice). For exposed beaches you usually keep the default. |
| `latitude`, `longitude` | Same as beach | |

**Direction semantics (Weather):** same meteorological convention as marine for wind—direction **from** which the wind blows.

**Units:** Use `wind_speed_unit` in the URL; do not hard-code conversion unless you change units in the request.

## Joining data for `SurfForecast` and `HourlyForecast`

1. Request Marine + Weather with the **same** `latitude`, `longitude`, and `timezone`.
2. Align rows by `hourly.time` (ISO strings should match 1:1 when parameters align).
3. Map into app types, for example:
   - `waveHeight` ← `swell_wave_height` or `wave_height` (product decision: “surfable swell” often uses swell fields)
   - `swellPeriod` ← `swell_wave_period`
   - `swellDirection` ← `swell_wave_direction`
   - `windSpeed` ← `wind_speed_10m` (with requested unit)
4. `surfScore` and `bestWindow` are **computed in app** (see `openmeteo.mdc`: skill, preferred height, wind).

## Example URLs (replace coordinates)

**Marine (hourly + current):**

```text
https://marine-api.open-meteo.com/v1/marine?latitude=38.7&longitude=-9.4&timezone=auto&length_unit=metric&forecast_days=7&hourly=wave_height,wave_period,swell_wave_height,swell_wave_period,swell_wave_direction&current=swell_wave_height,swell_wave_period
```

**Weather (wind, knots):**

```text
https://api.open-meteo.com/v1/forecast?latitude=38.7&longitude=-9.4&timezone=auto&forecast_days=7&wind_speed_unit=kn&hourly=wind_speed_10m,wind_direction_10m
```

## Operational notes

- **Rate limits / caching:** Cache per beach+time window in Convex or the Next.js layer to avoid duplicate calls and stay within fair use.
- **Model selection:** The public Marine API auto-selects models; optional `models` parameters exist in some Open-Meteo products—use only as documented.
- **Tides / `sea_level_height_msl`:** Marked as **not** for navigation; use only for soft UI, not safety-critical decisions.
- **Multi-spot requests:** Comma-separated `latitude=...&longitude=...` returns a **list** of result objects; our MVP can use one coordinate per request for simpler typing.

## Related repo files

- `.cursor/rules/openmeteo.mdc` — product rules (variables, mock fallback, surf score inputs)
- `socialwaves/src/lib/types.ts` — `SurfForecast`, `HourlyForecast`

## Further reading

- [Weather Forecast API (full parameter list)](https://open-meteo.com/en/docs)
- [Marine Weather API (full parameter list)](https://open-meteo.com/en/docs/marine-weather-api)
- [Model updates](https://open-meteo.com/en/docs/model-updates) — how often data refreshes
- [WMO weather codes](https://open-meteo.com/en/docs) (if you add conditions icons from the general forecast API)
