import Link from "next/link";
import { currentCreator, isAdmin } from "../lib/auth";

export async function SiteNav({ active }: { active?: "explore" | "archive" | "about" }) {
  const creator = await currentCreator();
  return (
    <nav className="nav shell" aria-label="Primary navigation">
      <Link className="wordmark" href="/">sundays<span>.</span><small>offhours</small></Link>
      <div className="nav-tabs">
        <Link className={active === "explore" ? "active" : ""} href="/explore">Explore</Link>
        <Link className={active === "archive" ? "active" : ""} href="/archive">Archive</Link>
        <Link className={active === "about" ? "active" : ""} href="/about">About</Link>
      </div>
      <div className="nav-account">
        {creator ? (
          <>
            {isAdmin(creator) && <Link href="/admin">Review</Link>}
            <Link className="github-button" href="/dashboard">@{creator.github_handle}</Link>
          </>
        ) : <Link className="github-button" href="/join">Create profile</Link>}
      </div>
    </nav>
  );
}
