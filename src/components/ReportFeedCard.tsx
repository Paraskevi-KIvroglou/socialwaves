import type { ReportKind } from "@/lib/types";
import { REPORT_META } from "@/lib/reportMeta";

export function ReportFeedCard({
  report,
  beachName,
  beachArea,
}: {
  report: { beachSlug: string; kind: ReportKind; note?: string; createdAt: number; userHandle: string };
  beachName?: string;
  beachArea?: string;
}) {
  const meta = REPORT_META[report.kind];
  const when = relTime(report.createdAt);
  const toneBg =
    meta.tone === "hero"
      ? "bg-sand-100 border-sand-300"
      : meta.tone === "positive"
        ? "bg-sky-50 border-sky-200"
        : meta.tone === "negative"
          ? "bg-slate-50 border-slate-200"
          : "bg-white border-slate-200";
  return (
    <article className={`rounded-2xl border ${toneBg} p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{meta.emoji}</span>
          <div>
            <div className="text-sm font-semibold text-slate-900">{meta.label}</div>
            <div className="text-xs text-slate-500">
              {beachName ? `${beachName}${beachArea ? " · " + beachArea : ""}` : report.beachSlug}
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-500">{when}</div>
      </div>
      {report.note ? (
        <p className="mt-2 text-sm text-slate-700">&ldquo;{report.note}&rdquo;</p>
      ) : null}
      <div className="mt-2 text-[11px] text-slate-500">— @{report.userHandle}</div>
    </article>
  );
}

function relTime(createdAtMs: number): string {
  const d = Date.now() - createdAtMs;
  const m = Math.round(d / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return `${days}d ago`;
}
