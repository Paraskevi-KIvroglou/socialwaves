"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const TABS = [
  { href: "/dashboard", label: "Home", emoji: "🏠" },
  { href: "/beaches", label: "Beaches", emoji: "🏖️" },
  { href: "/reports", label: "Reports", emoji: "📝" },
  { href: "/analytics", label: "You", emoji: "📈" },
  { href: "/profile", label: "Profile", emoji: "🦀" },
];

export function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav
      className="pb-safe fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-slate-200"
      aria-label="Primary"
    >
      <ul className="mx-auto max-w-md grid grid-cols-5">
        {TABS.map((t) => {
          const active = pathname === t.href || pathname?.startsWith(t.href + "/");
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={cn(
                  "flex flex-col items-center justify-center py-2.5 gap-0.5 text-[11px] font-medium",
                  active ? "text-sky-700" : "text-slate-500"
                )}
              >
                <span
                  className={cn(
                    "flex items-center justify-center h-9 w-14 rounded-full text-xl transition-colors",
                    active ? "bg-sky-100" : "bg-transparent"
                  )}
                  aria-hidden
                >
                  {t.emoji}
                </span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
