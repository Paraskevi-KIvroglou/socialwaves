"use client";
import type { User } from "./types";

const KEY = "socialwave.session.v1";

export const DEFAULT_USER: User = {
  id: "u_demo",
  handle: "salty_nassos",
  displayName: "Nassos",
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
  const u: User = { ...DEFAULT_USER, email: email || DEFAULT_USER.email };
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
