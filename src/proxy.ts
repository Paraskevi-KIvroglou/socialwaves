import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextRequest, type NextFetchEvent } from "next/server";
import {
  loginUrlWithNext,
  requestWithHtmlAcceptForOAuthCode,
  safeReturnPath,
  UNAUTHENTICATED_PATH_PATTERNS,
} from "@/auth/routes";

const authVerbose = process.env.CONVEX_AUTH_VERBOSE === "1";

const isPublicRoute = createRouteMatcher(UNAUTHENTICATED_PATH_PATTERNS);

function requestedAppPath(request: NextRequest): string {
  const { pathname, search } = request.nextUrl;
  return safeReturnPath(`${pathname}${search}`);
}

const convexAuthHandler = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthed = await convexAuth.isAuthenticated();

    if (!isPublicRoute(request) && !isAuthed) {
      return nextjsMiddlewareRedirect(
        request,
        loginUrlWithNext(requestedAppPath(request)),
      );
    }

    if (isPublicRoute(request) && isAuthed) {
      const next = request.nextUrl.searchParams.get("next");
      return nextjsMiddlewareRedirect(request, safeReturnPath(next));
    }
  },
  { verbose: authVerbose },
);

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return convexAuthHandler(
    requestWithHtmlAcceptForOAuthCode(request),
    event,
  );
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
