"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, TileLayer, Marker } from "react-leaflet";

function pin(emoji: string): L.DivIcon {
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
  });
}

export function BeachMiniMap({
  latitude,
  longitude,
  emoji,
}: {
  latitude: number;
  longitude: number;
  emoji: string;
}) {
  return (
    <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-[var(--shadow-soft)]">
      <MapContainer
        center={[latitude, longitude]}
        zoom={11}
        scrollWheelZoom={false}
        zoomControl={false}
        dragging={false}
        doubleClickZoom={false}
        touchZoom={false}
        className="h-full w-full"
        style={{ background: "#E0F2FE" }}
      >
        <TileLayer
          attribution='&copy; OSM &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[latitude, longitude]} icon={pin(emoji)} />
      </MapContainer>
    </div>
  );
}
