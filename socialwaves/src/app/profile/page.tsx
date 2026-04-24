"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { ConvexBeach } from "@/lib/beachUi";
import { AppShell } from "@/components/AppShell";
import { getSession, signOut, updateSession } from "@/lib/mockAuth";
import { useFavorites } from "@/lib/useFavorites";
import type { SkillLevel, User } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const { favoriteSlugs, toggle } = useFavorites();
  const beaches = useQuery(api.beaches.listAll);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const favoriteBeaches = useMemo(() => {
    if (!beaches) return [];
    const set = new Set(favoriteSlugs);
    return beaches.filter((b: ConvexBeach) => set.has(b.slug));
  }, [beaches, favoriteSlugs]);

  if (user === undefined) {
    return (
      <AppShell greeting="Your profile">
        <div className="h-40 rounded-2xl bg-slate-200/80 animate-pulse" />
      </AppShell>
    );
  }

  if (user === null) {
    return (
      <AppShell greeting="Your profile">
        <p className="text-center text-slate-600 py-8">
          Not signed in —{" "}
          <Link href="/login" className="text-sky-600 font-semibold underline underline-offset-2">
            /login
          </Link>
        </p>
      </AppShell>
    );
  }

  return (
    <AppShell greeting="Your profile">
      <div className="rounded-3xl bg-white border border-slate-200 p-6 text-center shadow-[var(--shadow-soft)]">
        <div className="text-5xl" aria-hidden>
          🏄
        </div>
        <div className="mt-3 text-lg font-bold text-sky-700">@{user.handle}</div>
        <div className="text-base font-semibold text-slate-900">{user.displayName}</div>
        <div className="text-sm text-slate-600 mt-1">{user.email}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <div>
          <label htmlFor="profile-skill" className="text-xs font-medium text-slate-500">
            Skill level
          </label>
          <select
            id="profile-skill"
            value={user.skillLevel}
            onChange={(e) => {
              const skillLevel = e.target.value as SkillLevel;
              setUser(updateSession({ skillLevel }));
            }}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="profile-wave" className="text-xs font-medium text-slate-500">
              Preferred wave height
            </label>
            <span className="text-sm font-semibold text-slate-900 tabular-nums">
              {user.preferredWaveHeight.toFixed(1)}m
            </span>
          </div>
          <input
            id="profile-wave"
            type="range"
            min={0.5}
            max={3.5}
            step={0.1}
            value={user.preferredWaveHeight}
            onChange={(e) => {
              const preferredWaveHeight = Number(e.target.value);
              setUser(updateSession({ preferredWaveHeight }));
            }}
            className="mt-2 w-full accent-sky-500"
          />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-2 px-1">Favorite beaches</h2>
        {beaches === undefined ? (
          <div className="h-20 rounded-2xl bg-slate-200/80 animate-pulse" />
        ) : favoriteBeaches.length === 0 ? (
          <p className="text-sm text-slate-500 px-1">No favorites yet — add some from a beach page.</p>
        ) : (
          <ul className="space-y-2">
            {favoriteBeaches.map((b: ConvexBeach) => (
              <li
                key={b.slug}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">{b.name}</div>
                  <div className="text-xs text-slate-500">{b.area}</div>
                </div>
                <button
                  type="button"
                  onClick={() => void toggle(b.slug)}
                  className="text-xs font-semibold text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          signOut();
          router.push("/login");
        }}
        className="w-full rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold py-3"
      >
        Sign out
      </button>

      <p className="text-[11px] text-slate-400 text-center px-2">
        Forecasts by Open-Meteo · data by DWD, Copernicus & others.
      </p>
    </AppShell>
  );
}
