import type { User } from "./types";

type ConvexMe = { name?: string | null; email?: string | null } | null | undefined;

export function greetingName(localSession: User | null | undefined, me: ConvexMe): string {
  const convexName = (me?.name ?? "").trim();
  if (convexName) return convexName.split(" ")[0]!;
  const local = (localSession?.displayName ?? "").trim();
  if (local) return local.split(" ")[0]!;
  const email = (me?.email ?? localSession?.email ?? "").trim();
  if (email) {
    const handle = email.split("@")[0]?.replace(/[._+-]/g, " ").trim();
    if (handle) return handle.split(/\s+/)[0]!.replace(/^./, (c) => c.toUpperCase());
  }
  return "surfer";
}
