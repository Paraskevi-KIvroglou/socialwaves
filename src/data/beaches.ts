import type { Beach } from "@/lib/types";
// Deprecated: beaches live in Convex. Use `useQuery(api.beaches.listAll)` instead.
export const BEACHES: Beach[] = [];
export function getBeach(_id: string): Beach | undefined { return undefined; }
