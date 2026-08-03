import Link from "next/link";
import { currentCreator, githubAuthConfigured } from "../../lib/auth";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

const authErrors: Record<string, string> = {
  github_not_configured: "GitHub sign-in is not configured on this deployment yet.",
  github_auth_failed: "GitHub sign-in could not be completed. Please try again.",
  github_auth_expired: "That sign-in attempt expired. Please start again.",
  github_profile_failed: "Sundays could not read your public GitHub profile.",
  signin_required: "Sign in with GitHub before submitting a project.",
};

export default async function SubmitPage({ searchParams }: { searchParams: Promise<{ error?: string; return_to?: string }> }) {
  const creator = await currentCreator();
  const { error, return_to: returnTo } = await searchParams;
  const configured = githubAuthConfigured();
  return (
    <main>
      <SiteNav />
      <section className="mvp-page shell">
        <span className="section-number">SUBMIT / A PROJECT</span>
        <div className="mvp-intro"><h1>Made after hours?<br />Show us.</h1><p>Creators keep hosting, ownership, security, and maintenance. Sundays stores only your listing and a promotional thumbnail.</p></div>
        {error && <div className="form-notice error" role="alert">{authErrors[error] ?? error}</div>}
        {!creator ? (
          <div className="signin-panel">
            <div><h2>Start with your public GitHub identity.</h2><p>Sundays uses GitHub only to identify the creator. We request no repository access and never ingest or deploy code.</p></div>
            {configured ? <a className="mvp-button primary" href={`/api/auth/github/start?return_to=${encodeURIComponent(returnTo || "/submit")}`}>Continue with GitHub</a> : <span className="mvp-button disabled" aria-disabled="true">GitHub setup required</span>}
          </div>
        ) : (
          <form className="submission-form" action="/api/projects" method="post">
            <div className="signed-in-line"><img src={creator.avatar_url} alt="" /><span>Submitting as <b>{creator.display_name}</b> · @{creator.github_handle}</span><Link href="/dashboard">View dashboard</Link></div>
            <label>Live project URL<input name="live_url" type="url" inputMode="url" placeholder="https://your-project.example" required /></label>
            <label>Project title<input name="title" type="text" minLength={2} maxLength={80} required /></label>
            <label>Short description<textarea name="description" minLength={10} maxLength={240} rows={4} required /></label>
            <p className="permission-copy">By submitting, you confirm the public page is yours to share and grant Sundays permission to capture and display a promotional image of it.</p>
            <button className="mvp-button primary" type="submit">Submit for review ↗</button>
          </form>
        )}
      </section>
    </main>
  );
}
