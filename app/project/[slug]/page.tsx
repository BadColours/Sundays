import { CreatorAvatar } from "../../CreatorAvatar";
import type { Metadata } from "next";
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
  const imagePath = project.thumbnail_status === "ready" ? thumbnailUrl(project.thumbnail_storage_key) : null;
  const image = imagePath ? `https://offhours-gallery.badcolours.chatgpt.site${imagePath}` : undefined;
  return {
    title: `${project.title} — sundays`,
    description: project.short_description,
    openGraph: { title: project.title, description: project.short_description, type: "website", ...(image ? { images: [{ url: image, alt: `Preview of ${project.title}` }] } : {}) },
    twitter: { card: image ? "summary_large_image" : "summary", title: project.title, description: project.short_description, ...(image ? { images: [image] } : {}) },
  };
}

export default async function ProjectPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ reported?: string; report_limit?: string }> }) {
  const { slug } = await params;
  const project = await getApprovedProjectBySlug(slug);
  if (!project) notFound();
  const { reported, report_limit: reportLimit } = await searchParams;
  return (
    <main>
      <SiteNav />
      <article id="content" tabIndex={-1} className="project-detail shell">
        <div className="project-detail-index">PROJECT / {project.slug.toUpperCase()}</div>
        <a className="project-detail-image" href={project.live_url} target="_blank" rel="noopener noreferrer"><ProjectThumbnail project={project} /></a>
        <div className="project-detail-copy">
          <h1>{project.title}</h1>
          <p>{project.short_description}</p>
          <div className="project-creator-line">
            <CreatorAvatar src={project.avatar_url} name={project.display_name ?? "Creator"} />
            <span><Link href={`/maker/${project.github_handle}`}>{project.display_name}</Link></span>
            {project.verification_status === "verified" && <span className="verification-mark" title="The repository belongs to this GitHub account; the live site is not verified.">Repository matched</span>}
          </div>
          {project.repository_url && <a className="project-repository-link" href={project.repository_url} target="_blank" rel="noopener noreferrer">GitHub repository ↗</a>}
          <a className="mvp-button primary" href={project.live_url} target="_blank" rel="noopener noreferrer">Launch project ↗</a>
          <small>Published {project.published_at ? new Date(project.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "on Sundays"}</small>
        </div>
        <details className="report-control" open={Boolean(reported || reportLimit)}>
          <summary>Report a problem</summary>
          {reported ? <p>Thanks. The report is queued for review; the project remains available until it is checked.</p> : reportLimit ? <p>Too many reports were sent from this browser. Please try again later.</p> : (
            <form action={`/api/projects/${project.id}/report`} method="post">
              <label>Reason<select name="reason" defaultValue="broken_link"><option value="broken_link">Broken link</option><option value="unsafe_content">Unsafe or misleading content</option><option value="copied_work">Copied work</option><option value="ownership_dispute">Ownership dispute</option><option value="other">Something else</option></select></label>
              <label>Optional details<textarea name="details" maxLength={500} /></label>
              <button type="submit">Send report</button>
            </form>
          )}
        </details>
      </article>
    </main>
  );
}
