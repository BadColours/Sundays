import { formRedirect, formFailure } from "../../../lib/form-response";
import { mutationGuard, readBoundedFormData } from "../../../lib/request-security";
import { NextRequest } from "next/server";
import { waitUntil } from "cloudflare:workers";
import { createProject } from "../../../db/repository";
import { currentCreator } from "../../../lib/auth";
import { verifyProjectFields } from "../../../lib/project-input";
import { captureProjectThumbnail } from "../../../lib/thumbnails";

export async function POST(request: NextRequest) {
  const rejected = mutationGuard(request);
  if (rejected) return rejected;
  const creator = await currentCreator();
  if (!creator) return formRedirect(request,"/join?return_to=%2Fsubmit");
  try {
    const input = await verifyProjectFields(await readBoundedFormData(request), creator.github_handle);
    const project = await createProject({ creatorId: creator.id, ...input });
    waitUntil(captureProjectThumbnail(project.id));
    return formRedirect(request,`/dashboard?submitted=${encodeURIComponent(project.id)}`);
  } catch (error) {
    return formFailure(request,"/submit",error);
  }
}
