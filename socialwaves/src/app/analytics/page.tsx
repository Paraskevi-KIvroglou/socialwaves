"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { getSession } from "@/lib/mockAuth";
import type { ReportKind, User } from "@/lib/types";

const NEGATIVE_KINDS = new Set<ReportKind>([
  "no_waves",
  "smaller_than_predicted",
  "too_windy",
  "unsafe",
]);

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function favoriteWeekday(createdAts: number[]): string {
  if (createdAts.length === 0) return "—";
  const counts = new Map<number, number>();
  for (const ms of createdAts) {
    const wd = new Date(ms).getDay();
    counts.set(wd, (counts.get(wd) ?? 0) + 1);
  }
  let best = 0;
  let bestWd = 0;
  for (const [wd, c] of counts) {
    if (c > best) {
      best = c;
      bestWd = wd;
    }
  }
  return WEEKDAYS[bestWd] ?? "—";
}

function mostCommonSlug(slugs: string[]): string | null {
  if (slugs.length === 0) return null;
  const counts = new Map<string, number>();
  for (const s of slugs) {
    counts.set(s, (counts.get(s) ?? 0) + 1);
  }
  let bestSlug = slugs[0];
  let best = 0;
  for (const [s, c] of counts) {
    if (c > best) {
      best = c;
      bestSlug = s;
    }
  }
  return bestSlug;
}

type ReportDoc = {
  _id: string;
  beachSlug: string;
  kind: ReportKind;
  note?: string;
  createdAt: number;
  userHandle: string;
};

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const userHandle = user?.handle;
  const myReports = useQuery(
    api.reports.listForHandle,
    userHandle ? { userHandle, limit: 200 } : "skip",
  );
  const beaches = useQuery(api.beaches.listAll);

  const slugToName = useMemo(() => {
    const m: Record<string, string> = {};
    if (!beaches) return m;
    for (const b of beaches) m[b.slug] = b.name;
    return m;
  }, [beaches]);

  const stats = useMemo(() => {
    const list = (myReports ?? []) as ReportDoc[];
    const totalSessions = list.length;
    const perfectCount = list.filter((r) => r.kind === "perfect_session").length;
    const negativeCount = list.filter((r) => NEGATIVE_KINDS.has(r.kind)).length;
    const stokeRatio = totalSessions > 0 ? perfectCount / totalSessions : 0;
    const favoriteDay = favoriteWeekday(list.map((r) => r.createdAt));
    const topSlug = mostCommonSlug(list.map((r) => r.beachSlug));
    const mostReportedBeachName = topSlug ? slugToName[topSlug] ?? topSlug : null;
    return {
      totalSessions,
      perfectCount,
      negativeCount,
      stokeRatio,
      favoriteDay,
      mostReportedBeachName,
    };
  }, [myReports, slugToName]);

  const recentFive = useMemo(() => {
    const list = (myReports ?? []) as ReportDoc[];
    return list.slice(0, 5);
  }, [myReports]);

  const loading = Boolean(userHandle && myReports === undefined);

  return (
    <AppShell greeting="Your session story">
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200/80 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            emoji="🔥"
            value={`${stats.perfectCount}`}
            label="Perfect sessions"
            sub={
              stats.totalSessions > 0
                ? `${Math.round(stats.stokeRatio * 100)}% stoke${
                    stats.negativeCount ? ` · ${stats.negativeCount} rough` : ""
                  }`
                : undefined
            }
          />
          <StatCard emoji="🌊" value={`${stats.totalSessions}`} label="Total reports" />
          <StatCard emoji="📅" value={stats.favoriteDay} label="Your surf day" />
          <StatCard
            emoji="🏖️"
            value={stats.mostReportedBeachName ?? "—"}
            label="Home break"
          />
        </div>
      )}

      <SectionHeader title="Recent sessions" />
      {stats.totalSessions === 0 ? (
        <p className="text-center text-slate-600 py-6 text-sm">
          Log your first session on any beach page. Your analytics appear here 📈
        </p>
      ) : (
        <div className="space-y-3">
          {recentFive.map((r) => {
            const beach = beaches?.find((b) => b.slug === r.beachSlug);
            return (
              <ReportFeedCard
                key={r._id}
                report={r}
                beachName={beach?.name}
                beachArea={beach?.area}
              />
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
