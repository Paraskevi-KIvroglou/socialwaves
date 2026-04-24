import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server";

const convexAuth = convexAuthNextjsMiddleware();

export function proxy(request: NextRequest, event: NextFetchEvent) {
  return convexAuth(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
