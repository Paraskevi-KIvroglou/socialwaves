import type { AgentInsight } from "@/lib/types";

export const AGENT_INSIGHTS: AgentInsight[] = [
  {
    id: "a1",
    agent: "forecast",
    title: "Clean morning swell",
    body: "Waist-high lines with light offshore wind until about 10am — then it blows out.",
    emoji: "📡",
  },
  {
    id: "a2",
    agent: "beach_scout",
    title: "Try Kolymbithres today",
    body: "Your favorite Greek spot is rated 82 and the wind angle matches your usual sessions.",
    emoji: "🧭",
  },
  {
    id: "a3",
    agent: "reality_check",
    title: "Vouliagmeni may be overpredicted",
    body: "Forecast looked good, but 4 surfers reported weak waves in the last 6 hours.",
    emoji: "🔍",
  },
  {
    id: "a4",
    agent: "trust_score",
    title: "Capo Mannu just hit 90",
    body: "Surfer reports line up with predicted size 9 out of last 10 days. Most trustworthy spot this week.",
    emoji: "🛡️",
  },
  {
    id: "a5",
    agent: "personal_coach",
    title: "You score your best on 1.1–1.4m",
    body: "Across your last 12 sessions, you're 3x more likely to log a 'perfect session' in that range.",
    emoji: "🎯",
  },
];
