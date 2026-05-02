/**
 * Shared rules for Convex Auth redirects (proxy + login page).
 */

import { NextRequest } from "next/server";

export const POST_SIGN_IN_DEFAULT = "/dashboard";

/** Routes reachable without an auth cookie before other logic runs */
export const UNAUTHENTICATED_PATH_PATTERNS: string[] = ["/login"];

/** Where to send anon users blocking an app-only path */
export function loginUrlWithNext(returnPath: string): string {
  return `/login?next=${encodeURIComponent(safeReturnPath(returnPath))}`;
}

/**
 * Validates `next` query and post-login targets. Paths must stay same-origin and
 * skip open redirects.
 */
export function safeReturnPath(path: string | null): string {
  const p =
    typeof path === "string" ? path.trim() : "";

  if (
    !p ||
    p === "/" ||
    p.startsWith("/login") ||
    !p.startsWith("/") ||
    p.startsWith("//") ||
    p.includes(":") ||
    p.includes("\\")
  ) {
    return POST_SIGN_IN_DEFAULT;
  }
  const [beforeNil] = p.split("\0");
  const beforeQuery = beforeNil.split("?")[0];
  const beforeHash = beforeQuery.split("#")[0];
  if (!beforeHash.startsWith("/") || beforeHash.startsWith("//")) {
    return POST_SIGN_IN_DEFAULT;
  }
  return p;
}

/**
 * Convex Auth skips `code` handling when Accept omits HTML. Remix the request so
 * the magic-link bounce always runs server-side.
 */
export function requestWithHtmlAcceptForOAuthCode(
  request: NextRequest,
): NextRequest {
  if (request.method !== "GET") return request;
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return request;

  const accept = request.headers.get("accept") ?? "";
  if (accept.includes("text/html")) return request;

  const headers = new Headers(request.headers);
  headers.set(
    "accept",
    `text/html,application/xhtml+xml;q=0.9,*/*;q=0.8${accept ? `,${accept}` : ""}`,
  );
  return new NextRequest(request.url, { headers, method: request.method });
}
