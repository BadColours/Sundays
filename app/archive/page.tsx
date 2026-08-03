import Link from "next/link";
import { listApprovedProjects, type Project } from "../../db/repository";
import { ProjectThumbnail } from "../ProjectThumbnail";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  let projects: Project[] = [];
  try { projects = await listApprovedProjects(); } catch { projects = []; }
  return (
    <main>
      <SiteNav active="archive" />
      <section className="archive-page shell">
        <div className="section-head"><div><span className="section-number">ARCHIVE / PUBLISHED</span><h1 className="explore-title">Newest first</h1></div></div>
        {projects.length === 0 ? (
          <div className="archive-empty"><p>No projects have been published yet.</p><Link href="/submit">Submit the first one ↗</Link></div>
        ) : (
          <div className="archive-list">
            {projects.map((project, index) => (
              <div className="archive-row" key={project.id}>
                <span className="archive-number">{String(projects.length - index).padStart(2, "0")}</span>
                <a className="archive-thumb" href={project.live_url} target="_blank" rel="noopener noreferrer"><ProjectThumbnail project={project} /></a>
                <strong><Link href={`/project/${project.slug}`}>{project.title}</Link></strong>
                <span><Link href={`/maker/${project.github_handle}`}>{project.display_name}</Link></span>
                <span>{project.published_at ? new Date(project.published_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}</span>
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" aria-label={`Launch ${project.title}`}>↗</a>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
