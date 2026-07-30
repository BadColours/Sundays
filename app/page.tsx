import Link from "next/link";
import { ExploreGallery } from "./ExploreGallery";
import { SiteNav } from "./SiteNav";

function Arrow() { return <span aria-hidden="true">↗</span>; }

export default function Home() {
  return (
    <main>
      <SiteNav />
      <section className="projects shell" id="work">
        <div className="section-head"><div><span className="section-number">GALLERY / 001—006</span><h2>Selected work</h2></div></div>
        <ExploreGallery featuredOnly />
      </section>
      <footer className="footer shell"><Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link><a className="footer-submit" href="https://github.com" target="_blank" rel="noreferrer">Submit from GitHub <Arrow /></a><small>© 2026</small></footer>
    </main>
  );
}
