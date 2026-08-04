import { NextRequest, NextResponse } from "next/server";
import { showOwnedProjectOnProfile, updateOwnedProject, withdrawOwnedProject } from "../../../../db/repository";
import { currentCreator } from "../../../../lib/auth";
import { verifyProjectFields, formErrorUrl } from "../../../../lib/project-input";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const creator = await currentCreator();
  if (!creator) return NextResponse.redirect(new URL("/submit?error=signin_required", request.url), 303);
  const { id } = await params;
  const form = await request.formData();
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
    const input = await verifyProjectFields(form, creator.github_handle);
    const updated = await updateOwnedProject(id, creator.id, input);
    if (!updated) return new NextResponse("Not found", { status: 404 });
    return NextResponse.redirect(new URL("/dashboard?updated=project", request.url), 303);
  } catch (error) {
    return NextResponse.redirect(new URL(formErrorUrl("/dashboard", error), request.url), 303);
  }
}
