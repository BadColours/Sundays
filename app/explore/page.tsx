import Link from "next/link";
import { ExploreGallery } from "../ExploreGallery";
import { SiteNav } from "../SiteNav";

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export default function ExplorePage() {
  return (
    <main>
      <SiteNav active="explore" />
      <section className="projects shell">
        <div className="section-head">
          <div><span className="section-number">GALLERY / 001—056</span><h1 className="explore-title">Explore all work</h1></div>
        </div>
        <ExploreGallery />
      </section>
      <footer className="footer shell">
        <Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link>
        <a className="footer-submit" href="https://github.com" target="_blank" rel="noreferrer">Submit from GitHub <Arrow /></a>
        <small>© 2026</small>
      </footer>
    </main>
  );
}
