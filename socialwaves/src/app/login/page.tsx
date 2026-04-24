"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { signInDemo } from "@/lib/mockAuth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      signInDemo(email.trim() || "demo@socialwave.app");
      router.push("/dashboard");
    }, 600);
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-200 via-sky-100 to-sand-100 flex flex-col pt-safe pb-safe">
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-7xl mb-3" aria-hidden>🦀</div>
        <Logo size="lg" className="text-center" />
        <p className="mt-3 text-center text-slate-700 max-w-xs">
          Forecasts predict. Surfers verify. Welcome to <strong>SocialWave</strong>.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full max-w-sm rounded-3xl bg-white/85 backdrop-blur border border-white/80 p-5 shadow-[var(--shadow-pop)]"
        >
          <label htmlFor="email" className="text-xs font-medium text-slate-500">
            Your email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@ocean.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={sending}
            className="mt-4 w-full rounded-2xl bg-sky-500 disabled:bg-sky-300 text-white font-semibold py-3.5 shadow-[var(--shadow-soft)] active:scale-[0.99]"
          >
            {sending ? "Sending link…" : "Send magic link ✨"}
          </button>
          <p className="mt-3 text-[11px] text-slate-500 text-center">
            MVP demo — no real email is sent. Click and go.
          </p>
        </form>

        <div className="mt-6 text-xs text-slate-600 flex items-center gap-4">
          <span>🌊 Live forecasts</span>
          <span>🦀 Real reports</span>
          <span>🎯 Personal picks</span>
        </div>
      </div>
    </div>
  );
}
