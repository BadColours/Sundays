import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedProjectBySlug } from "../../../db/repository";
import { thumbnailUrl } from "../../../lib/thumbnails";
import { ProjectThumbnail } from "../../ProjectThumbnail";
import { SiteNav } from "../../SiteNav";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let project;
  try { project = await getApprovedProjectBySlug(slug); } catch { project = null; }
  if (!project) return { title: "Project not found — sundays" };
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const imagePath = project.thumbnail_status === "ready" ? thumbnailUrl(project.thumbnail_storage_key) : null;
  const image = imagePath ? `${protocol}://${host}${imagePath}` : undefined;
  return {
    title: `${project.title} — sundays`,
    description: project.short_description,
    openGraph: { title: project.title, description: project.short_description, type: "website", ...(image ? { images: [{ url: image, alt: `Preview of ${project.title}` }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title: project.title, description: project.short_description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ reported?: string }> }) {
  const { slug } = await params;
  let project;
  try { project = await getApprovedProjectBySlug(slug); } catch { project = null; }
  if (!project) notFound();
  const { reported } = await searchParams;
  return (
    <main>
      <SiteNav />
      <article className="project-detail shell">
        <div className="project-detail-index">PROJECT / {project.slug.toUpperCase()}</div>
        <a className="project-detail-image" href={project.live_url} target="_blank" rel="noopener noreferrer"><ProjectThumbnail project={project} /></a>
        <div className="project-detail-copy">
          <h1>{project.title}</h1>
          <p>{project.short_description}</p>
          <div className="project-creator-line">
            <img src={project.avatar_url} alt="" />
            <span>Made by <Link href={`/maker/${project.github_handle}`}>{project.display_name}</Link></span>
          </div>
          <a className="mvp-button primary" href={project.live_url} target="_blank" rel="noopener noreferrer">Launch project ↗</a>
          <small>Published {project.published_at ? new Date(project.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "on Sundays"}</small>
        </div>
        <details className="report-control">
          <summary>Report a broken link</summary>
          {reported ? <p>Thanks. The report is queued for review; the project remains available until it is checked.</p> : (
            <form action={`/api/projects/${project.id}/report`} method="post">
              <input type="hidden" name="reason" value="broken_link" />
              <label>Optional details<textarea name="details" maxLength={500} /></label>
              <button type="submit">Send report</button>
            </form>
          )}
        </details>
      </article>
    </main>
  );
}
