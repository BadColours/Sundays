import { mutationGuard, readBoundedFormData } from "../../../../../lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { resolveProjectReport } from "../../../../../db/repository";
import { currentCreator, isAdmin } from "../../../../../lib/auth";

const actions = new Set(["reviewed", "dismissed", "unavailable"]);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejected = mutationGuard(request);
  if (rejected) return rejected;
  const creator = await currentCreator();
  if (!isAdmin(creator)) return new NextResponse("Forbidden", { status: 403 });
  const form = await readBoundedFormData(request);
  const action = String(form.get("action") ?? "");
  if (!actions.has(action)) return new NextResponse("Invalid action", { status: 400 });
  const { id } = await params;
  if (!await resolveProjectReport(id, action as "reviewed" | "dismissed" | "unavailable")) return new NextResponse("Not found", { status: 404 });
  return NextResponse.redirect(new URL("/admin?report_updated=1", request.url), 303);
}
