"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProjectPreview } from "./ProjectPreview";
import { galleryProjects } from "./galleryData";

const types = ["All", "Games", "Navigation", "Audio", "Tools"] as const;

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
  const [visibleCount, setVisibleCount] = useState(10);
  const [exploreProjects, setExploreProjects] = useState(() => galleryProjects.slice(6));
  const shuffleExplore = () => {
    setExploreProjects((projects) => shuffleProjects(projects));
    setVisibleCount(10);
  };

  useEffect(() => {
    setExploreProjects((projects) => shuffleProjects(projects));
  }, []);

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
              onClick={() => { setActiveType(type); setVisibleCount(10); }}
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
            <Link className={`preview-frame ${project.color}${project.thumbnail ? " creator-image-frame" : ""}`} href={`/maker/${project.handle}`} aria-label={`View ${project.title} by ${project.maker}`}>
              {project.thumbnail ? (
                <img className="creator-preview" src={project.thumbnail} alt={`Preview of ${project.title}`} />
              ) : (
                <>
                  <div className="browser-chrome"><span /><span /><span /><b>{project.title.toLowerCase()}.app</b></div>
                  <ProjectPreview type={project.preview} />
                </>
              )}
              <span className="open-pill">Open project <Arrow /></span>
            </Link>
            <div className="project-meta">
              <span className="project-number">{project.number}</span>
              <div><h3><Link href={`/maker/${project.handle}`}>{project.title}</Link></h3><p>{project.description}</p></div>
              <div className="project-side"><Link href={`/maker/${project.handle}`}>by {project.maker}</Link><span>{project.tags.join(" · ")}</span></div>
            </div>
          </article>
        ))}
      </div>
      {!featuredOnly && visibleCount < visibleProjects.length && (
        <button className="explore-more" type="button" onClick={() => setVisibleCount((count) => count + 10)}>
          Show 10 more <span>{visibleProjects.length - visibleCount} remaining</span>
        </button>
      )}
    </>
  );
}
