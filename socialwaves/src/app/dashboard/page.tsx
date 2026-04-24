import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { BeachCard } from "@/components/BeachCard";
import { SurfScoreBadge } from "@/components/SurfScoreBadge";
import { AgentCard } from "@/components/AgentCard";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { BEACHES } from "@/data/beaches";
import { AGENT_INSIGHTS } from "@/data/agentInsights";
import { SEED_REPORTS } from "@/data/mockReports";
import { fetchForecast } from "@/lib/openmeteo";
import { waveEmoji } from "@/lib/weather";
import type { Beach, SurfForecast } from "@/lib/types";

/** Same IDs as `DEFAULT_USER.favoriteBeachIds` in mockAuth (server cannot import that client module). */
const FAVORITE_BEACH_IDS = ["tinos-kolymbithres", "vouliagmeni", "falassarna"] as const;
const favoriteIdSet = new Set<string>(FAVORITE_BEACH_IDS);

const USER_OPTS = { skillLevel: "intermediate" as const, preferredHeight: 1.2 };

export const revalidate = 900; // 15 min

export default async function DashboardPage() {
  const withForecasts = await Promise.all(
    BEACHES.map(async (b): Promise<{ beach: Beach; forecast: SurfForecast }> => ({
      beach: b,
      forecast: await fetchForecast(b, USER_OPTS),
    }))
  );

  const ranked = [...withForecasts].sort((a, b) => b.forecast.surfScore - a.forecast.surfScore);
  const best = ranked[0];
  const favorites = FAVORITE_BEACH_IDS.map((id) => withForecasts.find((x) => x.beach.id === id))
    .filter((x): x is { beach: Beach; forecast: SurfForecast } => Boolean(x));
  const latestReports = SEED_REPORTS.slice(0, 3);

  const greeting = buildGreeting(best.forecast.surfScore, best.beach.name);

  return (
    <AppShell greeting={greeting}>
      {/* Hero: best beach today */}
      <Link
        href={`/beach/${best.beach.id}`}
        className="block rounded-3xl p-6 bg-gradient-to-br from-sky-300 via-sky-200 to-sand-300 shadow-[var(--shadow-pop)] wave-drift active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-sky-900/80 font-semibold">Best today</span>
          <SurfScoreBadge score={best.forecast.surfScore} size="lg" />
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-5xl" aria-hidden>{best.beach.hero.emoji}</span>
          <div>
            <div className="text-2xl font-bold text-slate-900 leading-tight">{best.beach.name}</div>
            <div className="text-sm text-slate-700">{best.beach.area}, {best.beach.country}</div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-slate-800">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>{waveEmoji(best.forecast.waveHeight)}</span>
            <span className="font-semibold tabular-nums">{best.forecast.waveHeight.toFixed(1)}m</span>
          </span>
          <span>·</span>
          <span>Window <strong className="font-semibold">{best.forecast.bestWindow}</strong></span>
        </div>
      </Link>

      {/* Agent insights carousel */}
      <div>
        <SectionHeader title="Agents on it" emoji="🤖" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x">
          {AGENT_INSIGHTS.slice(0, 3).map((i) => (
            <div key={i.id} className="min-w-[85%] snap-start">
              <AgentCard insight={i} />
            </div>
          ))}
        </div>
      </div>

      {/* Favorites */}
      <div>
        <SectionHeader
          title="Your favorites"
          emoji="⭐"
          action={<Link href="/beaches">All beaches →</Link>}
        />
        <div className="space-y-3">
          {favorites.map(({ beach, forecast }) => (
            <BeachCard key={beach.id} beach={beach} forecast={forecast} />
          ))}
        </div>
      </div>

      {/* Top-ranked other beaches */}
      <div>
        <SectionHeader title="More spots" emoji="🏖️" />
        <div className="space-y-3">
          {ranked
            .filter((r) => !favoriteIdSet.has(r.beach.id))
            .slice(0, 3)
            .map(({ beach, forecast }) => (
              <BeachCard key={beach.id} beach={beach} forecast={forecast} />
            ))}
        </div>
      </div>

      {/* Latest reports */}
      <div>
        <SectionHeader
          title="Surfer reports"
          emoji="📝"
          action={<Link href="/reports">See all →</Link>}
        />
        <div className="space-y-3">
          {latestReports.map((r) => (
            <ReportFeedCard key={r.id} report={r} />
          ))}
        </div>
      </div>

      {/* Tagline */}
      <Card className="bg-gradient-to-br from-sand-100 to-sand-200 border-sand-200 text-center">
        <div className="text-3xl" aria-hidden>🦀</div>
        <div className="mt-2 text-sm font-semibold text-sand-800">Forecasts predict. Surfers verify.</div>
        <div className="text-xs text-sand-700">The Waze of surfing.</div>
      </Card>
    </AppShell>
  );
}

function buildGreeting(score: number, beachName: string): string {
  if (score >= 80) return `🔥 It's ON at ${beachName} — drop everything.`;
  if (score >= 65) return `🤙 ${beachName} is going off. Worth the drive.`;
  if (score >= 45) return `🏄 ${beachName} looks paddle-worthy today.`;
  if (score >= 25) return `😐 Marginal day — check ${beachName} anyway.`;
  return `💤 Flat everywhere. Maybe a skate day?`;
}
