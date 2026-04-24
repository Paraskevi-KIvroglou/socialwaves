"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AppShell } from "@/components/AppShell";
import { BeachCard } from "@/components/BeachCard";
import { LocationGate } from "@/components/LocationGate";
import { toUiBeach, type ConvexBeach } from "@/lib/beachUi";
import { useLocation } from "@/lib/LocationProvider";
import { haversineKm } from "@/lib/location";

export default function BeachesPage() {
  const [q, setQ] = useState("");
  const { location } = useLocation();
  const beaches = useQuery(api.beaches.listAll);

  const filteredSorted = useMemo(() => {
    if (!beaches) return [];
    const needle = q.trim().toLowerCase();
    const rows: ConvexBeach[] = needle
      ? beaches.filter(
          (b: ConvexBeach) =>
            b.name.toLowerCase().includes(needle) ||
            b.area.toLowerCase().includes(needle) ||
            b.country.toLowerCase().includes(needle)
        )
      : [...(beaches as ConvexBeach[])];

    if (location) {
      rows.sort(
        (a: ConvexBeach, b: ConvexBeach) =>
          haversineKm(location, a) - haversineKm(location, b)
      );
    } else {
      rows.sort((a: ConvexBeach, b: ConvexBeach) => b.trustScore - a.trustScore);
    }
    return rows;
  }, [beaches, q, location]);

  const total = beaches?.length ?? 192;

  return (
    <AppShell greeting="All beaches">
      <LocationGate />
      <label className="block px-1">
        <span className="sr-only">Search beaches</span>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, area, country…"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-[var(--shadow-soft)] focus:outline-none focus:ring-2 focus:ring-sky-300"
        />
      </label>
      <p className="text-sm text-slate-600 px-1">
        Showing {filteredSorted.length} of {total} beaches
      </p>
      <div className="grid grid-cols-1 gap-3">
        {filteredSorted.map((row: ConvexBeach) => (
          <BeachCard key={row.slug} beach={toUiBeach(row)} />
        ))}
      </div>
    </AppShell>
  );
}
