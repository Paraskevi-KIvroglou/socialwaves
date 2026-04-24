"use client";
import type { User } from "./types";

const KEY = "socialwave.session.v1";

export const DEFAULT_USER: User = {
  id: "u_demo",
  handle: "surfer",
  displayName: "",
  email: "demo@socialwave.app",
  skillLevel: "intermediate",
  preferredWaveHeight: 1.2,
  favoriteBeachIds: ["tinos-kolymbithres", "vouliagmeni", "falassarna"],
  createdAt: new Date().toISOString(),
};

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function signInDemo(email: string): User {
  const e = (email || DEFAULT_USER.email).trim();
  const fromEmail = e.split("@")[0]?.replace(/[._+]/g, " ").replace(/-/g, " ").trim();
  const displayName = fromEmail
    ? fromEmail
        .split(/\s+/)
        .map(
          (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join(" ")
    : "";
  const u: User = { ...DEFAULT_USER, email: e, displayName };
  window.localStorage.setItem(KEY, JSON.stringify(u));
  return u;
}

export function signOut(): void {
  if (typeof window !== "undefined") window.localStorage.removeItem(KEY);
}

export function updateSession(patch: Partial<User>): User {
  const current = getSession() ?? DEFAULT_USER;
  const next = { ...current, ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
