import { NextRequest, NextResponse } from "next/server";
import { listProjectsForHealthCheck } from "../../../../../db/repository";
import { currentCreator, isAdmin } from "../../../../../lib/auth";
import { checkProjectHealth } from "../../../../../lib/link-health";

export async function POST(request: NextRequest) {
  const creator = await currentCreator();
  if (!isAdmin(creator)) return new NextResponse("Forbidden", { status: 403 });
  const projects = await listProjectsForHealthCheck();
  await Promise.allSettled(projects.map((project) => checkProjectHealth(project.id)));
  return NextResponse.redirect(new URL(`/admin?links_checked=${projects.length}`, request.url), 303);
}
