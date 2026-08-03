import Link from "next/link";
import { listApprovedProjects, type Project } from "../../db/repository";
import { PublicGallery } from "../PublicGallery";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  let projects: Project[] = [];
  try { projects = await listApprovedProjects(); } catch { projects = []; }
  return (
    <main>
      <SiteNav active="explore" />
      <section className="projects route-page shell">
        <div className="section-head"><div><span className="section-number">GALLERY / ALL APPROVED</span><h1 className="explore-title">Explore the collection</h1></div></div>
        <PublicGallery projects={projects} />
      </section>
      <footer className="footer shell"><Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link><Link className="footer-submit" href="/submit">Submit a project ↗</Link><small>© 2026</small></footer>
    </main>
  );
}
