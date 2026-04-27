"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { BeachCard } from "@/components/BeachCard";
import { ForecastCard } from "@/components/ForecastCard";
import { AgentCard } from "@/components/AgentCard";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { LocationGate } from "@/components/LocationGate";
import { SectionHeader } from "@/components/SectionHeader";
import { AGENT_INSIGHTS } from "@/data/agentInsights";
import { toUiBeach, type ConvexBeach } from "@/lib/beachUi";
import { computeSurfScore } from "@/lib/surfScore";
import { greetingName } from "@/lib/greetingName";
import { getSession, DEFAULT_USER } from "@/lib/mockAuth";
import { useFavorites } from "@/lib/useFavorites";
import { useLocation } from "@/lib/LocationProvider";
import { haversineKm, formatDistanceKm } from "@/lib/location";
import type { SkillLevel, SurfForecast } from "@/lib/types";
import type { FunctionReturnType } from "convex/server";

type CachedForecast = NonNullable<FunctionReturnType<typeof api.forecasts.getCached>>;
type RecentReportRow = NonNullable<FunctionReturnType<typeof api.reports.listRecent>>[number];

function buildSurfForecast(
  raw: CachedForecast,
  skillLevel: SkillLevel,
  preferredHeight: number
): SurfForecast {
  const surfScore = computeSurfScore({
    waveHeight: raw.waveHeight,
    swellPeriod: raw.swellPeriod,
    windSpeed: raw.windSpeed,
    skillLevel,
    preferredHeight,
  });
  return {
    waveHeight: raw.waveHeight,
    swellPeriod: raw.swellPeriod,
    swellDirection: raw.swellDirection,
    windSpeed: raw.windSpeed,
    surfScore,
    bestWindow: raw.bestWindow,
    updatedAt: raw.updatedAt,
    source: raw.source,
  };
}

function BeachCardFromConvex({
  row,
  skillLevel,
  preferredHeight,
}: {
  row: ConvexBeach;
  skillLevel: SkillLevel;
  preferredHeight: number;
}) {
  const forecast = useQuery(api.forecasts.getCached, { beachSlug: row.slug });
  const beach = toUiBeach(row);
  const surfForecast =
    forecast === undefined || forecast === null
      ? undefined
      : buildSurfForecast(forecast, skillLevel, preferredHeight);
  return <BeachCard beach={beach} forecast={surfForecast} />;
}

function BestTodayForecast({
  slugs,
  skillLevel,
  preferredHeight,
}: {
  slugs: string[];
  skillLevel: SkillLevel;
  preferredHeight: number;
}) {
  const padded = useMemo(() => {
    const s = [...slugs.slice(0, 8)];
    while (s.length < 8) s.push("");
    return s;
  }, [slugs]);

  const q0 = useQuery(api.forecasts.getCached, padded[0] ? { beachSlug: padded[0] } : "skip");
  const q1 = useQuery(api.forecasts.getCached, padded[1] ? { beachSlug: padded[1] } : "skip");
  const q2 = useQuery(api.forecasts.getCached, padded[2] ? { beachSlug: padded[2] } : "skip");
  const q3 = useQuery(api.forecasts.getCached, padded[3] ? { beachSlug: padded[3] } : "skip");
  const q4 = useQuery(api.forecasts.getCached, padded[4] ? { beachSlug: padded[4] } : "skip");
  const q5 = useQuery(api.forecasts.getCached, padded[5] ? { beachSlug: padded[5] } : "skip");
  const q6 = useQuery(api.forecasts.getCached, padded[6] ? { beachSlug: padded[6] } : "skip");
  const q7 = useQuery(api.forecasts.getCached, padded[7] ? { beachSlug: padded[7] } : "skip");

  const best = useMemo(() => {
    const queries = [q0, q1, q2, q3, q4, q5, q6, q7];
    const entries = padded
      .map((slug, i) => ({ slug, raw: queries[i] }))
      .filter(
        (x): x is { slug: string; raw: CachedForecast } =>
          Boolean(x.slug) && x.raw !== undefined && x.raw !== null
      );
    let top: SurfForecast | null = null;
    for (const { raw } of entries) {
      const sf = buildSurfForecast(raw, skillLevel, preferredHeight);
      if (!top || sf.surfScore > top.surfScore) top = sf;
    }
    return top;
  }, [padded, q0, q1, q2, q3, q4, q5, q6, q7, skillLevel, preferredHeight]);

  if (!best) {
    return (
      <section className="rounded-3xl border border-slate-200 bg-slate-50/90 p-8 text-center text-slate-600 shadow-[var(--shadow-soft)]">
        Checking today&apos;s conditions…
      </section>
    );
  }

  return <ForecastCard forecast={best} />;
}

export default function DashboardPage() {
  const localSession = getSession();
  const user = localSession ?? DEFAULT_USER;
  const me = useQuery(api.users.getMyProfile);
  const { favoriteSlugs } = useFavorites();
  const { location } = useLocation();
  const beaches = useQuery(api.beaches.listAll);
  const recentReports = useQuery(api.reports.listRecent, { limit: 5 });
  const refreshMany = useAction(api.beaches.refreshManyByBeachSlugs);
  const refreshedRef = useRef(false);

  const skillLevel = user.skillLevel;
  const preferredHeight = user.preferredWaveHeight;

  const topSlugs = useMemo(
    () => (beaches ? beaches.slice(0, 8).map((b: ConvexBeach) => b.slug) : []),
    [beaches]
  );

  useEffect(() => {
    if (!beaches?.length || refreshedRef.current) return;
    refreshedRef.current = true;
    void refreshMany({
      beachSlugs: beaches.slice(0, 8).map((b: ConvexBeach) => b.slug),
    });
  }, [beaches, refreshMany]);

  const beachBySlug = useMemo(() => {
    const m = new Map<string, ConvexBeach>();
    if (!beaches) return m;
    for (const b of beaches as ConvexBeach[]) m.set(b.slug, b);
    return m;
  }, [beaches]);

  const favoriteRows = useMemo(() => {
    if (!beaches) return [];
    const set = new Set(favoriteSlugs);
    return (beaches as ConvexBeach[]).filter((b) => set.has(b.slug));
  }, [beaches, favoriteSlugs]);

  const nearestRows = useMemo(() => {
    if (!beaches) return [] as Array<{ row: ConvexBeach; km: number | null }>;
    const list = (beaches as ConvexBeach[]).map((row) => ({
      row,
      km: location
        ? haversineKm({ latitude: row.latitude, longitude: row.longitude }, location)
        : null,
    }));
    if (location) list.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
    return list.slice(0, 5);
  }, [beaches, location]);

  return (
    <AppShell
      greeting={`Hey ${greetingName(localSession, me)} 🌊`}
    >
      <LocationGate />
      <BestTodayForecast slugs={topSlugs} skillLevel={skillLevel} preferredHeight={preferredHeight} />

      <div>
        <SectionHeader
          title={location ? "Nearest to you" : "Nearby spots"}
          emoji="📍"
          action={
            location && nearestRows[0]?.km != null ? (
              <span className="text-slate-500 text-xs">
                Closest {formatDistanceKm(nearestRows[0].km)}
              </span>
            ) : (
              <Link href="/map">On the map →</Link>
            )
          }
        />
        {nearestRows.length === 0 ? (
          <p className="text-sm text-slate-600 px-1">Loading beaches…</p>
        ) : (
          <div className="space-y-3">
            {nearestRows.map(({ row }) => (
              <BeachCardFromConvex
                key={row.slug}
                row={row}
                skillLevel={skillLevel}
                preferredHeight={preferredHeight}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader
          title="Your favorites"
          emoji="⭐"
          action={<Link href="/beaches">All beaches →</Link>}
        />
        {favoriteRows.length === 0 ? (
          <p className="text-sm text-slate-600 px-1">Star a beach to pin it here 🌟</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x pb-1">
            {favoriteRows.map((row) => (
              <div key={row.slug} className="min-w-[min(100%,320px)] snap-start shrink-0 w-[85vw] max-w-sm">
                <BeachCardFromConvex
                  row={row}
                  skillLevel={skillLevel}
                  preferredHeight={preferredHeight}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <SectionHeader
          title="Surfer reports"
          emoji="📝"
          action={<Link href="/reports">See all →</Link>}
        />
        <div className="space-y-3">
          {(recentReports ?? []).map((r: RecentReportRow) => {
            const b = beachBySlug.get(r.beachSlug);
            return (
              <ReportFeedCard
                key={r._id}
                report={{
                  beachSlug: r.beachSlug,
                  kind: r.kind,
                  note: r.note,
                  createdAt: r.createdAt,
                  userHandle: r.userHandle,
                }}
                beachName={b?.name}
                beachArea={b?.area}
              />
            );
          })}
        </div>
      </div>

      <div>
        <SectionHeader title="Agents on it" emoji="🤖" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 snap-x">
          {AGENT_INSIGHTS.map((i) => (
            <div key={i.id} className="min-w-[85%] snap-start">
              <AgentCard insight={i} />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
