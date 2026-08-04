import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "cloudflare:workers";
import { getOwnedProject, queueThumbnail } from "../../../../../db/repository";
import { currentCreator } from "../../../../../lib/auth";
import { captureProjectThumbnail } from "../../../../../lib/thumbnails";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.redirect(new URL("/submit?error=signin_required", request.url), 303);
  const { id } = await params;
  const project = await getOwnedProject(id, creator.id);
  if (!project) return new NextResponse("Not found", { status: 404 });
  await queueThumbnail(id);
  waitUntil(captureProjectThumbnail(id));
  return NextResponse.redirect(new URL("/dashboard?updated=thumbnail", request.url), 303);
}
