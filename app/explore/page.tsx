import Link from "next/link";
import { listApprovedProjects } from "../../db/repository";
import { PublicGallery } from "../PublicGallery";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const projects = await listApprovedProjects();
  return (
    <main>
      <SiteNav active="explore" />
      <section id="content" tabIndex={-1} className="projects route-page shell">
        <div className="section-head"><div><span className="section-number">GALLERY / COLLECTION</span><h1 className="explore-title">Explore the collection</h1></div><Link className="text-link" href="/submit">Share a project ↗</Link></div>
        <PublicGallery projects={projects} />
      </section>
      <footer className="footer minimal-footer shell"><Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link><small>© 2026</small></footer>
    </main>
  );
}
