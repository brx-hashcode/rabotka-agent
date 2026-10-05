import { NextResponse, type NextRequest } from "next/server";

/**
 * Same-origin API: the browser calls /api/... and this forwards it to
 * rabotka-backend, like the Vite proxy and nginx `/api/` block in rabotka-admin.
 *
 * Done here rather than with `rewrites` in next.config.ts because those are
 * frozen into the build. Proxy reads BACKEND_URL per request, so a single image
 * serves both develop and production.
 */
export function proxy(request: NextRequest) {
  const backend = process.env.BACKEND_URL;
  if (!backend) {
    return NextResponse.json(
      { message: "BACKEND_URL is not configured" },
      { status: 502 },
    );
  }

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, backend);
  return NextResponse.rewrite(target);
}

export const config = {
  matcher: "/api/:path*",
};
