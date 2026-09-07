import Link from "next/link";
import { listApprovedProjects } from "../../db/repository";
import { ProjectThumbnail } from "../ProjectThumbnail";
import { SiteNav } from "../SiteNav";
import { SiteFooter } from "../SiteFooter";
export const dynamic = "force-dynamic";
export default async function ArchivePage() {
  const projects = await listApprovedProjects();
  return <main><SiteNav active="archive" /><section id="content" tabIndex={-1} className="archive-page route-page shell"><div className="section-head"><div><span className="section-number">ARCHIVE / PUBLISHED</span><h1 className="explore-title">Newest first</h1></div></div>{projects.length === 0 ? <div className="gallery-empty"><p>No projects have been published yet.</p><Link href="/explore">Explore the collection ↗</Link></div> : <div className="archive-list">{projects.map((project,index) => <article className="archive-row" key={project.id}><span className="archive-number">{String(projects.length-index).padStart(2,"0")}</span><Link className="archive-thumb" href={`/project/${project.slug}`} aria-label={`About ${project.title}`}><ProjectThumbnail project={project}/></Link><h2 className="archive-title"><Link href={`/project/${project.slug}`}>{project.title}</Link></h2><Link className="archive-maker" href={`/maker/${project.github_handle}`}>{project.display_name}</Link><time className="archive-date" dateTime={project.published_at ?? undefined}>{project.published_at ? new Date(project.published_at).toLocaleDateString("en-US", {month:"short", year:"numeric", timeZone:"UTC"}) : ""}</time><a className="archive-launch" href={project.live_url} target="_blank" rel="noopener noreferrer" aria-label={`Launch ${project.title} on its creator’s site`}>↗</a></article>)}</div>}</section><SiteFooter/></main>;
}
