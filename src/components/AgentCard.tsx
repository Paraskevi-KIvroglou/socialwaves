import type { AgentInsight } from "@/lib/types";

const AGENT_LABEL: Record<AgentInsight["agent"], string> = {
  forecast: "Forecast Agent",
  beach_scout: "Beach Scout",
  reality_check: "Reality Check",
  trust_score: "Trust Score",
  personal_coach: "Personal Coach",
};

export function AgentCard({ insight }: { insight: AgentInsight }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-lg">
          {insight.emoji}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-sky-700 font-semibold">
            {AGENT_LABEL[insight.agent]}
          </div>
          <div className="text-sm font-semibold text-slate-900 leading-tight">{insight.title}</div>
        </div>
      </div>
      <p className="mt-2.5 text-sm text-slate-700 leading-snug">{insight.body}</p>
    </article>
  );
}
