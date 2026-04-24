import Link from "next/link";
import type { Beach, SurfForecast } from "@/lib/types";
import { SurfScoreBadge } from "./SurfScoreBadge";
import { waveEmoji, windEmoji, compass } from "@/lib/weather";

export function BeachCard({ beach, forecast }: { beach: Beach; forecast?: SurfForecast }) {
  return (
    <Link
      href={`/beach/${beach.id}`}
      className={`block rounded-2xl border border-slate-200 bg-gradient-to-br ${beach.hero.gradient} p-4 shadow-[var(--shadow-soft)] active:scale-[0.99] transition-transform`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/70 backdrop-blur flex items-center justify-center text-2xl">
            {beach.hero.emoji}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-tight">{beach.name}</h3>
            <p className="text-xs text-slate-500">{beach.area} · {beach.country}</p>
          </div>
        </div>
        {forecast ? <SurfScoreBadge score={forecast.surfScore} size="sm" /> : null}
      </div>
      {forecast ? (
        <div className="mt-3 flex items-center gap-4 text-sm text-slate-700">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>{waveEmoji(forecast.waveHeight)}</span>
            <span className="font-semibold tabular-nums">{forecast.waveHeight.toFixed(1)}m</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>{windEmoji(forecast.windSpeed)}</span>
            <span className="tabular-nums">{forecast.windSpeed.toFixed(0)}kt</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden>🧭</span>
            <span className="tabular-nums">{compass(forecast.swellDirection)}</span>
          </span>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">{beach.blurb}</p>
      )}
    </Link>
  );
}
