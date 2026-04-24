import { Card } from "./Card";

export function ForecastVsReality({
  forecastLabel,
  realityLabel,
  forecastEmoji,
  realityEmoji,
  verdict,
}: {
  forecastLabel: string;
  realityLabel: string;
  forecastEmoji: string;
  realityEmoji: string;
  verdict: string;
}) {
  return (
    <Card className="!p-0 overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-slate-200">
        <div className="p-4 bg-sky-50/50">
          <div className="text-[11px] uppercase tracking-wider text-sky-700 font-semibold">Forecast said</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl" aria-hidden>{forecastEmoji}</span>
            <span className="font-semibold text-slate-900">{forecastLabel}</span>
          </div>
        </div>
        <div className="p-4 bg-sand-50">
          <div className="text-[11px] uppercase tracking-wider text-sand-700 font-semibold">Surfers said</div>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-3xl" aria-hidden>{realityEmoji}</span>
            <span className="font-semibold text-slate-900">{realityLabel}</span>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 bg-white text-sm text-slate-700 border-t border-slate-200">
        <span aria-hidden className="mr-1.5">🧠</span>
        {verdict}
      </div>
    </Card>
  );
}
