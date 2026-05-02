"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_APP_ROUTE = "/dashboard";
const MAGIC_BOUNCE_KEY = "socialwave:magicLinkNextBounce";

function safeAppPath(path: string | null) {
  if (
    !path ||
    path === "/" ||
    path.startsWith("/login") ||
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return DEFAULT_APP_ROUTE;
  }
  return path;
}

function LoginPageContent() {
  const { signIn } = useAuthActions();
  const token = useAuthToken();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = useMemo(
    () => safeAppPath(searchParams.get("next")),
    [searchParams],
  );
  const didBounceMagicLink = useRef(false);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      router.replace(redirectTo);
    }
  }, [token, redirectTo, router]);

  // If sign-in was skipped (e.g. Accept header) we may land on /login?next=/app?code=...
  // One navigation to that URL lets the proxy exchange ?code= at the top level.
  useEffect(() => {
    const rawNext = searchParams.get("next");
    if (
      !rawNext ||
      !rawNext.includes("code=") ||
      !rawNext.startsWith("/") ||
      rawNext.startsWith("//") ||
      didBounceMagicLink.current
    ) {
      return;
    }
    try {
      if (sessionStorage.getItem(MAGIC_BOUNCE_KEY) === rawNext) return;
      sessionStorage.setItem(MAGIC_BOUNCE_KEY, rawNext);
    } catch {
      /* private mode */
    }
    didBounceMagicLink.current = true;
    router.replace(rawNext);
  }, [searchParams, router]);

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
              setError(null);
              setSent(false);
              setPending(true);

              try {
                const form = new FormData(e.currentTarget);
                form.set("redirectTo", redirectTo);
                const result = await signIn("resend", form);
                if (!result.signingIn) {
                  setSent(true);
                }
              } catch (err) {
                console.error("Magic link sign-in failed", err);
                setError(
                  "We couldn't send that link. Please check the email and try again.",
                );
              } finally {
                setPending(false);
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
              disabled={pending}
              aria-busy={pending}
              className="rounded-xl bg-blue-950 px-4 py-3 text-sm font-medium text-sky-100 shadow-md shadow-blue-950/25 transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-not-allowed disabled:bg-blue-950/70 disabled:text-sky-100/70"
            >
              {pending ? "Sending..." : "Email me a sign-in link"}
            </button>
          </form>
          {error && (
            <p
              className="mt-4 rounded-xl border border-rose-200/90 bg-rose-50/90 px-4 py-3 text-sm text-rose-900"
              role="alert"
            >
              {error}
            </p>
          )}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
