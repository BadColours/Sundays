import Link from "next/link";

const projects = [
  { number: "01", title: "Sundial", maker: "Maya Chen", handle: "mayachen", description: "A calmer way to see where your day actually went.", tags: ["Next.js", "TypeScript"], color: "lime", preview: "sundial" },
  { number: "02", title: "Fieldnotes", maker: "Theo Hart", handle: "theohart", description: "Tiny, local-first notes for thoughts worth keeping.", tags: ["React", "IndexedDB"], color: "blue", preview: "fieldnotes" },
  { number: "03", title: "Loose Leaf", maker: "Noor Ahmed", handle: "noorahmed", description: "A garden for bookmarks, fragments, and half-ideas.", tags: ["Astro", "SQLite"], color: "coral", preview: "leaf" },
  { number: "04", title: "Radio Silence", maker: "Eli Morgan", handle: "elimorgan", description: "Ambient internet radio for getting something done.", tags: ["Web Audio", "Vite"], color: "violet", preview: "radio" },
];

function Arrow() { return <span aria-hidden="true">↗</span>; }

function Preview({ type }: { type: string }) {
  if (type === "sundial") return (
    <div className="app-screen sundial-screen" aria-hidden="true">
      <div className="screen-bar"><i /><i /><i /><b>Today</b></div>
      <div className="sun-time">4:28</div><div className="sun-orbit"><span>deep work</span><b /></div>
      <div className="screen-caption">Tuesday · 6h 42m intentional</div>
    </div>
  );
  if (type === "fieldnotes") return (
    <div className="app-screen notes-screen" aria-hidden="true">
      <div className="note-sidebar"><strong>fieldnotes</strong><span>Inbox</span><span>Garden</span><span>Archive</span></div>
      <div className="note-page"><small>JUL 18 · 11:42 PM</small><h3>Things I noticed on the walk home</h3><p>The city gets quieter one block at a time.</p><p className="cursor-line">The best ideas arrive without a notification.</p></div>
    </div>
  );
  if (type === "leaf") return (
    <div className="app-screen leaf-screen" aria-hidden="true">
      <div className="leaf-top">loose leaf <span>12 fragments</span></div>
      <div className="fragment f-one">“Make it useful,<br />then make it odd.”</div><div className="fragment f-two">colors for<br />late summer</div><div className="fragment f-three">↳ read later</div>
    </div>
  );
  return (
    <div className="app-screen radio-screen" aria-hidden="true">
      <div className="radio-label">RADIO SILENCE · 094.2</div><div className="radio-ring"><span>now playing</span><strong>Soft Focus</strong><b>19:42</b></div>
      <div className="waveform">{Array.from({ length: 38 }).map((_, i) => <i key={i} />)}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <nav className="nav shell" aria-label="Primary navigation">
        <Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link>
        <div className="nav-links"><span>04 selected works</span></div>
        <a className="github-button" href="https://github.com" target="_blank" rel="noreferrer"><span className="github-dot" aria-hidden="true" /> Continue with GitHub</a>
      </nav>
      <section className="hero shell">
        <div className="eyebrow"><span>001</span> Offhours index</div>
        <h1>Made after work. <em>Shared with the world.</em></h1>
        <div className="hero-bottom"><p>A gallery for the little apps that became something worth showing.</p><span className="gallery-note">Independent · GitHub-native · Selected weekly</span></div>
      </section>
      <section className="projects shell" id="work">
        <div className="section-head"><div><span className="section-number">GALLERY / 001—004</span><h2>Selected work</h2></div><p>Small software, big personality.</p></div>
        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.title}>
              <Link className={`preview-frame ${project.color}`} href={`/maker/${project.handle}`} aria-label={`View ${project.title} by ${project.maker}`}>
                <div className="browser-chrome"><span /><span /><span /><b>{project.title.toLowerCase()}.app</b></div><Preview type={project.preview} /><span className="open-pill">Open project <Arrow /></span>
              </Link>
              <div className="project-meta"><span className="project-number">{project.number}</span><div><h3><Link href={`/maker/${project.handle}`}>{project.title}</Link></h3><p>{project.description}</p></div><div className="project-side"><Link href={`/maker/${project.handle}`}>by {project.maker}</Link><span>{project.tags.join(" · ")}</span></div></div>
            </article>
          ))}
        </div>
      </section>
      <footer className="footer shell"><Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link><p>For people who make things after they&apos;re done making things.</p><a className="footer-submit" href="https://github.com" target="_blank" rel="noreferrer">Submit from GitHub <Arrow /></a><small>© 2026</small></footer>
    </main>
  );
}
