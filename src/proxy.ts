import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";

// Only `/login` is reachable without a session. Everything else (incl. `/`)
// redirects unauthenticated users to the magic-link sign-in page.
const isPublicRoute = createRouteMatcher(["/login"]);

const convexAuth = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthed = await convexAuth.isAuthenticated();

  if (!isPublicRoute(request) && !isAuthed) {
    return nextjsMiddlewareRedirect(request, "/login");
  }

  if (isPublicRoute(request) && isAuthed) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
});

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return convexAuth(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
