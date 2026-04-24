# SurfSignal / SocialWave

**Forecasts predict. Surfers verify.**

A hackathon MVP that combines Open-Meteo marine forecasts with real surfer reports.

## Architecture

- **Next.js 16 / React 19 / Tailwind 4** — app at [socialwaves/](socialwaves/)
- **Convex** — reactive backend (beaches, forecasts cache, reports, favorites) in [socialwaves/convex/](socialwaves/convex/)
- **Open-Meteo** — Marine + Weather APIs, called from a Convex action with 30-min per-beach cache (see [docs/OPEN-METEO.md](docs/OPEN-METEO.md))
- **localStorage mock auth** — `src/lib/mockAuth.ts` (Convex Auth magic-link deferred until an email provider is wired)
- **Location** — client-side only via `src/lib/LocationProvider.tsx` per [.cursor/rules/location.mdc](.cursor/rules/location.mdc)

## Vercel (production)

The Git repository root is **not** the Next.js app. The app lives in [`socialwaves/`](socialwaves/). If Vercel’s **Root Directory** is left as `.` (repo root), builds either fail or produce an empty site, and **https://socialwaves.vercel.app/** can return **404**.

1. In Vercel: **Project → Settings → Build & Deployment → Root Directory** → set to **`socialwaves`** (Save).
2. Redeploy (or push a commit to trigger a new build).
3. Under **Environment Variables** (Production), point the Next.js app at your Convex deployment (same values as in `socialwaves/.env.local` after `npx convex dev`):

   **Option A — one backend for local + Vercel (Development deployment)**  
   Use this if you prefer a single Convex project/deployment and avoid mixing up prod vs dev URLs:
   - **`NEXT_PUBLIC_CONVEX_URL`** — e.g. `https://calm-bullfrog-11.convex.cloud`
   - **`NEXT_PUBLIC_CONVEX_SITE_URL`** — e.g. `https://calm-bullfrog-11.convex.site`  

   In the Convex dashboard, select that **Development** deployment and set **`SITE_URL`** to your live Next origin (e.g. `https://socialwaves.vercel.app/`) so magic links work from production.

   **Option B — separate Convex Production deployment**  
   Use the **Production** deployment’s `.convex.cloud` / `.convex.site` URLs instead, and set **`SITE_URL`** on that production deployment.

Resend / magic-link secrets belong on the **Convex** deployment you use (dev or prod), not Vercel (see comments in `socialwaves/.env.local`).

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
