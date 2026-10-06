import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE, REFRESH_COOKIE } from "#/lib/auth/cookies";
import { safeRedirectPath } from "#/lib/safe-redirect";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return redirectSignedIn(request);
  }
  return forwardApi(request);
}

function forwardApi(request: NextRequest) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured" },
      { status: 502 },
    );
  }

  // The session lives in httpOnly cookies on this origin; the backend only
  // understands a bearer token, and never needs to see our cookies.
  const headers = new Headers(request.headers);
  headers.delete("cookie");
  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  if (token) headers.set("authorization", `Bearer ${token}`);

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, backend);
  return NextResponse.rewrite(target, { request: { headers } });
}

function redirectSignedIn(request: NextRequest) {
  if (!request.cookies.has(REFRESH_COOKIE)) return NextResponse.next();
  const next = safeRedirectPath(request.nextUrl.searchParams.get("next")) ?? "/";
  return NextResponse.redirect(new URL(next, request.url));
}

export const config = {
  matcher: ["/api/:path*", "/auth/:path*"],
};
