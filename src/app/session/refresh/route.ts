import { NextResponse, type NextRequest } from "next/server";

import { REFRESH_COOKIE } from "#/lib/auth/cookies";
import {
  backendPost,
  clearSessionCookies,
  forbidden,
  isSameOrigin,
  readJson,
  setSessionCookies,
  type AgentTokens,
} from "#/lib/auth/session-server";

/**
 * Rotate the token pair. The refresh token is single-use, so the client calls
 * this once per burst of 401s (see session-client.ts), never per request.
 */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbidden();

  const refreshToken = req.cookies.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    const upstream = await backendPost(req, "/agent/auth/refresh", {
      refreshToken,
    });
    if (upstream.ok) {
      const data = await readJson(upstream);
      const res = NextResponse.json({ agent: data.agent });
      setSessionCookies(res, data as unknown as AgentTokens);
      return res;
    }
  }

  const res = NextResponse.json(
    { message: "Session expirée" },
    { status: 401 },
  );
  clearSessionCookies(res);
  return res;
}
