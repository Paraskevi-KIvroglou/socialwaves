export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type Beach = {
  id: string;
  name: string;
  area: string;
  country: string;
  latitude: number;
  longitude: number;
  skillLevels: SkillLevel[];
  hero: { emoji: string; gradient: string };
  trustScore: number; // 0-100, seeded
  blurb: string;
};

export type SurfForecast = {
  waveHeight: number;        // meters
  swellPeriod: number;       // seconds
  swellDirection: number;    // degrees
  windSpeed: number;         // knots
  surfScore: number;         // 0-100
  bestWindow: string;        // human readable ("7–10am")
  updatedAt: string;         // ISO
  source: "open-meteo" | "mock";
};

export type HourlyForecast = {
  time: string;              // ISO
  waveHeight: number;
  swellPeriod: number;
  windSpeed: number;
  surfScore: number;
};

export type ReportKind =
  | "waves_there"
  | "no_waves"
  | "smaller_than_predicted"
  | "too_windy"
  | "too_crowded"
  | "unsafe"
  | "perfect_session";

export type Report = {
  id: string;
  beachId: string;
  kind: ReportKind;
  note?: string;
  createdAt: string;         // ISO
  userHandle: string;
};

export type User = {
  id: string;
  handle: string;
  displayName: string;
  email: string;
  skillLevel: SkillLevel;
  preferredWaveHeight: number; // meters
  favoriteBeachIds: string[];
  createdAt: string;
};

export type AgentInsight = {
  id: string;
  agent:
    | "forecast"
    | "beach_scout"
    | "reality_check"
    | "trust_score"
    | "personal_coach";
  title: string;
  body: string;
  emoji: string;
};
