import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 p-8 font-sans">
      <main className="flex w-full max-w-lg flex-col gap-6 text-center sm:text-left">
        <h1 className="text-3xl font-semibold">SocialWaves</h1>
        <p className="text-zinc-600">
          Convex + Convex Auth (magic link) with a per-user home location on the
          `users` document.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/login"
            className="rounded-md bg-zinc-900 px-4 py-2 text-center text-white"
          >
            Login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-4 py-2 text-center"
          >
            Dashboard
          </Link>
        </div>
        <p className="text-sm text-zinc-500">
          Run <code className="rounded bg-zinc-200 px-1">npm run convex</code>{" "}
          in another terminal, then set Resend and{" "}
          <code className="rounded bg-zinc-200 px-1">SITE_URL</code> in the
          Convex dashboard.
        </p>
      </main>
    </div>
  );
}
