import Link from "next/link";
import { currentCreator, githubAuthConfigured, safeReturnTo } from "../../lib/auth";
import { SiteNav } from "../SiteNav";
export const dynamic = "force-dynamic";
const authErrors: Record<string, string> = {
  github_not_configured: "GitHub sign-in is temporarily unavailable.",
  github_auth_failed: "GitHub sign-in could not be completed. Please try again.",
  github_auth_expired: "That sign-in attempt expired. Please start again.",
  github_profile_failed: "We couldn’t read your public GitHub profile. Please try again.",
};
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ error?: string; return_to?: string }> }) {
  const creator = await currentCreator();
  const query = await searchParams;
  const destination = safeReturnTo(query.return_to ?? null);
  const configured = githubAuthConfigured();
  return <main><SiteNav /><section id="content" tabIndex={-1} className="login-page shell"><div className="login-copy"><span className="section-number">CREATOR / SIGN IN</span><h1>A place for your work.</h1><p>Sign in with GitHub to share projects and manage your public creator profile.</p>{query.error && <div className="form-notice error" role="alert">{authErrors[query.error] ?? "Sign-in could not be completed. Please try again."}</div>}{creator ? <Link className="github-login" href={destination}>Continue as @{creator.github_handle}</Link> : configured ? <a className="github-login" href={`/api/auth/github/start?return_to=${encodeURIComponent(destination)}`}>Continue with GitHub ↗</a> : <p className="form-notice" role="status">GitHub sign-in is temporarily unavailable. You can still browse the gallery.</p>}<p className="login-note">Public identity only. No private repository access.</p><Link className="text-link" href="/explore">Browse the collection</Link></div></section></main>;
}
