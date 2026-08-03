import { NextRequest, NextResponse } from "next/server";
import { bindings, consumeOAuthState, upsertCreator } from "../../../../../db/repository";
import { OAUTH_STATE_COOKIE, SESSION_COOKIE, randomToken, sha256 } from "../../../../../lib/auth";
import { createSession } from "../../../../../db/repository";

export const dynamic = "force-dynamic";

type GitHubProfile = { id: number; login: string; name: string | null; avatar_url: string; html_url: string };

export async function GET(request: NextRequest) {
  const runtime = bindings();
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  if (!code || !state || !stateCookie || state !== stateCookie || !runtime.GITHUB_CLIENT_ID || !runtime.GITHUB_CLIENT_SECRET) {
    return NextResponse.redirect(new URL("/submit?error=github_auth_failed", request.url));
  }
  const returnTo = await consumeOAuthState(await sha256(state));
  if (!returnTo) return NextResponse.redirect(new URL("/submit?error=github_auth_expired", request.url));

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      client_id: runtime.GITHUB_CLIENT_ID,
      client_secret: runtime.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: new URL("/api/auth/github/callback", runtime.APP_ORIGIN ?? request.nextUrl.origin).toString(),
    }),
  });
  const tokenPayload = await tokenResponse.json() as { access_token?: string; error?: string };
  if (!tokenResponse.ok || !tokenPayload.access_token) return NextResponse.redirect(new URL("/submit?error=github_auth_failed", request.url));

  const profileResponse = await fetch("https://api.github.com/user", {
    headers: { authorization: `Bearer ${tokenPayload.access_token}`, accept: "application/vnd.github+json", "user-agent": "Sundays-Gallery" },
  });
  if (!profileResponse.ok) return NextResponse.redirect(new URL("/submit?error=github_profile_failed", request.url));
  const profile = await profileResponse.json() as GitHubProfile;
  const creator = await upsertCreator({
    githubId: String(profile.id),
    githubHandle: profile.login,
    displayName: profile.name?.trim() || profile.login,
    avatarUrl: profile.avatar_url,
    profileUrl: profile.html_url,
  });
  const rawSession = randomToken();
  await createSession(await sha256(rawSession), creator.id);
  const destination = new URL(returnTo, request.nextUrl.origin);
  const response = NextResponse.redirect(destination);
  response.cookies.delete(OAUTH_STATE_COOKIE);
  response.cookies.set(SESSION_COOKIE, rawSession, {
    httpOnly: true,
    secure: destination.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
  return response;
}
