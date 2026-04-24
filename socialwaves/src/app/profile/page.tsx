"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/Card";
import { SectionHeader } from "@/components/SectionHeader";
import { BEACHES } from "@/data/beaches";
import { getSession, DEFAULT_USER, updateSession, signOut } from "@/lib/mockAuth";
import type { SkillLevel, User } from "@/lib/types";

const SKILLS: Array<{ key: SkillLevel; label: string; emoji: string }> = [
  { key: "beginner", label: "Beginner", emoji: "🌱" },
  { key: "intermediate", label: "Intermediate", emoji: "🏄" },
  { key: "advanced", label: "Advanced", emoji: "🦈" },
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(DEFAULT_USER);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setUser(getSession() ?? DEFAULT_USER);
  }, []);

  function commit(patch: Partial<User>) {
    const next = updateSession(patch);
    setUser(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  function toggleFavorite(id: string) {
    const set = new Set(user.favoriteBeachIds);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    commit({ favoriteBeachIds: Array.from(set) });
  }

  function handleSignOut() {
    signOut();
    router.push("/login");
  }

  return (
    <AppShell greeting="Tune SocialWave to your surf.">
      <Card className="bg-gradient-to-br from-sky-200 to-sky-100 border-sky-200">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-3xl shadow-[var(--shadow-soft)]">
            🦀
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">@{user.handle}</div>
            <div className="text-sm text-slate-700">{user.email}</div>
          </div>
        </div>
      </Card>

      <SectionHeader title="Display name" emoji="🪪" />
      <Card>
        <input
          value={user.displayName}
          onChange={(e) => commit({ displayName: e.target.value })}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 focus:bg-white"
          placeholder="What should we call you?"
        />
      </Card>

      <SectionHeader title="Skill level" emoji="🏄" />
      <div className="grid grid-cols-3 gap-2">
        {SKILLS.map((s) => {
          const active = user.skillLevel === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => commit({ skillLevel: s.key })}
              className={`rounded-2xl py-3 text-sm font-medium border ${
                active
                  ? "bg-sky-500 text-white border-sky-500"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              <div className="text-2xl" aria-hidden>{s.emoji}</div>
              <div className="mt-0.5">{s.label}</div>
            </button>
          );
        })}
      </div>

      <SectionHeader title="Preferred wave height" emoji="🌊" />
      <Card>
        <input
          type="range"
          min="0.4"
          max="3"
          step="0.1"
          value={user.preferredWaveHeight}
          onChange={(e) => commit({ preferredWaveHeight: Number(e.target.value) })}
          className="w-full accent-sky-500"
        />
        <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
          <span>0.4m</span>
          <span className="font-semibold text-slate-900 text-base tabular-nums">
            {user.preferredWaveHeight.toFixed(1)}m
          </span>
          <span>3m</span>
        </div>
      </Card>

      <SectionHeader title="Favorite beaches" emoji="⭐" />
      <div className="space-y-2">
        {BEACHES.map((b) => {
          const fav = user.favoriteBeachIds.includes(b.id);
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => toggleFavorite(b.id)}
              className={`w-full rounded-2xl border p-3 flex items-center gap-3 text-left ${
                fav ? "bg-sand-100 border-sand-300" : "bg-white border-slate-200"
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-xl flex items-center justify-center">
                {b.hero.emoji}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-900">{b.name}</div>
                <div className="text-xs text-slate-500">{b.area}, {b.country}</div>
              </div>
              <div className="text-xl" aria-hidden>{fav ? "⭐" : "☆"}</div>
            </button>
          );
        })}
      </div>

      {saved ? (
        <div className="text-center text-xs text-sky-700 font-medium">Saved ✨</div>
      ) : null}

      <button
        type="button"
        onClick={handleSignOut}
        className="w-full rounded-2xl border border-slate-200 bg-white text-slate-700 font-semibold py-3 mt-2"
      >
        Sign out
      </button>
    </AppShell>
  );
}
