import { NextRequest, NextResponse } from "next/server";
import { consumeReportAllowance, createReport, getProjectById } from "../../../../../db/repository";

const reasons = new Set(["broken_link", "unsafe_content", "copied_work", "ownership_dispute", "other"]);

async function reportFingerprint(request: NextRequest) {
  const address = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const agent = request.headers.get("user-agent") ?? "unknown";
  const hour = new Date().toISOString().slice(0, 13);
  const bytes = new TextEncoder().encode(`${address}|${agent}|${hour}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return new NextResponse("Forbidden", { status: 403 });
  const { id } = await params;
  const project = await getProjectById(id);
  if (!project || project.moderation_status !== "approved") return new NextResponse("Not found", { status: 404 });
  if (!await consumeReportAllowance(await reportFingerprint(request))) {
    return NextResponse.redirect(new URL(`/project/${project.slug}?report_limit=1`, request.url), 303);
  }
  const form = await request.formData();
  const requestedReason = String(form.get("reason") ?? "broken_link").slice(0, 40);
  const reason = reasons.has(requestedReason) ? requestedReason : "other";
  const details = String(form.get("details") ?? "").trim().slice(0, 500) || null;
  await createReport(id, reason, details);
  return NextResponse.redirect(new URL(`/project/${project.slug}?reported=1`, request.url), 303);
}
