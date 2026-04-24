"use client";

import dynamic from "next/dynamic";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { LocationGate } from "@/components/LocationGate";

const BeachesMap = dynamic(
  () => import("@/components/BeachesMap").then((m) => m.BeachesMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[72vh] w-full rounded-3xl border border-slate-200 bg-sky-50 flex items-center justify-center text-slate-500">
        <span className="text-2xl mr-2" aria-hidden>🗺️</span>
        Loading map…
      </div>
    ),
  }
);

export default function MapPage() {
  const beaches = useQuery(api.beaches.listAll);
  const count = beaches?.length ?? 0;
  return (
    <AppShell greeting="Every SocialWave spot on the map. Tap a pin to dive in.">
      <LocationGate />
      <SectionHeader
        title="Surf map"
        emoji="🗺️"
        action={<span className="text-slate-500 text-xs">{count} spots</span>}
      />
      <BeachesMap className="h-[72vh]" />
      <p className="text-[11px] text-slate-400 text-center">
        Tiles © OpenStreetMap · CARTO
      </p>
    </AppShell>
  );
}
