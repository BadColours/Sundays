import Link from "next/link";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

export function AboutContent({ demo = false }: { demo?: boolean }) {
  return <main><SiteNav active="about" demo={demo} /><section id="content" tabIndex={-1} className="about-page route-page shell"><span className="about-index">{demo ? "DEMO / ABOUT SUNDAYS" : "ABOUT / SUNDAYS"}</span><h1>For people who make things<br className="about-break" /> after they&apos;re done making things.</h1><div className="about-copy"><p>Sundays is a gallery of personal software. Every project lives on its creator’s own site, with its own point of view.</p><div><p>Sign in with GitHub to make a public creator profile and share your work. Projects appear on your profile immediately; the Sundays collection is selected separately.</p><p>We read your public GitHub identity and public repositories. We never request private repository access, copy your code, or host your application.</p><Link href={demo ? "/demo/explore" : "/submit"}>{demo ? "Explore the demo" : "Share a project"} ↗</Link>{demo && <p className="demo-note">These fictional creators and project previews demonstrate the gallery. Demo previews are not working applications.</p>}</div></div></section><SiteFooter demo={demo} /></main>;
}
