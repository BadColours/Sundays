import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { bindings, createSession, deleteSession, getCreatorForSession, type Creator } from "../db/repository";

export const SESSION_COOKIE = "sundays_session";
export const OAUTH_STATE_COOKIE = "sundays_oauth_state";

export async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomToken(byteLength = 32) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export async function currentCreator(): Promise<Creator | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;
  return await getCreatorForSession(await sha256(rawToken));
}

export async function requireCreator(returnTo = "/dashboard"): Promise<Creator> {
  const creator = await currentCreator();
  if (creator) return creator;
  redirect(`/submit?return_to=${encodeURIComponent(returnTo)}`);
}

export async function startCreatorSession(creatorId: string) {
  const rawToken = randomToken();
  await createSession(await sha256(rawToken), creatorId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, rawToken, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function endCreatorSession() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;
  if (rawToken) {
    try { await deleteSession(await sha256(rawToken)); } catch { /* binding may be absent locally */ }
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function githubAuthConfigured() {
  const runtime = bindings();
  return Boolean(runtime.GITHUB_CLIENT_ID && runtime.GITHUB_CLIENT_SECRET);
}

export function isAdmin(creator: Creator | null) {
  if (!creator) return false;
  const allowed = (bindings().ADMIN_GITHUB_HANDLES ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(creator.github_handle.toLowerCase());
}

export function safeReturnTo(value: string | null, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  try {
    const parsed = new URL(value, "https://sundays.local");
    return parsed.origin === "https://sundays.local" ? `${parsed.pathname}${parsed.search}` : fallback;
  } catch {
    return fallback;
  }
}
