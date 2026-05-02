import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextRequest, type NextFetchEvent } from "next/server";

// Only `/login` is reachable without a session. Everything else (incl. `/`)
// redirects unauthenticated users to the magic-link sign-in page.
const isPublicRoute = createRouteMatcher(["/login"]);
const DEFAULT_APP_ROUTE = "/dashboard";

/**
 * Convex Auth only exchanges `?code=` when Accept includes `text/html`. Some clients
 * (in-app browsers, link previews) send a generic wildcard Accept or omit HTML — exchange
 * is skipped, the user is sent to /login with `code` buried in `?next=`, and sign-in never completes.
 */
function withHtmlAcceptForMagicLinkCode(request: NextRequest): NextRequest {
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

function safeAppPath(path: string | null) {
  if (
    !path ||
    path === "/" ||
    path.startsWith("/login") ||
    !path.startsWith("/") ||
    path.startsWith("//")
  ) {
    return DEFAULT_APP_ROUTE;
  }
  return path;
}

function requestedAppPath(request: NextRequest) {
  return safeAppPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
}

function loginRouteFor(request: NextRequest) {
  const redirectTo = encodeURIComponent(requestedAppPath(request));
  return `/login?next=${redirectTo}`;
}

const convexAuth = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthed = await convexAuth.isAuthenticated();

  if (!isPublicRoute(request) && !isAuthed) {
    return nextjsMiddlewareRedirect(request, loginRouteFor(request));
  }

  if (isPublicRoute(request) && isAuthed) {
    return nextjsMiddlewareRedirect(
      request,
      safeAppPath(request.nextUrl.searchParams.get("next")),
    );
  }
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return convexAuth(withHtmlAcceptForMagicLinkCode(request), event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
