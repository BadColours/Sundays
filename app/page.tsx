import Link from "next/link";
import { listApprovedProjects, type Project } from "../db/repository";
import { PublicGallery } from "./PublicGallery";
import { SiteNav } from "./SiteNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  let projects: Project[] = [];
  try { projects = await listApprovedProjects(6); } catch { projects = []; }
  return (
    <main>
      <SiteNav />
      <section className="projects shell" id="work">
        <div className="section-head"><div><span className="section-number">GALLERY / CURRENT</span><h1 className="explore-title">Selected work</h1></div><p>Personal software made after hours.<br />Hosted and controlled by its creators.</p></div>
        <PublicGallery projects={projects} />
      </section>
      <footer className="footer shell"><Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link><Link className="footer-submit" href="/join">Create your profile ↗</Link><small>© 2026</small></footer>
    </main>
  );
}
