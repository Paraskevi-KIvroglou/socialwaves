"use client";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { AgentCard } from "@/components/AgentCard";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { loadLocalReports } from "@/lib/reports";
import { getSession, DEFAULT_USER } from "@/lib/mockAuth";
import { SEED_REPORTS } from "@/data/mockReports";
import { BEACHES, getBeach } from "@/data/beaches";
import { AGENT_INSIGHTS } from "@/data/agentInsights";
import type { Report, User } from "@/lib/types";

export default function AnalyticsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [myReports, setMyReports] = useState<Report[]>([]);

  useEffect(() => {
    setUser(getSession() ?? DEFAULT_USER);
    setMyReports(loadLocalReports());
  }, []);

  const allMine = useMemo(() => {
    const handle = user?.handle ?? DEFAULT_USER.handle;
    const fromSeed = SEED_REPORTS.filter((r) => r.userHandle === handle);
    return [...myReports, ...fromSeed];
  }, [user, myReports]);

  const sessionCount = allMine.length;
  const stokeCount = allMine.filter((r) => r.kind === "perfect_session" || r.kind === "waves_there").length;
  const flatCount = allMine.filter((r) => r.kind === "no_waves" || r.kind === "smaller_than_predicted").length;
  const consistency = sessionCount === 0 ? 0 : Math.round((stokeCount / sessionCount) * 100);

  const byBeach = useMemo(() => {
    const map = new Map<string, number>();
    allMine.forEach((r) => map.set(r.beachId, (map.get(r.beachId) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([id, count]) => ({ beach: getBeach(id), count }))
      .filter((x): x is { beach: NonNullable<ReturnType<typeof getBeach>>; count: number } => Boolean(x.beach))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [allMine]);

  const favoriteCount = (user ?? DEFAULT_USER).favoriteBeachIds.length;
  const trackedBeaches = BEACHES.length;

  return (
    <AppShell greeting={`Hey ${user?.displayName ?? "surfer"} — here's your wave math.`}>
      <SectionHeader title="You, by the numbers" emoji="📈" />
      <div className="grid grid-cols-2 gap-3">
        <StatCard emoji="🏄" value={String(sessionCount)} label="Logged sessions" />
        <StatCard emoji="🔥" value={`${consistency}%`} label="Stoke rate" sub={`${stokeCount} good of ${sessionCount}`} />
        <StatCard emoji="💤" value={String(flatCount)} label="Flat days" />
        <StatCard emoji="⭐" value={`${favoriteCount}/${trackedBeaches}`} label="Favorites" />
      </div>

      <SectionHeader title="Where you actually go" emoji="🗺️" />
      {byBeach.length === 0 ? (
        <Card className="text-center text-slate-500">
          <div className="text-3xl" aria-hidden>🦀</div>
          <div className="mt-2 text-sm">No sessions logged yet. Submit a report and this fills in.</div>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {byBeach.map(({ beach, count }) => (
            <div key={beach.id} className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-100 text-xl flex items-center justify-center">
                  {beach.hero.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{beach.name}</div>
                  <div className="text-xs text-slate-500">{beach.area}</div>
                </div>
              </div>
              <div className="text-sm font-semibold text-slate-900">{count}×</div>
            </div>
          ))}
        </div>
      )}

      <SectionHeader title="Coach's notes" emoji="🎯" />
      <div className="space-y-3">
        {AGENT_INSIGHTS.filter((i) => i.agent === "personal_coach" || i.agent === "beach_scout").map((i) => (
          <AgentCard key={i.id} insight={i} />
        ))}
      </div>

      <SectionHeader title="Your latest reports" emoji="📝" />
      {myReports.length === 0 ? (
        <Card className="text-center text-slate-500">
          <div className="text-3xl" aria-hidden>🫧</div>
          <div className="mt-2 text-sm">Nothing from you yet. Log your next session to start building your surf fingerprint.</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {myReports.slice(0, 5).map((r) => (
            <ReportFeedCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
