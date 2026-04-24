# Social Waves

A Next.js 16 + Convex + Convex Auth (Resend magic link) app.

## Local development

```bash
pnpm install
pnpm convex   # in one terminal: starts Convex dev deployment
pnpm dev      # in another:    starts Next.js on http://localhost:3000
```

Required env in `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://<your-dev-deployment>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://<your-dev-deployment>.convex.site
```

Convex deployment env vars (set with `npx convex env set ...` in the matching deployment):

```
SITE_URL=http://localhost:3000        # for dev; the deployed app URL in prod
AUTH_RESEND_KEY=re_xxx                # Resend API key
AUTH_RESEND_FROM=Social Waves <noreply@yourdomain.com>
```

## Deploy on Vercel

The Next app lives at the **repo root** (no subdirectory).

1. Vercel → **New Project** → import this repo.
2. **Root Directory** = `./` (default). Do **not** set it to `socialwaves`.
3. Framework preset: **Next.js** (auto‑detected).
4. **Environment Variables** (Production scope):
   - `NEXT_PUBLIC_CONVEX_URL` → your prod Convex URL
   - `NEXT_PUBLIC_CONVEX_SITE_URL` → your prod Convex site URL
5. In Convex (prod deployment), set:
   - `SITE_URL=https://<your-vercel-domain>`
   - `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`
6. Push to `main` → Vercel builds and deploys.

### Preview deployments

- Push any branch other than `main`. Vercel creates a preview URL.
- Add the same env vars under the **Preview** scope (you can reuse the dev Convex deployment for previews; just set `SITE_URL` on that Convex deployment to the preview URL or `*` once you confirm the flow).
- If a preview returns **401**, check **Settings → Deployment Protection** and allow public access for previews.

### Notes

- This project uses Next.js 16's `src/proxy.ts` (replaces the deprecated `middleware.ts`) to wire up Convex Auth on the edge.
- Convex functions live in `convex/` at the repo root and are deployed by `npx convex deploy` (CI) or `pnpm convex` (local dev).
