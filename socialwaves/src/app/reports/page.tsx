"use client";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { SectionHeader } from "@/components/SectionHeader";
import { Card } from "@/components/Card";
import { loadLocalReports } from "@/lib/reports";
import { SEED_REPORTS } from "@/data/mockReports";
import type { Report, ReportKind } from "@/lib/types";

const KINDS: Array<{ key: ReportKind | "all"; label: string; emoji: string }> = [
  { key: "all", label: "All", emoji: "🌐" },
  { key: "perfect_session", label: "Stoke", emoji: "🔥" },
  { key: "waves_there", label: "Waves", emoji: "🌊" },
  { key: "no_waves", label: "Flat", emoji: "💤" },
  { key: "too_windy", label: "Wind", emoji: "🌬️" },
  { key: "too_crowded", label: "Crowd", emoji: "👥" },
  { key: "unsafe", label: "Unsafe", emoji: "⚠️" },
];

export default function ReportsPage() {
  const [localReports, setLocalReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<ReportKind | "all">("all");

  useEffect(() => {
    setLocalReports(loadLocalReports());
  }, []);

  const all = useMemo(() => {
    const merged: Report[] = [...localReports, ...SEED_REPORTS];
    merged.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return merged;
  }, [localReports]);

  const filtered = filter === "all" ? all : all.filter((r) => r.kind === filter);

  const now = Date.now();
  const today = filtered.filter((r) => now - new Date(r.createdAt).getTime() < 24 * 3600 * 1000);
  const earlier = filtered.filter((r) => now - new Date(r.createdAt).getTime() >= 24 * 3600 * 1000);

  const stokeCount = all.filter((r) => r.kind === "perfect_session").length;

  return (
    <AppShell greeting="Every wave, verified by the people who surfed it.">
      <Card className="bg-gradient-to-br from-sand-100 to-sand-200 border-sand-200">
        <div className="flex items-center gap-3">
          <div className="text-3xl" aria-hidden>🦀</div>
          <div>
            <div className="text-sm text-sand-800 font-semibold">{stokeCount} perfect sessions logged recently</div>
            <div className="text-xs text-sand-700">Thanks for keeping everyone honest.</div>
          </div>
        </div>
      </Card>

      <div className="-mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {KINDS.map((k) => {
            const active = filter === k.key;
            return (
              <button
                key={k.key}
                type="button"
                onClick={() => setFilter(k.key)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  active
                    ? "bg-sky-500 text-white border-sky-500"
                    : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                <span className="mr-1" aria-hidden>{k.emoji}</span>
                {k.label}
              </button>
            );
          })}
        </div>
      </div>

      {today.length > 0 ? (
        <div>
          <SectionHeader title="Today" emoji="☀️" />
          <div className="space-y-3">
            {today.map((r) => (
              <ReportFeedCard key={r.id} report={r} />
            ))}
          </div>
        </div>
      ) : null}

      {earlier.length > 0 ? (
        <div>
          <SectionHeader title="Earlier" emoji="🕰️" />
          <div className="space-y-3">
            {earlier.map((r) => (
              <ReportFeedCard key={r.id} report={r} />
            ))}
          </div>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <Card className="text-center text-slate-500">
          <div className="text-3xl" aria-hidden>🫧</div>
          <div className="mt-2 text-sm">No reports match this filter yet.</div>
        </Card>
      ) : null}
    </AppShell>
  );
}
