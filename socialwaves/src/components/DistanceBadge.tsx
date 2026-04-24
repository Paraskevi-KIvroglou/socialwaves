"use client";
import { useLocation } from "@/lib/LocationProvider";
import { haversineKm, formatDistanceKm } from "@/lib/location";
import { cn } from "@/lib/cn";

export function DistanceBadge({
  latitude,
  longitude,
  className,
}: {
  latitude: number;
  longitude: number;
  className?: string;
}) {
  const { location } = useLocation();
  if (!location) return null;
  const km = haversineKm({ latitude, longitude }, location);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-white/70 backdrop-blur px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-white/80",
        className
      )}
    >
      <span aria-hidden>📍</span>
      <span className="tabular-nums">{formatDistanceKm(km)}</span>
    </span>
  );
}
