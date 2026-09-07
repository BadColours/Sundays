"use client";
import { useState } from "react";
import { thumbnailUrl } from "../lib/thumbnail-url";
import type { Project } from "../db/repository";
export function ProjectThumbnail({ project, className = "" }: { project: Pick<Project, "title" | "thumbnail_status" | "thumbnail_storage_key">; className?: string }) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const source = thumbnailUrl(project.thumbnail_storage_key);
  if (source && source !== failedSource) return <img className={`project-thumbnail ${className}`} src={source} alt={`Preview of ${project.title}`} loading="lazy" decoding="async" ref={node => { if (node?.complete && node.naturalWidth === 0) setFailedSource(source); }} onError={() => setFailedSource(source)} />;
  return <div className={`thumbnail-fallback ${className}`} role="img" aria-label={`Preview of ${project.title} ${project.thumbnail_status === "pending" ? "is being prepared" : "is unavailable"}`}><strong>{project.title}</strong><span>{project.thumbnail_status === "pending" ? "Preview is being prepared" : "Preview unavailable"}</span></div>;
}
