import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "cloudflare:workers";
import { createProject } from "../../../db/repository";
import { currentCreator } from "../../../lib/auth";
import { verifyProjectFields, formErrorUrl } from "../../../lib/project-input";
import { captureProjectThumbnail } from "../../../lib/thumbnails";

export async function POST(request: NextRequest) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.redirect(new URL("/submit?error=signin_required", request.url), 303);
  try {
    const input = await verifyProjectFields(await request.formData(), creator.github_handle);
    const project = await createProject({ creatorId: creator.id, ...input });
    waitUntil(captureProjectThumbnail(project.id));
    return NextResponse.redirect(new URL(`/dashboard?submitted=${encodeURIComponent(project.id)}`, request.url), 303);
  } catch (error) {
    return NextResponse.redirect(new URL(formErrorUrl("/submit", error), request.url), 303);
  }
}
