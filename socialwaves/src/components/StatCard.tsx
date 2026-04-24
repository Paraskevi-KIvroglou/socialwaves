export function StatCard({ emoji, value, label, sub }: { emoji: string; value: string; label: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-[var(--shadow-soft)]">
      <div className="text-2xl" aria-hidden>{emoji}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900 tabular-nums">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
      {sub ? <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div> : null}
    </div>
  );
}
