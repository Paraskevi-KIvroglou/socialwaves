"use client";
import type { ReportKind } from "@/lib/types";
import { REPORT_META } from "@/lib/reports";
import { cn } from "@/lib/cn";

const ORDER: ReportKind[] = [
  "perfect_session",
  "waves_there",
  "smaller_than_predicted",
  "no_waves",
  "too_windy",
  "too_crowded",
  "unsafe",
];

export function ReportButtons({ onSelect, selected }: { onSelect: (kind: ReportKind) => void; selected?: ReportKind }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {ORDER.map((k) => {
        const meta = REPORT_META[k];
        const tone = {
          hero: "bg-sand-500 text-white border-sand-600",
          positive: "bg-sand-100 text-sand-800 border-sand-200",
          neutral: "bg-sky-100 text-sky-800 border-sky-200",
          negative: "bg-slate-100 text-slate-700 border-slate-200",
        }[meta.tone];
        const active = selected === k;
        const isHero = k === "perfect_session";
        return (
          <button
            key={k}
            type="button"
            onClick={() => onSelect(k)}
            className={cn(
              "rounded-2xl border px-3 py-3 text-left transition-all",
              tone,
              isHero ? "col-span-2 text-base" : "text-sm",
              active ? "ring-2 ring-sky-400 scale-[0.99]" : "hover:scale-[1.01]"
            )}
          >
            <span className="text-2xl mr-2" aria-hidden>{meta.emoji}</span>
            <span className="font-semibold">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
