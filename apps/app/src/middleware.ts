import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Middleware: auth gate for protected routes.
 *
 * Subscription enforcement is handled server-side via requireSubscription()
 * in individual pages/API routes rather than here, to avoid DB queries on
 * every request in the middleware layer.
 */
export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/users/:path*",
    "/components/:path*",
    "/test/:path*",
  ],
};
