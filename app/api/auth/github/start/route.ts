import { NextRequest, NextResponse } from "next/server";
import { bindings, createOAuthState } from "../../../../../db/repository";
import { OAUTH_STATE_COOKIE, randomToken, safeReturnTo, sha256 } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const runtime = bindings();
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("return_to"));
  if (!runtime.GITHUB_CLIENT_ID || !runtime.GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/submit?error=github_not_configured", request.url));
  }
  const state = randomToken();
  await createOAuthState(await sha256(state), returnTo);
  const callback = new URL("/api/auth/github/callback", runtime.APP_ORIGIN ?? request.nextUrl.origin);
  const authorization = new URL("https://github.com/login/oauth/authorize");
  authorization.searchParams.set("client_id", runtime.GITHUB_CLIENT_ID);
  authorization.searchParams.set("redirect_uri", callback.toString());
  authorization.searchParams.set("state", state);
  // No scope parameter: GitHub returns public identity only. Repository access is never requested.
  const response = NextResponse.redirect(authorization);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: callback.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
