import { thumbnailUrl } from "../lib/thumbnails";
import type { Project } from "../db/repository";

export function ProjectThumbnail({ project, className = "", liveFallback = false }: { project: Pick<Project, "title" | "live_url" | "thumbnail_status" | "thumbnail_storage_key">; className?: string; liveFallback?: boolean }) {
  const source = project.thumbnail_status === "ready" ? thumbnailUrl(project.thumbnail_storage_key) : null;
  if (source) return <img className={`project-thumbnail ${className}`} src={source} alt={`Preview of ${project.title}`} />;
  if (liveFallback) return (
    <div className={`live-thumbnail-fallback ${className}`} role="img" aria-label={`Live preview of ${project.title}`}>
      <iframe src={project.live_url} title={`Live preview of ${project.title}`} loading="lazy" sandbox="allow-scripts" tabIndex={-1} />
      <span>LIVE PREVIEW</span>
    </div>
  );
  return (
    <div className={`thumbnail-fallback ${className}`} role="img" aria-label={`${project.title} thumbnail ${project.thumbnail_status === "pending" ? "is processing" : "is unavailable"}`}>
      <span>{project.thumbnail_status === "pending" ? "CAPTURING" : "PREVIEW UNAVAILABLE"}</span>
      <strong>{project.title.slice(0, 2).toUpperCase()}</strong>
      <i /><i /><i />
    </div>
  );
}
