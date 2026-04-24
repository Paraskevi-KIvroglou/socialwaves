import type { SurfForecast } from "@/lib/types";
import { SurfScoreBadge } from "./SurfScoreBadge";
import { waveEmoji, windEmoji, windLabel, compass, directionArrow } from "@/lib/weather";

export function ForecastCard({ forecast }: { forecast: SurfForecast }) {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-sky-200 via-sky-100 to-sand-100 p-6 shadow-[var(--shadow-pop)] wave-drift">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-sky-800/80 font-semibold">Right now</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl" aria-hidden>{waveEmoji(forecast.waveHeight)}</span>
            <span className="text-4xl font-bold tabular-nums text-slate-900">
              {forecast.waveHeight.toFixed(1)}<span className="text-2xl text-slate-600">m</span>
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-700">Best window: <strong className="font-semibold">{forecast.bestWindow}</strong></p>
        </div>
        <SurfScoreBadge score={forecast.surfScore} size="lg" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Stat emoji={windEmoji(forecast.windSpeed)} label="Wind" value={`${forecast.windSpeed.toFixed(0)}kt`} sub={windLabel(forecast.windSpeed)} />
        <Stat emoji="⏱️" label="Period" value={`${forecast.swellPeriod.toFixed(0)}s`} sub={forecast.swellPeriod >= 10 ? "Groomed" : "Wind-swell"} />
        <Stat emoji={directionArrow(forecast.swellDirection)} label="Swell" value={compass(forecast.swellDirection)} sub={`${forecast.swellDirection}°`} />
      </div>
      <p className="mt-4 text-[11px] text-slate-600">
        Source: {forecast.source === "open-meteo" ? "Open-Meteo · live" : "Mock fallback"} · updated {new Date(forecast.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </p>
    </section>
  );
}

function Stat({ emoji, label, value, sub }: { emoji: string; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl bg-white/75 backdrop-blur px-3 py-2.5">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span aria-hidden>{emoji}</span>
        <span className="font-semibold tabular-nums text-slate-900">{value}</span>
      </div>
      <div className="text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}
