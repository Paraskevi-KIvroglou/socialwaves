import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  as: As = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "article";
}) {
  return (
    <As
      className={cn(
        "rounded-2xl bg-white border border-slate-200 shadow-[var(--shadow-soft)] p-5",
        className
      )}
    >
      {children}
    </As>
  );
}
