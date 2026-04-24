"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useLocation } from "@/lib/LocationProvider";

export function LocationGate() {
  const {
    location,
    permission,
    isRequesting,
    error,
    requestLocation,
    clearLocation,
  } = useLocation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || permission === "granted" || location !== null) {
    return null;
  }

  const denied = permission === "denied";
  const unsupported = permission === "unsupported";
  const primaryDisabled = isRequesting || denied || unsupported;

  return (
    <div
      className={cn(
        "rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-100 to-sand-50 p-4 shadow-[var(--shadow-soft)]"
      )}
    >
      <div className="flex gap-3">
        <span className="text-2xl shrink-0" aria-hidden>
          📍
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="font-semibold text-slate-900 leading-tight">
            Find surf spots near you
          </h2>
          <p className="text-sm text-slate-600">
            Share your location so we can rank beaches closest to you.
          </p>
          {denied ? (
            <p className="text-sm text-slate-600">
              You can enable location from your browser settings.
            </p>
          ) : null}
          {unsupported ? (
            <p className="text-sm text-slate-600">
              Your browser doesn&apos;t support location.
            </p>
          ) : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          <button
            type="button"
            disabled={primaryDisabled}
            onClick={() => void requestLocation()}
            className={cn(
              "mt-2 w-full rounded-xl bg-sky-500 px-4 py-3 text-center text-sm font-semibold text-white",
              "disabled:opacity-50 disabled:pointer-events-none",
              "active:scale-[0.99] transition-transform"
            )}
          >
            {isRequesting ? "Locating…" : "Use my location"}
          </button>
          <button
            type="button"
            onClick={() => {
              clearLocation();
              setDismissed(true);
            }}
            className="w-full pt-1 text-center text-sm font-medium text-sky-700 underline-offset-2 hover:underline"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
