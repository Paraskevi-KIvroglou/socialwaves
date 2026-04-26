"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const token = useAuthToken();
  const router = useRouter();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (token) {
      router.replace("/dashboard");
    }
  }, [token, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-blue-50 to-sky-200/90 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.35),transparent)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-sky-200/90 bg-white/85 p-8 shadow-lg shadow-sky-900/10 backdrop-blur-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-blue-950">
            Sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-blue-900/75">
            Enter your email and we&apos;ll send you a magic link to sign in. No
            password needed.
          </p>
          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              form.set("redirectTo", "/dashboard");
              const result = await signIn("resend", form);
              if (!result.signingIn) {
                setSent(true);
              }
            }}
          >
            <label className="sr-only" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-sky-300/80 bg-sky-50/50 px-4 py-3 text-blue-950 shadow-inner shadow-sky-900/5 outline-none ring-blue-900/20 transition placeholder:text-blue-900/40 focus:border-sky-500 focus:ring-2"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-950 px-4 py-3 text-sm font-medium text-sky-100 shadow-md shadow-blue-950/25 transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
            >
              Email me a sign-in link
            </button>
          </form>
          {sent && (
            <p
              className="mt-4 rounded-xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900"
              role="status"
            >
              Check your inbox. We&apos;ve sent the link.
            </p>
          )}
        </div>
        <p className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-blue-900/70 underline decoration-sky-400/80 underline-offset-4 transition hover:text-blue-950"
          >
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
