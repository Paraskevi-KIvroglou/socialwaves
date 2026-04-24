import { cn } from "@/lib/cn";

export function Logo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: "text-lg gap-1.5",
    md: "text-2xl gap-2",
    lg: "text-4xl gap-3",
  } as const;
  return (
    <span className={cn("inline-flex items-center font-semibold tracking-tight", sizes[size], className)}>
      <span aria-hidden className="drop-shadow-sm">🦀</span>
      <span className="text-slate-900">socialwave</span>
    </span>
  );
}
