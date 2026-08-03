import Link from "next/link";
import type { Project } from "../db/repository";
import { ProjectThumbnail } from "./ProjectThumbnail";

export function PublicGallery({ projects, emptyTitle = "The first Sundays are still being collected." }: { projects: Project[]; emptyTitle?: string }) {
  if (projects.length === 0) {
    return (
      <div className="collection-empty">
        <span>EARLY COLLECTION</span>
        <h2>{emptyTitle}</h2>
        <p>Sundays is inviting a small first group of creators making personal software after hours.</p>
        <Link className="mvp-button primary" href="/submit">Submit a project ↗</Link>
      </div>
    );
  }
  return (
    <div className="project-grid public-project-grid">
      {projects.map((project) => (
        <article className="project-card" key={project.id}>
          <a className="preview-frame creator-image-frame" href={project.live_url} target="_blank" rel="noopener noreferrer" aria-label={`Launch ${project.title} on its creator's site`}>
            <ProjectThumbnail project={project} />
            <span className="open-pill">Launch project <span aria-hidden="true">↗</span></span>
          </a>
          <div className="project-meta without-number">
            <div>
              <h3><Link href={`/project/${project.slug}`}>{project.title}</Link></h3>
              <p>{project.short_description}</p>
            </div>
            <div className="project-side">
              <Link href={`/maker/${project.github_handle}`}>by {project.display_name}</Link>
              <span>{project.published_at ? new Date(project.published_at).getFullYear() : ""}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
