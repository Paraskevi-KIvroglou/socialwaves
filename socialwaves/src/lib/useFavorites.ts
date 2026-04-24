"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";
import { getSession } from "./mockAuth";

export function useFavorites() {
  const [handle, setHandle] = useState<string | null>(null);
  useEffect(() => { setHandle(getSession()?.handle ?? null); }, []);
  const slugs = useQuery(api.favorites.list, handle ? { userHandle: handle } : "skip");
  const toggleMut = useMutation(api.favorites.toggle);
  async function toggle(beachSlug: string) {
    if (!handle) return;
    await toggleMut({ userHandle: handle, beachSlug });
  }
  return { favoriteSlugs: slugs ?? [], toggle, handle };
}
