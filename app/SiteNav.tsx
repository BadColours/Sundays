import Link from "next/link";
import { currentCreator, isAdmin } from "../lib/auth";

export async function SiteNav({ active, demo = false }: { active?: "explore" | "archive" | "about"; demo?: boolean }) {
  const creator = demo ? null : await currentCreator();
  return (
    <nav className="nav shell" aria-label="Primary navigation">
      <a className="skip-link" href="#content">Skip to content</a>
      <Link className="wordmark" href={demo ? "/demo" : "/"}>sundays<span>.</span><small>offhours</small></Link>
      <div className="nav-tabs">
        <Link aria-current={active === "explore" ? "page" : undefined} className={active === "explore" ? "active" : ""} href={demo ? "/demo/explore" : "/explore"}>Explore</Link>
        <Link aria-current={active === "archive" ? "page" : undefined} className={active === "archive" ? "active" : ""} href={demo ? "/demo/archive" : "/archive"}>Archive</Link>
        <Link aria-current={active === "about" ? "page" : undefined} className={active === "about" ? "active" : ""} href={demo ? "/demo/about" : "/about"}>About</Link>
      </div>
      <div className="nav-account">
        {demo ? <Link className="github-button" href="/">Live gallery ↗</Link> : creator ? (
          <>
            {isAdmin(creator) && <Link href="/admin">Review</Link>}
            <Link className="github-button" href="/dashboard" title={`Dashboard for @${creator.github_handle}`}>Dashboard</Link>
          </>
        ) : <Link className="github-button github-login-nav" href="/join"><img src="https://github.githubassets.com/favicons/favicon.svg" alt="" />Log in</Link>}
      </div>
    </nav>
  );
}
