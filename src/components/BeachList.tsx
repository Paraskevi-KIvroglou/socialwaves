"use client";
import { useMemo } from "react";
import type { Beach, SurfForecast } from "@/lib/types";
import { useLocation } from "@/lib/LocationProvider";
import { haversineKm } from "@/lib/location";
import { BeachCard } from "./BeachCard";

export type BeachEntry = { beach: Beach; forecast: SurfForecast };

export function BeachList({
  entries,
  emptyLabel = "No beaches.",
}: {
  entries: BeachEntry[];
  emptyLabel?: string;
}) {
  const { location } = useLocation();

  const ordered = useMemo(() => {
    if (!location) return entries;
    return [...entries].sort((a, b) => {
      const da = haversineKm(a.beach, location);
      const db = haversineKm(b.beach, location);
      return da - db;
    });
  }, [entries, location]);

  if (ordered.length === 0) {
    return (
      <div className="text-center text-slate-500 text-sm py-6">{emptyLabel}</div>
    );
  }

  return (
    <div className="space-y-3">
      {ordered.map(({ beach, forecast }) => (
        <BeachCard key={beach.id} beach={beach} forecast={forecast} />
      ))}
    </div>
  );
}
