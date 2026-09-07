import { formRedirect, formFailure } from "../../../../lib/form-response";
import { mutationGuard, readBoundedFormData } from "../../../../lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { waitUntil } from "cloudflare:workers";
import { getOwnedProject, queueThumbnail, showOwnedProjectOnProfile, submitOwnedProjectToGallery, updateOwnedProject, withdrawOwnedProject } from "../../../../db/repository";
import { currentCreator } from "../../../../lib/auth";
import { verifyProjectFields } from "../../../../lib/project-input";
import { captureProjectThumbnail } from "../../../../lib/thumbnails";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const rejected = mutationGuard(request);
  if (rejected) return rejected;
  const creator = await currentCreator();
  if (!creator) return formRedirect(request,"/join?return_to=%2Fsubmit");
  const { id } = await params;
  const existing = await getOwnedProject(id, creator.id);
  if (!existing) return new NextResponse("Not found", { status: 404 });
  const form = await readBoundedFormData(request);
  const action = String(form.get("action") ?? "update");
  try {
    if (action === "withdraw") {
      await withdrawOwnedProject(id, creator.id);
      return NextResponse.redirect(new URL("/dashboard?updated=withdrawn", request.url), 303);
    }
    if (action === "show_profile") {
      await showOwnedProjectOnProfile(id, creator.id);
      return NextResponse.redirect(new URL("/dashboard?updated=profile", request.url), 303);
    }
    if (action === "submit_gallery") {
      const submitted = await submitOwnedProjectToGallery(id, creator.id);
      if (!submitted) return new NextResponse("Not found", { status: 404 });
      return NextResponse.redirect(new URL("/dashboard?updated=gallery", request.url), 303);
    }
    if (action !== "update") return new NextResponse("Invalid action", { status: 400 });
    const input = await verifyProjectFields(form, creator.github_handle);
    const updated = await updateOwnedProject(id, creator.id, input);
    if (!updated) return new NextResponse("Not found", { status: 404 });
    if (existing.live_url !== input.liveUrl || existing.thumbnail_status !== "ready") {
      await queueThumbnail(id, existing.live_url !== input.liveUrl);
      waitUntil(captureProjectThumbnail(id));
    }
    return formRedirect(request,"/dashboard?updated=project");
  } catch (error) {
    return formFailure(request,"/dashboard",error);
  }
}
