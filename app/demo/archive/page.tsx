import Link from "next/link";
import { ProjectPreview } from "../../ProjectPreview";
import { SiteNav } from "../../SiteNav";
import { SiteFooter } from "../../SiteFooter";
import { galleryProjects, projectSlug } from "../../fixtures/demoGallery";
export default function DemoArchivePage() {
  const projects = [...galleryProjects].reverse();
  return <main><SiteNav active="archive" demo /><section id="content" tabIndex={-1} className="archive-page route-page shell"><div className="section-head"><div><span className="section-number">DEMO / ARCHIVE</span><h1 className="explore-title">The demo index</h1></div></div><div className="archive-list">{projects.map(project => <article className="archive-row" key={project.title}><span className="archive-number">{project.number}</span><Link className="archive-thumb" href={`/demo/${projectSlug(project)}`} aria-label={`Preview ${project.title}`}>{project.thumbnail ? <img className="demo-edge-bleed" loading="lazy" src={project.thumbnail} alt=""/> : <ProjectPreview type={project.preview}/>}</Link><h2 className="archive-title"><Link href={`/demo/${projectSlug(project)}`}>{project.title}</Link></h2><Link className="archive-maker" href={`/demo/maker/${project.handle}`}>{project.maker}</Link><span className="archive-date">{project.type}</span><Link className="archive-launch" href={`/demo/${projectSlug(project)}`} aria-label={`Preview ${project.title}`}>↗</Link></article>)}</div></section><SiteFooter demo/></main>;
}
