import { NextResponse } from "next/server";

export function formRedirect(request: Request, location: string) {
  if (request.headers.get("accept")?.includes("application/json")) return NextResponse.json({ location });
  return NextResponse.redirect(new URL(location,request.url),303);
}

export function formFailure(request: Request, path: string, error: unknown) {
  const message = error instanceof Error && error.name === "InputError" ? error.message : "Your project couldn’t be saved. Please try again.";
  if (request.headers.get("accept")?.includes("application/json")) return NextResponse.json({error:message},{status:422});
  return NextResponse.redirect(new URL(`${path}?error=${encodeURIComponent(message)}`,request.url),303);
}
