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
        <Link className="wordmark" href="/">offhours<span>.</span></Link>
        <div className="nav-links"><a href="#work">Explore</a><a href="#about">About</a></div>
        <a className="github-button" href="https://github.com" target="_blank" rel="noreferrer"><span className="github-dot" aria-hidden="true" /> Continue with GitHub</a>
      </nav>
      <section className="hero shell">
        <div className="eyebrow"><span>001</span> Built after hours</div>
        <h1>Made after work.<br /><em>Shared with the world.</em></h1>
        <div className="hero-bottom"><p>A gallery for the little apps that became<br />something worth showing.</p><a className="text-link" href="#work">See what&apos;s being made <Arrow /></a></div>
      </section>
      <section className="ticker" aria-label="Gallery facts"><div><span>Independent software</span><b>✳</b><span>Built for the joy of it</span><b>✳</b><span>Open on GitHub</span><b>✳</b><span>Independent software</span><b>✳</b><span>Built for the joy of it</span></div></section>
      <section className="projects shell" id="work">
        <div className="section-head"><div><span className="section-number">01 / 03</span><h2>Fresh from the<br />side-project folder.</h2></div><p>Small software, big personality.<br />Selected weekly.</p></div>
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
      <section className="makers shell" id="about">
        <span className="section-number">02 / 03</span>
        <div className="makers-copy"><h2>No pitches.<br />No growth hacks.<br /><em>Just good work.</em></h2><p>offhours is for people who make things because they can&apos;t quite stop themselves. Your page, your projects, your GitHub. We host the gallery—not your work.</p><a className="light-button" href="https://github.com" target="_blank" rel="noreferrer">Add yours with GitHub <Arrow /></a></div>
        <div className="maker-stack" aria-label="Featured makers">
          {projects.slice(0, 3).map((project, index) => <Link className="maker-row" href={`/maker/${project.handle}`} key={project.handle}><span className={`avatar avatar-${index + 1}`} aria-hidden="true">{project.maker.charAt(0)}</span><span><strong>{project.maker}</strong><small>@{project.handle}</small></span><b>{String(index + 1).padStart(2, "0")} projects</b><Arrow /></Link>)}
        </div>
      </section>
      <section className="submit shell">
        <span className="section-number">03 / 03</span><div className="submit-mark">↘</div><h2>That thing you made<br />last weekend?</h2>
        <div><p>It belongs here.</p><a className="dark-button" href="https://github.com" target="_blank" rel="noreferrer"><span className="github-dot light" aria-hidden="true" /> Submit from GitHub <Arrow /></a></div>
      </section>
      <footer className="footer shell"><Link className="wordmark" href="/">offhours<span>.</span></Link><p>For people who make things<br />after they&apos;re done making things.</p><div><a href="#work">Explore</a><a href="https://github.com">GitHub</a><a href="mailto:hello@offhours.gallery">Say hello</a></div><small>© 2026 offhours</small></footer>
    </main>
  );
}
