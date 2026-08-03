import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "../../../../db/repository";
import { SESSION_COOKIE, sha256 } from "../../../../lib/auth";

export async function POST(request: NextRequest) {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  if (raw) await deleteSession(await sha256(raw));
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
