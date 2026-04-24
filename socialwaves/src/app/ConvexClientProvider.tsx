"use client";
import type { ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

// falls back to a placeholder URL if NEXT_PUBLIC_CONVEX_URL is not set yet
// (before `npx convex dev` has been run). queries will stay in the loading
// state instead of crashing the render.
const url = process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://placeholder.convex.cloud";
const client = new ConvexReactClient(url, { unsavedChangesWarning: false });

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}
