"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { signIn } = useAuthActions();
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="text-sm text-zinc-600">
        Magic link via email (Resend). Set{" "}
        <code className="rounded bg-zinc-100 px-1">AUTH_RESEND_KEY</code> and{" "}
        <code className="rounded bg-zinc-100 px-1">AUTH_RESEND_FROM</code> in
        the Convex deployment.
      </p>
      <form
        className="flex flex-col gap-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const result = await signIn("resend", form);
          if (!result.signingIn) {
            setSent(true);
          }
        }}
      >
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="rounded border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-zinc-900 px-3 py-2 text-white"
        >
          Send sign-in link
        </button>
      </form>
      {sent && (
        <p className="text-sm text-green-700">Check your email for the link.</p>
      )}
      <Link href="/" className="text-sm text-zinc-500 underline">
        Home
      </Link>
    </div>
  );
}
