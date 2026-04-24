import { scoreColor, scoreLabel } from "@/lib/surfScore";
import { cn } from "@/lib/cn";

export function SurfScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  const { label, emoji } = scoreLabel(score);
  const color = scoreColor(score);
  const sizes = {
    sm: "text-xs px-2.5 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
    lg: "text-base px-4 py-2 gap-2",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold",
        color,
        sizes[size]
      )}
    >
      <span aria-hidden>{emoji}</span>
      <span className="tabular-nums">{score}</span>
      <span className="opacity-80">· {label}</span>
    </span>
  );
}
