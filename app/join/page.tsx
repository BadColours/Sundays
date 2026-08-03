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
      <section className="login-page shell">
        {error && <div className="form-notice error" role="alert">{authErrors[error] ?? error}</div>}
        {creator ? (
          <Link className="github-login" href="/dashboard"><img src={creator.avatar_url} alt="" />Continue as @{creator.github_handle}</Link>
        ) : (
          configured
            ? <a className="github-login" href="/api/auth/github/start?return_to=%2Fdashboard"><img src="https://github.githubassets.com/favicons/favicon.svg" alt="" />Log in</a>
            : <span className="github-login disabled" aria-disabled="true" title="GitHub login is not configured yet"><img src="https://github.githubassets.com/favicons/favicon.svg" alt="" />Log in</span>
        )}
      </section>
    </main>
  );
}
