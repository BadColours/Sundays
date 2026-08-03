import Link from "next/link";
import { listApprovedProjects, type Project } from "../db/repository";
import { PublicGallery } from "./PublicGallery";
import { ExploreGallery } from "./ExploreGallery";
import { SiteNav } from "./SiteNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const demoMode = process.env.NODE_ENV !== "production";
  let projects: Project[] = [];
  try { projects = await listApprovedProjects(6); } catch { projects = []; }
  return (
    <main>
      <SiteNav />
      <section className="projects shell" id="work">
        <div className="section-head"><div><span className="section-number">{demoMode ? "CONCEPT PREVIEW / 001—006" : "GALLERY / CURRENT"}</span><h1 className="explore-title">Selected work</h1></div><p>Personal software made after hours.<br />Hosted and controlled by its creators.</p></div>
        {demoMode ? <ExploreGallery featuredOnly /> : <PublicGallery projects={projects} />}
      </section>
      <footer className="footer shell"><Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link><Link className="footer-submit" href="/join">Log in</Link><small>© 2026</small></footer>
    </main>
  );
}
