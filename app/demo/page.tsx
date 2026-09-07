import Link from "next/link";
import { ExploreGallery } from "../ExploreGallery";
import { SiteNav } from "../SiteNav";

export default function DemoHomePage() {
  return (
    <main>
      <SiteNav demo />
      <section id="content" tabIndex={-1} className="projects shell">
        <div className="section-head">
          <div>
            <span className="section-number">DEMO / 001—006</span>
            <h1 className="explore-title">Selected work</h1>
          </div>
          <p>Personal software made after hours.<br />A demonstration of the Sundays gallery.</p>
        </div>
        <ExploreGallery featuredOnly />
      </section>
      <footer className="footer shell">
        <Link className="wordmark" href="/demo">sundays<span>.</span><small>offhours</small></Link>
        <small>Demo</small>
      </footer>
    </main>
  );
}
