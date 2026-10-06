import { NextResponse, type NextRequest } from "next/server";

import {
  backendPost,
  forbidden,
  isSameOrigin,
  readJson,
  setSessionCookies,
  type AgentTokens,
} from "#/lib/auth/session-server";

/** Exchange email + code for a session. The tokens never reach the browser's JS. */
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbidden();

  const { email, otp } = (await readJson(req)) as {
    email?: string;
    otp?: string;
  };
  const upstream = await backendPost(req, "/agent/auth/verify-otp", {
    email,
    otp,
  });
  const data = await readJson(upstream);
  if (!upstream.ok) return NextResponse.json(data, { status: upstream.status });

  const res = NextResponse.json({ agent: data.agent });
  setSessionCookies(res, data as unknown as AgentTokens);
  return res;
}
