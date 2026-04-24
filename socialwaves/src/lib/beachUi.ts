import type { Beach } from "./types";

export type ConvexBeach = {
  slug: string;
  name: string;
  area: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  skillLevels: ("beginner" | "intermediate" | "advanced")[];
  trustScore: number;
  blurb: string;
  heroEmoji: string;
  heroGradient: string;
};

export function toUiBeach(row: ConvexBeach): Beach {
  return {
    id: row.slug,
    name: row.name,
    area: row.area,
    country: row.country,
    latitude: row.latitude,
    longitude: row.longitude,
    skillLevels: row.skillLevels,
    trustScore: row.trustScore,
    blurb: row.blurb,
    hero: { emoji: row.heroEmoji, gradient: row.heroGradient },
  };
}
