import { notFound } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { ForecastCard } from "@/components/ForecastCard";
import { ForecastVsReality } from "@/components/ForecastVsReality";
import { TrustScore } from "@/components/TrustScore";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { SurfScoreBadge } from "@/components/SurfScoreBadge";
import { getBeach } from "@/data/beaches";
import { SEED_REPORTS } from "@/data/mockReports";
import { fetchForecast, fetchHourly } from "@/lib/openmeteo";
import { waveEmoji, windEmoji } from "@/lib/weather";
import { scoreLabel } from "@/lib/surfScore";
import { REPORT_META } from "@/lib/reportMeta";
import { ReportCTA } from "./ReportCTA";
import type { ReportKind } from "@/lib/types";

const USER_OPTS = { skillLevel: "intermediate" as const, preferredHeight: 1.2 };
export const revalidate = 900;

export default async function BeachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const beach = getBeach(id);
  if (!beach) notFound();

  const [forecast, hourly] = await Promise.all([
    fetchForecast(beach, USER_OPTS),
    fetchHourly(beach, USER_OPTS),
  ]);

  const reports = SEED_REPORTS.filter((r) => r.beachId === beach.id).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Derive "reality" from most recent report (or synthesise if none).
  const latestReport = reports[0];
  const realityEmoji = latestReport ? REPORT_META[latestReport.kind].emoji : "🤷";
  const realityLabel = latestReport ? REPORT_META[latestReport.kind].label : "No reports yet";
  const forecastEmoji = scoreLabel(forecast.surfScore).emoji;
  const forecastLabel = scoreLabel(forecast.surfScore).label;

  const verdict = buildVerdict(forecast.surfScore, latestReport?.kind);

  return (
    <AppShell>
      {/* Back link */}
      <Link href="/beaches" className="text-sm text-sky-600 font-medium">← All beaches</Link>

      {/* Title */}
      <div className="flex items-center gap-3 mt-1">
        <span className="text-4xl" aria-hidden>{beach.hero.emoji}</span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">{beach.name}</h1>
          <p className="text-sm text-slate-500">{beach.area}, {beach.country}</p>
        </div>
      </div>

      {/* Hero forecast */}
      <ForecastCard forecast={forecast} />

      {/* Report CTA */}
      <ReportCTA beachId={beach.id} beachName={beach.name} />

      {/* Trust score */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-sky-700 font-semibold">Beach trust</div>
            <div className="mt-1 text-sm text-slate-700">How often reality matches the forecast here.</div>
          </div>
          <div className="text-3xl" aria-hidden>🛡️</div>
        </div>
        <div className="mt-3">
          <TrustScore score={beach.trustScore} />
        </div>
      </Card>

      {/* Hourly */}
      {hourly.length > 0 ? (
        <div>
          <SectionHeader title="Next hours" emoji="⏳" />
          <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x">
            {hourly.map((h) => {
              const t = new Date(h.time);
              const hour = t.getHours();
              const label = `${hour}${hour < 12 ? "a" : "p"}`;
              return (
                <div
                  key={h.time}
                  className="min-w-[72px] snap-start rounded-2xl bg-white border border-slate-200 p-3 text-center shadow-[var(--shadow-soft)]"
                >
                  <div className="text-[11px] text-slate-500">{label}</div>
                  <div className="text-xl mt-0.5" aria-hidden>{waveEmoji(h.waveHeight)}</div>
                  <div className="text-sm font-semibold tabular-nums text-slate-900">{h.waveHeight.toFixed(1)}m</div>
                  <div className="text-[11px] text-slate-500 inline-flex items-center gap-0.5">
                    <span aria-hidden>{windEmoji(h.windSpeed)}</span>
                    <span className="tabular-nums">{h.windSpeed.toFixed(0)}kt</span>
                  </div>
                  <div className="mt-1">
                    <SurfScoreBadge score={h.surfScore} size="sm" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Forecast vs reality */}
      <div>
        <SectionHeader title="Forecast vs reality" emoji="🔍" />
        <ForecastVsReality
          forecastEmoji={forecastEmoji}
          forecastLabel={forecastLabel}
          realityEmoji={realityEmoji}
          realityLabel={realityLabel}
          verdict={verdict}
        />
      </div>

      {/* Reports for this beach */}
      <div>
        <SectionHeader title="Recent reports here" emoji="📝" />
        {reports.length === 0 ? (
          <Card className="text-center text-slate-500 text-sm">
            <div className="text-3xl" aria-hidden>🦀</div>
            <div className="mt-2">Be the first to post a report for {beach.name}.</div>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <ReportFeedCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function buildVerdict(score: number, lastKind?: ReportKind): string {
  if (!lastKind) return `Forecast says ${score}/100. No surfer reports yet — you could be first.`;
  if (lastKind === "perfect_session") return "Reality matches or beats the call. Trust the model here today.";
  if (lastKind === "no_waves" || lastKind === "smaller_than_predicted")
    return "Forecast may be overpredicted — recent reports say smaller than expected.";
  if (lastKind === "too_windy") return "Forecast score ignores the wind direction. Surfers say it's blown out.";
  if (lastKind === "too_crowded") return "Conditions are on, but it's getting crowded.";
  if (lastKind === "unsafe") return "Surfers flagged safety concerns — check before you paddle.";
  return "Reality roughly matches the forecast.";
}
