"use client";
import { useMemo, type ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => {
    if (!url) {
      throw new Error(
        "NEXT_PUBLIC_CONVEX_URL is missing. Run `npx convex dev` in the socialwaves folder and add the printed URL to .env.local.",
      );
    }
    return new ConvexReactClient(url, { unsavedChangesWarning: false });
  }, [url]);

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
