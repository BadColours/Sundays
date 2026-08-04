import Link from "next/link";
import { listApprovedProjects, type Project } from "../../db/repository";
import { ProjectThumbnail } from "../ProjectThumbnail";
import { SiteNav } from "../SiteNav";
import { ProjectPreview } from "../ProjectPreview";
import { galleryProjects, projectSlug } from "../fixtures/demoGallery";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const demoMode = process.env.NODE_ENV !== "production";
  const demoProjects = galleryProjects.slice(0, 6).reverse();
  let projects: Project[] = [];
  try { projects = await listApprovedProjects(); } catch { projects = []; }
  return (
    <main>
      <SiteNav active="archive" />
      <section className="archive-page route-page shell">
        <div className="section-head"><div><span className="section-number">{demoMode ? "CONCEPT PREVIEW / ARCHIVE" : "ARCHIVE / PUBLISHED"}</span><h1 className="explore-title">Newest first</h1></div></div>
        {demoMode ? (
          <div className="archive-list">
            {demoProjects.map((project) => (
              <div className="archive-row" key={project.handle}>
                <span className="archive-number">{project.number}</span>
                <Link className="archive-thumb" href={`/demo/${projectSlug(project)}`}>
                  {project.thumbnail ? <img src={project.thumbnail} alt="" /> : <ProjectPreview type={project.preview} />}
                </Link>
                <strong><Link href={`/demo/${projectSlug(project)}`}>{project.title}</Link></strong>
                <span><Link href={`/demo/maker/${project.handle}`}>{project.maker}</Link></span>
                <span>Concept</span><span /><span>↗</span>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="archive-empty"><p>No projects have been published yet.</p></div>
        ) : (
          <div className="archive-list">
            {projects.map((project, index) => (
              <div className="archive-row" key={project.id}>
                <span className="archive-number">{String(projects.length - index).padStart(2, "0")}</span>
                <a className="archive-thumb" href={project.live_url} target="_blank" rel="noopener noreferrer"><ProjectThumbnail project={project} /></a>
                <strong><a href={project.live_url} target="_blank" rel="noopener noreferrer">{project.title}</a></strong>
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
