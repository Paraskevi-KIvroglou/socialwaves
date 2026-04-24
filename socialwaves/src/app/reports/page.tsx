"use client";
import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { ReportFeedCard } from "@/components/ReportFeedCard";
import { SectionHeader } from "@/components/SectionHeader";
import type { ReportKind } from "@/lib/types";

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayBucket(ms: number): string {
  const day = startOfDay(ms);
  const today = startOfDay(Date.now());
  const y = new Date(today);
  y.setDate(y.getDate() - 1);
  const yesterday = y.getTime();
  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";
  return new Date(ms).toLocaleDateString();
}

type ReportRow = {
  _id: string;
  beachSlug: string;
  kind: ReportKind;
  note?: string;
  createdAt: number;
  userHandle: string;
};

export default function ReportsPage() {
  const reports = useQuery(api.reports.listRecent, { limit: 50 });
  const beaches = useQuery(api.beaches.listAll);

  const slugToBeach = useMemo(() => {
    const m: Record<string, { name: string; area: string }> = {};
    if (!beaches) return m;
    for (const b of beaches) {
      m[b.slug] = { name: b.name, area: b.area };
    }
    return m;
  }, [beaches]);

  const { bucketOrder, byBucket } = useMemo(() => {
    const byBucket = new Map<string, ReportRow[]>();
    if (!reports) return { bucketOrder: [] as string[], byBucket };

    for (const r of reports) {
      const b = dayBucket(r.createdAt);
      if (!byBucket.has(b)) byBucket.set(b, []);
      byBucket.get(b)!.push(r as ReportRow);
    }

    const fixedOrder = ["Today", "Yesterday"];
    const rest = [...byBucket.keys()].filter((k) => !fixedOrder.includes(k));
    rest.sort((a, b) => {
      const maxA = Math.max(...(byBucket.get(a) ?? []).map((x) => x.createdAt));
      const maxB = Math.max(...(byBucket.get(b) ?? []).map((x) => x.createdAt));
      return maxB - maxA;
    });
    const bucketOrder = [...fixedOrder.filter((k) => byBucket.has(k)), ...rest];
    return { bucketOrder, byBucket };
  }, [reports]);

  const loading = reports === undefined || beaches === undefined;

  return (
    <AppShell greeting="Community reports">
      {loading ? (
        <div className="space-y-3">
          <div className="h-24 rounded-2xl bg-slate-200/80 animate-pulse" />
          <div className="h-24 rounded-2xl bg-slate-200/80 animate-pulse" />
          <div className="h-24 rounded-2xl bg-slate-200/80 animate-pulse" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-slate-600 py-8">No reports yet 🤙 be the first!</p>
      ) : (
        bucketOrder.map((bucket) => {
          const list = byBucket.get(bucket) ?? [];
          if (list.length === 0) return null;
          return (
            <div key={bucket}>
              <SectionHeader title={bucket} />
              <div className="space-y-3">
                {list.map((r) => {
                  const beach = slugToBeach[r.beachSlug];
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
            </div>
          );
        })
      )}
    </AppShell>
  );
}
