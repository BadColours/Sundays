import Link from "next/link";
import { currentCreator, githubAuthConfigured } from "../../lib/auth";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

const authErrors: Record<string, string> = {
  github_not_configured: "GitHub sign-in is not configured on this deployment yet.",
  github_auth_failed: "GitHub sign-in could not be completed. Please try again.",
  github_auth_expired: "That sign-in attempt expired. Please start again.",
  github_profile_failed: "Sundays could not read your public GitHub profile.",
};

export default async function JoinPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const creator = await currentCreator();
  const { error } = await searchParams;
  const configured = githubAuthConfigured();

  return (
    <main>
      <SiteNav />
      <section className="mvp-page shell">
        <span className="section-number">JOIN / MAKE A PROFILE</span>
        <div className="mvp-intro"><h1>Your page.<br />No permission needed.</h1><p>Use your public GitHub identity to make a Sundays profile. It goes live immediately and belongs to you.</p></div>
        {error && <div className="form-notice error" role="alert">{authErrors[error] ?? error}</div>}
        {creator ? (
          <div className="signin-panel profile-ready-panel">
            <div><span className="section-number">PROFILE / LIVE</span><h2>{creator.display_name}</h2><p>@{creator.github_handle} is already part of Sundays. You can share your profile now, whether or not you submit a project to the gallery.</p></div>
            <div className="join-actions"><Link className="mvp-button primary" href={`/maker/${creator.github_handle}`}>View your profile ↗</Link><Link className="mvp-button" href="/submit">Submit a project</Link></div>
          </div>
        ) : (
          <div className="signin-panel">
            <div><h2>Create a public maker profile.</h2><p>We use GitHub only for your public name, handle, avatar, and profile link. Sundays asks for no repository access, hosts no code, and does not review who can join.</p></div>
            {configured ? <a className="mvp-button primary" href="/api/auth/github/start?return_to=%2Fdashboard">Create profile with GitHub</a> : <span className="mvp-button disabled" aria-disabled="true">GitHub setup required</span>}
          </div>
        )}
      </section>
    </main>
  );
}
