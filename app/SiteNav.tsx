import Link from "next/link";

export function SiteNav({ active }: { active?: "explore" | "archive" | "about" }) {
  return (
    <nav className="nav shell" aria-label="Primary navigation">
      <Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link>
      <div className="nav-tabs">
        <Link className={active === "explore" ? "active" : ""} href="/explore">Explore</Link>
        <Link className={active === "archive" ? "active" : ""} href="/archive">Archive</Link>
        <Link className={active === "about" ? "active" : ""} href="/about">About</Link>
      </div>
      <a className="github-button" href="https://github.com" target="_blank" rel="noreferrer">Continue with GitHub</a>
    </nav>
  );
}
