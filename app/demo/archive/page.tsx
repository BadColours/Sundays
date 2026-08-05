import Link from "next/link";
import { ProjectPreview } from "../../ProjectPreview";
import { SiteNav } from "../../SiteNav";
import { galleryProjects, projectSlug } from "../../fixtures/demoGallery";

export default function DemoArchivePage() {
  const projects = galleryProjects.slice(0, 6).reverse();
  return (
    <main>
      <SiteNav active="archive" demo />
      <section className="archive-page route-page shell">
        <div className="section-head"><div><span className="section-number">DEMO / ARCHIVE</span><h1 className="explore-title">Newest first</h1></div></div>
        <div className="archive-list">
          {projects.map((project) => (
            <div className="archive-row" key={project.handle}>
              <span className="archive-number">{project.number}</span>
              <Link className="archive-thumb" href={`/demo/${projectSlug(project)}`}>
                {project.thumbnail ? <img className="demo-edge-bleed" src={project.thumbnail} alt={`Preview of ${project.title}`} /> : <ProjectPreview type={project.preview} title={project.title} />}
              </Link>
              <strong><Link href={`/demo/${projectSlug(project)}`}>{project.title}</Link></strong>
              <span><Link href={`/demo/maker/${project.handle}`}>{project.maker}</Link></span>
              <span>Concept</span>
              <span />
              <Link href={`/demo/${projectSlug(project)}`} aria-label={`Open ${project.title}`}>↗</Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
