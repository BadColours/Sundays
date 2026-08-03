import { NextRequest, NextResponse } from "next/server";
import { createReport, getProjectById } from "../../../../../db/repository";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project || project.moderation_status !== "approved") return new NextResponse("Not found", { status: 404 });
  const form = await request.formData();
  const reason = String(form.get("reason") ?? "broken_link").slice(0, 40);
  const details = String(form.get("details") ?? "").trim().slice(0, 500) || null;
  await createReport(id, reason, details);
  return NextResponse.redirect(new URL(`/project/${project.slug}?reported=1`, request.url), 303);
}
