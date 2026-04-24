"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { BEACHES } from "@/data/beaches";
import type { Beach } from "@/lib/types";
import { useLocation } from "@/lib/LocationProvider";

function beachIcon(emoji: string): L.DivIcon {
  return L.divIcon({
    className: "socialwave-pin",
    html: `
      <div style="
        width:40px;height:40px;border-radius:9999px;
        background:white;border:2px solid #BAE6FD;
        box-shadow:0 6px 16px rgba(14,165,233,0.30);
        display:flex;align-items:center;justify-content:center;
        font-size:22px;line-height:1;
      ">${emoji}</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
}

function youIcon(): L.DivIcon {
  return L.divIcon({
    className: "socialwave-pin",
    html: `
      <div style="
        width:44px;height:44px;border-radius:9999px;
        background:#F4A261;border:3px solid #D98441;
        box-shadow:0 6px 20px rgba(244,162,97,0.55);
        display:flex;align-items:center;justify-content:center;
        font-size:22px;line-height:1;color:white;
      ">🦀</div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20],
  });
}

function FitBounds({ beaches, userLoc }: { beaches: Beach[]; userLoc?: { latitude: number; longitude: number } | null }) {
  const map = useMap();
  useEffect(() => {
    const points: Array<[number, number]> = beaches.map((b) => [b.latitude, b.longitude]);
    if (userLoc) points.push([userLoc.latitude, userLoc.longitude]);
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 });
  }, [map, beaches, userLoc]);
  return null;
}

export function BeachesMap({ className }: { className?: string }) {
  const { location } = useLocation();
  const beaches = useMemo(() => BEACHES, []);

  return (
    <div
      className={
        "w-full rounded-3xl overflow-hidden border border-slate-200 shadow-[var(--shadow-soft)] bg-sky-50 " +
        (className ?? "h-[70vh]")
      }
    >
      <MapContainer
        center={[37, 23]}
        zoom={5}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#E0F2FE" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <FitBounds beaches={beaches} userLoc={location} />
        {beaches.map((b) => (
          <Marker key={b.id} position={[b.latitude, b.longitude]} icon={beachIcon(b.hero.emoji)}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A" }}>{b.name}</div>
                <div style={{ color: "#64748B", fontSize: 12, marginTop: 2 }}>
                  {b.area}, {b.country}
                </div>
                <div style={{ color: "#334155", fontSize: 12, marginTop: 6 }}>{b.blurb}</div>
                <Link
                  href={`/beach/${b.id}`}
                  style={{
                    display: "inline-block",
                    marginTop: 10,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: "#0EA5E9",
                    color: "white",
                    fontSize: 12,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  View forecast →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
        {location ? (
          <Marker position={[location.latitude, location.longitude]} icon={youIcon()}>
            <Popup>You&apos;re here 🦀</Popup>
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
