"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signInDemo, updateSession } from "@/lib/mockAuth";
import type { SkillLevel, User } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const [session, setSession] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");

  useEffect(() => {
    setSession(getSession());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signInDemo(email.trim());
    updateSession({ displayName: displayName.trim(), skillLevel });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50 flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          🏄 Welcome to SocialWave
        </h1>
        <p className="mt-2 text-slate-700 text-sm sm:text-base">Forecasts predict. Surfers verify.</p>
      </div>

      {session ? (
        <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-200/80 shadow-[var(--shadow-pop)] p-6 text-center">
          <p className="text-slate-700 text-sm">
            You&apos;re already signed in as{" "}
            <span className="font-semibold text-sky-700">@{session.handle}</span>
          </p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sky-600 font-semibold text-sm underline underline-offset-2"
          >
            Go to dashboard
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-3xl bg-white border border-slate-200/80 shadow-[var(--shadow-pop)] p-6 space-y-4"
        >
          <div>
            <label htmlFor="email" className="text-xs font-medium text-slate-500">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <label htmlFor="displayName" className="text-xs font-medium text-slate-500">
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              required
              autoComplete="name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <div>
            <label htmlFor="skillLevel" className="text-xs font-medium text-slate-500">
              Skill level
            </label>
            <select
              id="skillLevel"
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value as SkillLevel)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-sky-500 text-white font-semibold py-3.5 shadow-[var(--shadow-soft)] active:scale-[0.99] hover:bg-sky-600"
          >
            Continue
          </button>
        </form>
      )}
    </div>
  );
}
