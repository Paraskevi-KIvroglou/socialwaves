import { cn } from "@/lib/cn";

export function TrustScore({ score, label = "Trust score" }: { score: number; label?: string }) {
  const color =
    score >= 85 ? "bg-sand-500" : score >= 70 ? "bg-sky-500" : score >= 50 ? "bg-sky-300" : "bg-slate-300";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
        <div className={cn("absolute inset-y-0 left-0 rounded-full", color)} style={{ width: `${Math.max(4, Math.min(100, score))}%` }} />
      </div>
      <div className="text-sm text-slate-700 tabular-nums">
        <span className="font-semibold">{score}</span>
        <span className="text-slate-500"> · {label}</span>
      </div>
    </div>
  );
}
