"use client";
import Link from "next/link";
import { Logo } from "./Logo";

export function TopHeader({ greeting }: { greeting?: string }) {
  return (
    <header className="pt-safe sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" aria-label="SocialWave home">
          <Logo size="md" />
        </Link>
        <Link
          href="/profile"
          className="h-10 w-10 rounded-full bg-sand-300 text-sand-700 flex items-center justify-center text-xl border border-sand-200 shadow-[var(--shadow-soft)]"
          aria-label="Profile"
        >
          🏄
        </Link>
      </div>
      {greeting ? (
        <div className="mx-auto max-w-md px-4 pb-3 text-slate-500 text-sm">{greeting}</div>
      ) : null}
    </header>
  );
}
