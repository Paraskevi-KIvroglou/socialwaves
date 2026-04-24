"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { ForecastCard } from "@/components/ForecastCard";
import { ForecastVsReality } from "@/components/ForecastVsReality";
import { TrustScore } from "@/components/TrustScore";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { ReportSheet } from "@/components/ReportSheet";
import { SectionHeader } from "@/components/SectionHeader";
import { computeSurfScore, scoreLabel } from "@/lib/surfScore";
import { getSession, DEFAULT_USER } from "@/lib/mockAuth";
import { useFavorites } from "@/lib/useFavorites";
import { REPORT_META } from "@/lib/reports";
import { waveEmoji, windLabel } from "@/lib/weather";
import type { ReportKind, SurfForecast } from "@/lib/types";
import type { FunctionReturnType } from "convex/server";

type BeachReportRow = NonNullable<FunctionReturnType<typeof api.reports.listForBeach>>[number];

function dominantKind(
  reports: Array<{ kind: ReportKind; createdAt: number }>
): ReportKind | null {
  if (!reports.length) return null;
  const freq = new Map<ReportKind, number>();
  for (const r of reports) freq.set(r.kind, (freq.get(r.kind) ?? 0) + 1);
  let top = 0;
  for (const c of freq.values()) top = Math.max(top, c);
  const topKinds = [...freq.entries()].filter(([, c]) => c === top).map(([k]) => k);
  const pool = reports.filter((r) => topKinds.includes(r.kind));
  pool.sort((a, b) => b.createdAt - a.createdAt);
  return pool[0]?.kind ?? null;
}

function verdictLine(score: number, kind: ReportKind | null): string {
  const meta = kind ? REPORT_META[kind] : null;
  const forecastGood = score >= 55;
  const realityPositive = meta?.tone === "positive" || meta?.tone === "hero";
  const realityNegative = meta?.tone === "negative";
  if (!kind)
    return `Forecast scores ${score}/100. No crowd signal yet — drop a report after you surf.`;
  if (forecastGood && realityPositive) return "Forecast and recent reports both look promising.";
  if (forecastGood && realityNegative)
    return "Model is upbeat but surfers recently disagreed — worth a skeptical look.";
  if (!forecastGood && realityPositive)
    return "Forecast is muted while surfers report fun — could punch above the score.";
  if (!forecastGood && realityNegative) return "Forecast and reports both suggest a quieter day.";
  return "Mixed signals — scan the latest notes before you commit.";
}

export default function BeachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slug } = use(params);
  const user = getSession() ?? DEFAULT_USER;
  const { favoriteSlugs, toggle, handle } = useFavorites();
  const beach = useQuery(api.beaches.getBySlug, { slug });
  const forecast = useQuery(api.forecasts.getCached, { beachSlug: slug });
  const reports = useQuery(api.reports.listForBeach, { beachSlug: slug, limit: 20 });
  const refresh = useAction(api.forecasts.refresh);
  const refreshOnce = useRef(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    refreshOnce.current = false;
  }, [slug]);

  useEffect(() => {
    if (beach === undefined || beach === null) return;
    if (forecast === undefined) return;
    if (forecast !== null) return;
    if (refreshOnce.current) return;
    refreshOnce.current = true;
    void refresh({ beachSlug: slug });
  }, [beach, forecast, refresh, slug]);

  const domKind = useMemo(
    () => (reports ? dominantKind(reports) : null),
    [reports]
  );

  const uiForecast: SurfForecast | null = useMemo(() => {
    if (!forecast) return null;
    const surfScore = computeSurfScore({
      waveHeight: forecast.waveHeight,
      swellPeriod: forecast.swellPeriod,
      windSpeed: forecast.windSpeed,
      skillLevel: user.skillLevel,
      preferredHeight: user.preferredWaveHeight,
    });
    return {
      waveHeight: forecast.waveHeight,
      swellPeriod: forecast.swellPeriod,
      swellDirection: forecast.swellDirection,
      windSpeed: forecast.windSpeed,
      surfScore,
      bestWindow: forecast.bestWindow,
      updatedAt: forecast.updatedAt,
      source: forecast.source,
    };
  }, [forecast, user.skillLevel, user.preferredWaveHeight]);

  const forecastSummary =
    forecast && uiForecast
      ? `${forecast.waveHeight.toFixed(1)}m swell, ${windLabel(forecast.windSpeed)} wind`
      : "—";
  const forecastEmoji =
    uiForecast !== null
      ? scoreLabel(uiForecast.surfScore).emoji
      : forecast
        ? waveEmoji(forecast.waveHeight)
        : "🫧";
  const realityMeta = domKind ? REPORT_META[domKind] : null;
  const realityLabel = realityMeta?.label ?? "No reports yet";
  const realityEmoji = realityMeta?.emoji ?? "🤷";
  const verdict =
    uiForecast && forecast
      ? verdictLine(uiForecast.surfScore, domKind)
      : "Loading forecast…";

  if (beach === undefined) {
    return (
      <AppShell greeting="Beach">
        <div className="animate-pulse space-y-4 px-1">
          <div className="h-6 bg-slate-200 rounded w-1/2" />
          <div className="h-40 bg-slate-100 rounded-3xl" />
          <div className="h-24 bg-slate-100 rounded-2xl" />
        </div>
      </AppShell>
    );
  }

  if (beach === null) {
    return (
      <AppShell greeting="Beach">
        <p className="text-slate-600 text-sm">
          This beach isn&apos;t in SurfSignal yet. Check the slug or browse all spots.
        </p>
        <Link href="/beaches" className="text-sky-600 font-medium text-sm">
          ← All beaches
        </Link>
      </AppShell>
    );
  }

  const favorited = favoriteSlugs.includes(slug);

  return (
    <AppShell greeting={beach.name}>
      <Link href="/beaches" className="text-sm text-sky-600 font-medium">
        ← All beaches
      </Link>

      <div className="flex items-start justify-between gap-2 mt-1">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-4xl shrink-0" aria-hidden>
            {beach.heroEmoji}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{beach.name}</h1>
            <p className="text-sm text-slate-500">
              {beach.area}, {beach.country}
            </p>
          </div>
        </div>
        <button
          type="button"
          aria-label={favorited ? "Remove favorite" : "Add favorite"}
          onClick={() => void toggle(slug)}
          disabled={!handle}
          className="shrink-0 h-11 w-11 rounded-2xl border border-slate-200 bg-white text-xl leading-none shadow-[var(--shadow-soft)] disabled:opacity-40"
        >
          {favorited ? "★" : "☆"}
        </button>
      </div>

      {uiForecast ? <ForecastCard forecast={uiForecast} /> : (
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
          Pulling fresh marine data…
        </section>
      )}

      <div>
        <SectionHeader title="Beach trust" emoji="🛡️" />
        <TrustScore score={beach.trustScore} />
      </div>

      <div>
        <SectionHeader title="Forecast vs reality" emoji="🔍" />
        <ForecastVsReality
          forecastEmoji={forecastEmoji}
          forecastLabel={forecastSummary}
          realityEmoji={realityEmoji}
          realityLabel={realityLabel}
          verdict={verdict}
        />
      </div>

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="w-full rounded-2xl bg-sky-500 text-white font-semibold py-4 shadow-[var(--shadow-soft)] active:scale-[0.99] transition-transform"
      >
        How&apos;s it surfing?
      </button>

      <ReportSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        beachId={slug}
        beachName={beach.name}
      />

      <div>
        <SectionHeader title="Recent reports here" emoji="📝" />
        <div className="space-y-3">
          {reports?.map((r: BeachReportRow) => (
            <ReportFeedCard
              key={r._id}
              report={{
                beachSlug: r.beachSlug,
                kind: r.kind,
                note: r.note,
                createdAt: r.createdAt,
                userHandle: r.userHandle,
              }}
              beachName={beach.name}
              beachArea={beach.area}
            />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
