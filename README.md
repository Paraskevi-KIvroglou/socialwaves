# SurfSignal / SocialWave

**Forecasts predict. Surfers verify.**

A hackathon MVP that combines Open-Meteo marine forecasts with real surfer reports.

## Architecture

- **Next.js 16 / React 19 / Tailwind 4** — app at [socialwaves/](socialwaves/)
- **Convex** — reactive backend (beaches, forecasts cache, reports, favorites) in [socialwaves/convex/](socialwaves/convex/)
- **Open-Meteo** — Marine + Weather APIs, called from a Convex action with 30-min per-beach cache (see [docs/OPEN-METEO.md](docs/OPEN-METEO.md))
- **localStorage mock auth** — `src/lib/mockAuth.ts` (Convex Auth magic-link deferred until an email provider is wired)
- **Location** — client-side only via `src/lib/LocationProvider.tsx` per [.cursor/rules/location.mdc](.cursor/rules/location.mdc)

## Setup

```bash
cd socialwaves
npm install
npx convex dev --once         # creates .env.local with NEXT_PUBLIC_CONVEX_URL
npm run seed:beaches          # loads 192 spots from data/ into Convex + seeds demo reports
npm run dev                   # next dev
# in another terminal, keep convex live:
npm run convex                # convex dev (watches convex/ and pushes)
```

Open http://localhost:3000 — you'll land on `/dashboard`.

## Data

The canonical beach list is [data/surf_spots_offshore_coordinates.csv](data/surf_spots_offshore_coordinates.csv) (192 spots). The seed script slugs them as `spot-<id>-<kebab-name>` and writes them to the `beaches` table.

## Routes

- `/login` — mock sign-in (localStorage)
- `/dashboard` — best beach today, favorites, recent reports, agent insights
- `/beaches` — full 192-spot directory, distance-sorted when location is granted
- `/beach/[slug]` — forecast, forecast-vs-reality, report feed, report CTA
- `/map` — leaflet map of every spot
- `/reports` — global community feed
- `/analytics` — your session stats
- `/profile` — preferences + favorites + sign out

## Convex modules

- `convex/schema.ts` — `beaches`, `forecasts`, `reports`, `favorites`
- `convex/beaches.ts` — `listAll`, `getBySlug`, `upsertMany`
- `convex/forecasts.ts` — `getCached` (30-min TTL), `refresh` / `refreshMany` actions (Open-Meteo + mock fallback), `writeForecast` internal mutation
- `convex/reports.ts` — `listForBeach`, `listForHandle`, `listRecent`, `create`, `seedIfEmpty`
- `convex/favorites.ts` — `list`, `toggle`

## Deferred

- Convex Auth magic link (no email provider wired yet — skipped Resend for now)
- Per-user server-side preferences (skill, preferred wave height) — stays in localStorage until auth lands
