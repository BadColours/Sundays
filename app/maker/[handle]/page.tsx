import Link from "next/link";
import { notFound } from "next/navigation";

const makers = {
  mayachen: { name: "Maya Chen", bio: "Designer-engineer making small tools for slower, more deliberate days.", location: "Brooklyn, NY", projects: ["Sundial", "Index Zero", "Weather Window"], accent: "#ceff1a" },
  theohart: { name: "Theo Hart", bio: "Independent developer interested in local-first software and quiet interfaces.", location: "London, UK", projects: ["Fieldnotes", "Commonplace"], accent: "#89a9ff" },
  noorahmed: { name: "Noor Ahmed", bio: "Creative technologist building gardens for the strange corners of the internet.", location: "Toronto, CA", projects: ["Loose Leaf", "Sideways"], accent: "#ff826d" },
  elimorgan: { name: "Eli Morgan", bio: "Sound designer and developer exploring playful ways to listen.", location: "Portland, OR", projects: ["Radio Silence", "Hush"], accent: "#b893e6" },
} as const;

export function generateStaticParams() {
  return Object.keys(makers).map((handle) => ({ handle }));
}

export default async function MakerPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const maker = makers[handle as keyof typeof makers];
  if (!maker) notFound();

  return (
    <main className="profile" style={{ "--profile-accent": maker.accent } as React.CSSProperties}>
      <nav className="nav shell">
        <Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link>
        <Link className="back-link" href="/">← Back to gallery</Link>
        <a className="github-button" href="https://github.com" target="_blank" rel="noreferrer"><span className="github-dot" /> GitHub profile</a>
      </nav>
      <section className="profile-hero shell">
        <div className="profile-index">MAKER / @{handle}</div>
        <div className="profile-avatar">{maker.name.split(" ").map((part) => part[0]).join("")}</div>
        <div className="profile-title"><h1>{maker.name}</h1><p>{maker.bio}</p></div>
        <div className="profile-facts"><span>Based in</span><strong>{maker.location}</strong><span>Making since</span><strong>2023</strong></div>
      </section>
      <section className="profile-work shell">
        <div className="section-head"><div><span className="section-number">THE WORK</span><h2>Things made<br />after hours.</h2></div><p>All projects live on the maker&apos;s GitHub.<br />sundays only points the way.</p></div>
        <div className="profile-projects">
          {maker.projects.map((project, index) => (
            <a href="https://github.com" target="_blank" rel="noreferrer" className="profile-project" key={project}>
              <span>0{index + 1}</span><strong>{project}</strong><small>{index === 0 ? "Featured project" : "Open source experiment"}</small><b>GitHub ↗</b>
            </a>
          ))}
        </div>
      </section>
      <footer className="profile-footer shell"><Link href="/">← Explore more makers</Link><small>© 2026 sundays · offhours</small></footer>
    </main>
  );
}
