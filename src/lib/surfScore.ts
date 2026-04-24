import type { SkillLevel } from "./types";

export function computeSurfScore(input: {
  waveHeight: number;
  swellPeriod: number;
  windSpeed: number;
  skillLevel: SkillLevel;
  preferredHeight: number;
}): number {
  const { waveHeight, swellPeriod, windSpeed, skillLevel, preferredHeight } = input;
  const heightDelta = Math.abs(waveHeight - preferredHeight);
  const heightScore = Math.max(0, 100 - heightDelta * 40);
  const periodScore = Math.min(100, swellPeriod * 9);
  const windPenalty = Math.max(0, (windSpeed - 12) * 3);
  const skillAdjust =
    skillLevel === "beginner" && waveHeight > 1.8
      ? -20
      : skillLevel === "advanced" && waveHeight < 0.6
        ? -15
        : 0;
  const raw =
    heightScore * 0.5 + periodScore * 0.4 - windPenalty + skillAdjust + 10;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function scoreLabel(score: number): { label: string; emoji: string } {
  if (score >= 80) return { label: "Fire", emoji: "🔥" };
  if (score >= 65) return { label: "Going off", emoji: "🤙" };
  if (score >= 45) return { label: "Worth a paddle", emoji: "🏄" };
  if (score >= 25) return { label: "Marginal", emoji: "😐" };
  return { label: "Flat", emoji: "💤" };
}

export function scoreColor(score: number): string {
  if (score >= 80) return "bg-sand-500 text-white";
  if (score >= 65) return "bg-sand-300 text-sand-900";
  if (score >= 45) return "bg-sky-300 text-sky-900";
  if (score >= 25) return "bg-sky-100 text-sky-700";
  return "bg-slate-100 text-slate-500";
}
