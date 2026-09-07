import Link from "next/link";
import { ExploreGallery } from "../../ExploreGallery";
import { SiteNav } from "../../SiteNav";

export default function DemoExplorePage() {
  return (
    <main>
      <SiteNav active="explore" demo />
      <section id="content" tabIndex={-1} className="projects route-page shell">
        <div className="section-head">
          <div>
            <span className="section-number">DEMO / EXPLORE</span>
            <h1 className="explore-title">Explore the collection</h1>
          </div>
        </div>
        <ExploreGallery />
      </section>
      <footer className="footer minimal-footer shell">
        <Link className="wordmark" href="/demo">sundays<span>.</span><small>offhours</small></Link>
        <small>Demo</small>
      </footer>
    </main>
  );
}
