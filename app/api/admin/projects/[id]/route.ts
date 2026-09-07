import { mutationGuard, readBoundedFormData } from "../../../../../lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { moderateProject } from "../../../../../db/repository";
import { currentCreator, isAdmin } from "../../../../../lib/auth";

const actions = new Set(["approve", "decline", "unavailable", "restore"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejected = mutationGuard(request);
  if (rejected) return rejected;
  const creator = await currentCreator();
  if (!isAdmin(creator)) return new NextResponse("Forbidden", { status: 403 });
  const { id } = await params;
  const form = await readBoundedFormData(request);
  const action = String(form.get("action") ?? "");
  if (!actions.has(action)) return new NextResponse("Invalid action", { status: 400 });
  const note = String(form.get("note") ?? "").trim().slice(0, 500) || null;
  await moderateProject(id, action as "approve" | "decline" | "unavailable" | "restore", note);
  return NextResponse.redirect(new URL("/admin?updated=1", request.url), 303);
}
