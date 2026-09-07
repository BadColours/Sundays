import Link from "next/link";
import { listApprovedProjects } from "../db/repository";
import { PublicGallery } from "./PublicGallery";
import { SiteNav } from "./SiteNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const projects = await listApprovedProjects(6);
  return (
    <main>
      <SiteNav />
      <section id="content" tabIndex={-1} className="projects shell">
        <div className="section-head"><div><span className="section-number">GALLERY / CURRENT</span><h1 className="explore-title">Selected work</h1></div><p>Personal software made after hours.<br />Hosted and controlled by its creators.</p></div>
        <PublicGallery projects={projects} />
      </section>
      <footer className="footer shell"><Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link><small>© 2026</small></footer>
    </main>
  );
}
