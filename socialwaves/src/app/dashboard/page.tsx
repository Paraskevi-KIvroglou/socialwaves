"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const token = useAuthToken();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.users.getMyProfile, token ? {} : "skip");
  const evaluation = useQuery(
    api.evaluations.getMyEvaluationSnapshot,
    token ? {} : "skip",
  );
  const updateLocation = useMutation(api.users.updateMyLocation);
  const refreshMarine = useAction(api.openMeteoActions.refreshMarineForecast);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");

  const loc = profile?.location;
  const marine = useQuery(
    api.openMeteo.getMarineForecastForLocation,
    loc
      ? { latitude: loc.latitude, longitude: loc.longitude }
      : "skip",
  );

  if (!token) {
    return (
      <div className="p-6">
        <p className="mb-4">You are not signed in.</p>
        <Link href="/login" className="text-blue-600 underline">
          Go to login
        </Link>
      </div>
    );
  }

  if (profile === undefined || evaluation === undefined) {
    return <p className="p-6">Loading…</p>;
  }

  const nextWaveH =
    marine && marine.hourly.waveHeight.length
      ? marine.hourly.waveHeight[0]
      : null;

  return (
    <div className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {profile && (
        <p className="text-sm text-zinc-600">
          Signed in as {profile.email ?? "user"}
        </p>
      )}
      {loc && (
        <p className="text-sm">
          <span className="font-medium">Saved location: </span>
          {loc.name} ({loc.latitude.toFixed(4)}°, {loc.longitude.toFixed(4)}°)
        </p>
      )}

      {loc && (
        <div className="space-y-2 rounded-lg border border-sky-200/80 bg-sky-50/80 p-4 text-sm text-sky-950">
          <p className="font-semibold">Open-Meteo (raw → parsed in Convex)</p>
          {marine === undefined ? (
            <p className="text-sky-800/80">Loading forecast…</p>
          ) : marine ? (
            <p>
              <span className="font-medium">Next hour wave height: </span>
              {nextWaveH != null ? `${nextWaveH.toFixed(2)} m` : "—"}
            </p>
          ) : (
            <p className="text-sky-800/80">No ingested data yet. Refresh below.</p>
          )}
          <button
            type="button"
            className="rounded border border-sky-700 bg-sky-900 px-3 py-1.5 text-white"
            onClick={() =>
              void refreshMarine({
                latitude: loc.latitude,
                longitude: loc.longitude,
                locationName: loc.name,
              })
            }
          >
            Fetch &amp; store raw + parse
          </button>
        </div>
      )}

      {evaluation && (
        <section
          className="rounded-lg border border-emerald-200/80 bg-emerald-50/80 p-4"
          aria-labelledby="evaluation-agent-heading"
        >
          <h2
            id="evaluation-agent-heading"
            className="text-sm font-semibold text-emerald-950"
          >
            Evaluation Agent
          </h2>
          <p className="mt-1 text-sm font-medium text-emerald-900">
            {evaluation.headline}
          </p>
          <p className="mt-2 text-sm text-emerald-800/90">{evaluation.summary}</p>
          {evaluation.trustPreview != null && (
            <p className="mt-2 text-sm text-emerald-900">
              <span className="font-medium">Trust preview: </span>
              {evaluation.trustPreview}/100
            </p>
          )}
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-emerald-800/85">
            {evaluation.bullets.map((b: string) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      )}

      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const la = parseFloat(lat);
          const lo = parseFloat(lng);
          if (!name.trim() || Number.isNaN(la) || Number.isNaN(lo)) {
            return;
          }
          await updateLocation({ name: name.trim(), latitude: la, longitude: lo });
        }}
      >
        <p className="text-sm font-medium">Set home surf spot (stored on user)</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name (e.g. Pipeline, HI)"
          className="w-full rounded border border-zinc-300 px-3 py-2"
        />
        <div className="flex gap-2">
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="w-full rounded border border-zinc-300 px-3 py-2"
            inputMode="decimal"
          />
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
            className="w-full rounded border border-zinc-300 px-3 py-2"
            inputMode="decimal"
          />
        </div>
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-2 text-white"
        >
          Save location
        </button>
      </form>
      <button
        type="button"
        className="text-sm text-zinc-500 underline"
        onClick={() => void signOut()}
      >
        Sign out
      </button>
      <p>
        <Link href="/" className="text-sm text-blue-600">
          Home
        </Link>
      </p>
    </div>
  );
}
