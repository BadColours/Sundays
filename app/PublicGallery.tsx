import Link from "next/link";
import type { Project } from "../db/repository";
import { ProjectThumbnail } from "./ProjectThumbnail";

export function PublicGallery({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return <div className="gallery-empty"><p>No projects in the collection yet.</p><Link href="/submit">Share a project ↗</Link></div>;
  return (
    <div className="project-grid public-project-grid">
      {projects.map((project) => (
        <article className="project-card" key={project.id}>
          <a className="preview-frame creator-image-frame" href={project.live_url} target="_blank" rel="noopener noreferrer" aria-label={`Launch ${project.title} on its creator's site`}>
            <ProjectThumbnail project={project} />
            <span className="open-pill">Launch project <span aria-hidden="true">↗</span></span>
          </a>
          <div className="project-meta without-number">
            <div className="project-copy">
              <h2><Link href={`/project/${project.slug}`}>{project.title}</Link></h2>
              <div className="project-maker-line"><Link className="project-maker" href={`/maker/${project.github_handle}`}>{project.display_name}</Link>{project.verification_status === "verified" && <span className="verification-mark" title="This repository belongs to the creator’s GitHub account. This does not verify the live site.">Repository matched</span>}</div>
              <p>{project.short_description}</p>
            </div>
            <div className="project-side">
              <span>{project.published_at ? new Date(project.published_at).getFullYear() : ""}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
