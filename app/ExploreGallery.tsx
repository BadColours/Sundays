"use client";

import { useState } from "react";
import Link from "next/link";
import { ProjectPreview } from "./ProjectPreview";
import { galleryProjects, projectSlug } from "./fixtures/demoGallery";

const types = ["All", "Navigation", "Audio", "Tools"] as const;
const exploreCatalogue = galleryProjects.slice(6);
const pageSize = 12;

function shuffleProjects(projects: typeof galleryProjects) {
  const shuffled = [...projects];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function ExploreGallery({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const [activeType, setActiveType] = useState<(typeof types)[number]>("All");
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const [exploreProjects, setExploreProjects] = useState(() => exploreCatalogue);
  const shuffleExplore = () => {
    setExploreProjects((projects) => shuffleProjects(projects));
    setVisibleCount(pageSize);
  };

  const sourceProjects = featuredOnly ? galleryProjects.slice(0, 6) : exploreProjects;
  const allVisibleProjects = activeType === "All"
    ? sourceProjects
    : sourceProjects.filter((project) => project.type === activeType);
  const visibleProjects = allVisibleProjects;
  const shownProjects = visibleProjects.slice(0, featuredOnly ? 6 : visibleCount);

  return (
    <>
      {!featuredOnly && (
        <div className="explore-tabs" role="tablist" aria-label="Browse by app type">
          {types.map((type) => (
            <button
              className={activeType === type ? "active" : ""}
              key={type}
              type="button"
              role="tab"
              aria-selected={activeType === type}
              onClick={() => { setActiveType(type); setVisibleCount(pageSize); }}
            >
              {type} <span>{type === "All" ? exploreProjects.length : exploreProjects.filter((project) => project.type === type).length}</span>
            </button>
          ))}
          <button className="shuffle-tab" type="button" onClick={shuffleExplore}>Shuffle ↻</button>
        </div>
      )}
      <div className="project-grid">
        {shownProjects.map((project) => (
          <article className="project-card" key={project.title}>
            <Link className={`preview-frame ${project.color}${project.thumbnail ? " creator-image-frame demo-normalized-frame" : ""}`} href={`/demo/${projectSlug(project)}`} aria-label={`Open ${project.title}`}>
              {project.thumbnail ? (
                <img className="creator-preview" src={project.thumbnail} alt={`Preview of ${project.title}`} />
              ) : (
                <>
                  <div className="browser-chrome"><span /><span /><span /><b>{project.title.toLowerCase()}.app</b></div>
                  <ProjectPreview type={project.preview} title={project.title} />
                </>
              )}
              <span className="open-pill">Open app <Arrow /></span>
            </Link>
            <div className={`project-meta${featuredOnly ? "" : " without-number"}`}>
              {featuredOnly && <span className="project-number">{project.number}</span>}
              <div className="project-copy"><h3><Link href={`/demo/${projectSlug(project)}`}>{project.title}</Link></h3><Link className="project-maker" href={`/demo/maker/${project.handle}`}>{project.maker}</Link><p>{project.description}</p></div>
            </div>
          </article>
        ))}
      </div>
      {!featuredOnly && visibleCount < visibleProjects.length && (
        <button className="explore-more" type="button" onClick={() => setVisibleCount((count) => count + pageSize)}>
          Show {Math.min(pageSize, visibleProjects.length - shownProjects.length)} more <span>{visibleProjects.length - shownProjects.length} remaining</span>
        </button>
      )}
    </>
  );
}
