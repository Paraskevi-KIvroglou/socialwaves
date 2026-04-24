import type { ReportKind } from "./types";

export const REPORT_META: Record<
  ReportKind,
  { label: string; emoji: string; tone: "positive" | "neutral" | "negative" | "hero" }
> = {
  waves_there: { label: "Waves were there", emoji: "🌊", tone: "positive" },
  no_waves: { label: "No waves", emoji: "💤", tone: "negative" },
  smaller_than_predicted: { label: "Smaller than predicted", emoji: "📉", tone: "negative" },
  too_windy: { label: "Too windy", emoji: "🌬️", tone: "negative" },
  too_crowded: { label: "Too crowded", emoji: "👥", tone: "neutral" },
  unsafe: { label: "Unsafe", emoji: "⚠️", tone: "negative" },
  perfect_session: { label: "Perfect session", emoji: "🔥", tone: "hero" },
};
