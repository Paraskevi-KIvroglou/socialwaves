"use client";

import { useAuthActions, useAuthToken } from "@convex-dev/auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { safeReturnPath } from "@/auth/routes";

/** Convex Auth may stash `code=` inside `next`; replay once for server-side exchange */
const MAGIC_NEXT_BOUNCE_KEY = "__socialwave_magic_next";

function LoginCardShell({
  children,
  busy,
}: {
  children: ReactNode;
  busy?: boolean;
}) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-blue-50 to-sky-200/90 px-4 py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(56,189,248,0.35),transparent)]"
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div
          className="rounded-2xl border border-sky-200/90 bg-white/85 p-8 shadow-lg shadow-sky-900/10 backdrop-blur-sm"
          aria-busy={busy}
        >
          {children}
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

/** Shown while `useSearchParams()` resolves (Next requires Suspense; never use `fallback={null}` here) */
function LoginSearchParamsFallback() {
  return (
    <LoginCardShell busy>
      <h1 className="text-2xl font-semibold tracking-tight text-blue-950">
        Sign in
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-blue-900/75">
        Loading the sign-in form…
      </p>
      <div className="mt-6 flex flex-col gap-4">
        <label
          className="block text-sm font-medium text-blue-950"
          htmlFor="email-loading"
        >
          Email address
        </label>
        <input
          id="email-loading"
          disabled
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-xl border border-sky-200 bg-sky-50/30 px-4 py-3 text-blue-950 opacity-60"
        />
        <button
          type="button"
          disabled
          className="rounded-xl bg-blue-950/50 px-4 py-3 text-sm font-medium text-sky-100"
        >
          Loading…
        </button>
      </div>
    </LoginCardShell>
  );
}

function useReplayMagicNextParam(
  router: ReturnType<typeof useRouter>,
  rawNext: string | null,
) {
  const didReplay = useRef(false);
  useEffect(() => {
    if (
      didReplay.current ||
      !rawNext ||
      !rawNext.includes("code=") ||
      !rawNext.startsWith("/") ||
      rawNext.startsWith("//")
    ) {
      return;
    }
    try {
      const seen = sessionStorage.getItem(MAGIC_NEXT_BOUNCE_KEY);
      if (seen === rawNext) return;
      sessionStorage.setItem(MAGIC_NEXT_BOUNCE_KEY, rawNext);
    } catch {
      /* private mode */
    }
    didReplay.current = true;
    router.replace(rawNext);
  }, [router, rawNext]);
}

/** Reads `?next=` — must stay inside `<Suspense>` */
function LoginWithSearchParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawNext = searchParams.get("next");
  const redirectTo = useMemo(() => safeReturnPath(rawNext), [rawNext]);

  useReplayMagicNextParam(router, rawNext);

  return <LoginInteractive redirectTo={redirectTo} />;
}

function LoginInteractive({ redirectTo }: { redirectTo: string }) {
  const { signIn } = useAuthActions();
  const token = useAuthToken();
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      router.replace(redirectTo);
    }
  }, [token, redirectTo, router]);

  const submit = useCallback(
    async (email: string) => {
      setError(null);
      setSent(false);
      setPending(true);
      try {
        const result = await signIn("resend", {
          email,
          redirectTo,
        });
        if (!result.signingIn) {
          setSent(true);
        }
      } catch (err) {
        console.error("Magic link sign-in failed", err);
        setError(
          "We could not send that link. Check the email or try again in a minute.",
        );
      } finally {
        setPending(false);
      }
    },
    [redirectTo, signIn],
  );

  return (
    <LoginCardShell busy={pending}>
      <h1 className="text-2xl font-semibold tracking-tight text-blue-950">
        Sign in
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-blue-900/75">
        We&apos;ll send a magic link to your email — no password. Use the same
        device/browser you requested the link from when you open it.
      </p>
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const email = String(fd.get("email") ?? "").trim();
          void submit(email);
        }}
      >
        <label
          htmlFor="email"
          className="block text-sm font-medium text-blue-950 text-left"
        >
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-sky-300/80 bg-sky-50/50 px-4 py-3 text-blue-950 shadow-inner shadow-sky-900/5 outline-none ring-blue-900/20 transition placeholder:text-blue-900/40 focus:border-sky-500 focus:ring-2"
        />
        <button
          type="submit"
          disabled={pending}
          aria-busy={pending}
          className="rounded-xl bg-blue-950 px-4 py-3 text-sm font-medium text-sky-100 shadow-md shadow-blue-950/25 transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800 disabled:cursor-not-allowed disabled:bg-blue-950/70 disabled:text-sky-100/70"
        >
          {pending ? "Sending…" : "Send magic link"}
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
          Check your inbox for the email from SocialWave. If nothing appears,
          verify spam or promotions.
        </p>
      )}
    </LoginCardShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSearchParamsFallback />}>
      <LoginWithSearchParams />
    </Suspense>
  );
}
