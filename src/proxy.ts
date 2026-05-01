import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Only `/login` is reachable without a session. Everything else (incl. `/`)
// redirects unauthenticated users to the magic-link sign-in page.
const isPublicRoute = createRouteMatcher(["/login"]);
const DEFAULT_APP_ROUTE = "/dashboard";

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
  return convexAuth(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
