import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-gradient-to-b from-sky-100 via-blue-50 to-sky-200/90 px-6 py-12 font-sans">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(56,189,248,0.3),transparent)]"
        aria-hidden
      />
      <main className="relative flex w-full max-w-lg flex-col gap-8 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-blue-950 sm:text-4xl">
            SocialWaves
          </h1>
          <p className="mt-3 text-balance text-blue-900/80">
            Convex + magic-link sign-in, with your home surf spot saved on your
            profile.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-blue-950 px-5 py-3 text-center text-sm font-medium text-sky-100 shadow-md shadow-blue-950/25 transition hover:bg-blue-900"
          >
            Sign in with email
          </Link>
          <Link
            href="/dashboard"
            className="rounded-xl border border-sky-400/60 bg-white/60 px-5 py-3 text-center text-sm font-medium text-blue-950 shadow-sm backdrop-blur-sm transition hover:border-sky-500 hover:bg-white/80"
          >
            Dashboard
          </Link>
        </div>
        <p className="text-sm text-blue-900/55">
          Dev: run{" "}
          <code className="rounded-md bg-sky-100/90 px-1.5 py-0.5 font-mono text-[0.8rem] text-blue-950">
            npm run convex
          </code>
          . On Convex, set Resend keys and{" "}
          <code className="rounded-md bg-sky-100/90 px-1.5 py-0.5 font-mono text-[0.8rem] text-blue-950">
            SITE_URL
          </code>{" "}
          separately for dev (
          <code className="rounded-md bg-sky-100/90 px-1.5 py-0.5 font-mono text-[0.8rem] text-blue-950">
            localhost:3000
          </code>
          ) vs prod (your cloud app URL).
        </p>
      </main>
    </div>
  );
}
