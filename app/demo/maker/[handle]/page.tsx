import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectPreview } from "../../../ProjectPreview";
import { SiteNav } from "../../../SiteNav";
import { galleryProjects, projectSlug } from "../../../fixtures/demoGallery";

export default async function DemoMakerPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const projects = galleryProjects.filter((item) => item.handle === handle);
  if (!projects.length) notFound();
  const maker = projects[0];
  const initials = maker.maker.split(" ").map((part) => part[0]).join("");

  return (
    <main className="profile">
      <SiteNav demo />
      <section className="profile-hero shell demo-profile-hero">
        <div className="profile-index">DEMO PROFILE / @{maker.handle}</div>
        <div className="profile-avatar">{initials}</div>
        <div className="profile-title"><h1>{maker.maker}</h1></div>
      </section>
      <section className="profile-work shell">
        <div className="profile-projects demo-profile-projects">
          {projects.map((project) => (
            <article className="profile-project-card" key={project.title}>
              <Link className={`profile-thumb${project.thumbnail ? " creator-image-frame demo-frameless-frame" : ""}`} href={`/demo/${projectSlug(project)}`} aria-label={`Open ${project.title}`}>
                {project.thumbnail ? <img className="creator-preview demo-edge-bleed" src={project.thumbnail} alt={`Preview of ${project.title}`} /> : <><div className="browser-chrome"><span /><span /><span /><b>{project.title.toLowerCase()}.app</b></div><ProjectPreview type={project.preview} title={project.title} /></>}
              </Link>
              <div className="profile-project-caption"><strong><Link href={`/demo/${projectSlug(project)}`}>{project.title}</Link></strong><small>{project.description}</small></div>
            </article>
          ))}
        </div>
      </section>
      <footer className="profile-footer shell"><Link href="/demo/explore">← Explore more makers</Link><small>Demo gallery</small></footer>
    </main>
  );
}
