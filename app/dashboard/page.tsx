import { ProjectForm } from "../ProjectForm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { listProjectsForOwner, type Project } from "../../db/repository";
import { currentCreator } from "../../lib/auth";
import { listPublicGitHubRepositories, type PublicGitHubRepository } from "../../lib/github-public";
import { ProjectThumbnail } from "../ProjectThumbnail";
import { PreviewStatusRefresh } from "../PreviewStatusRefresh";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

function galleryStatusCopy(project: Project) {
  if (project.moderation_status === "submitted") return "Gallery: in review";
  if (project.moderation_status === "approved") return "Gallery: published";
  if (project.moderation_status === "declined") return "Changes requested";
  if (project.moderation_status === "unavailable") return "Unavailable";
  return "Not in gallery review";
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ submitted?: string; updated?: string; error?: string }> }) {
  const creator = await currentCreator();
  const query = await searchParams;
  if (!creator) redirect("/join?return_to=%2Fdashboard");
  const projects = await listProjectsForOwner(creator.id);
  let repositories: PublicGitHubRepository[] = [];
  let repositoryError = "";
  try { repositories = await listPublicGitHubRepositories(creator.github_handle); } catch (error) { repositoryError = error instanceof Error ? error.message : "GitHub could not load your public repositories right now."; }
  const sharedRepositories = new Set(projects.map((project) => project.repository_url?.replace(/\/$/, "").toLowerCase()).filter(Boolean));
  const previewsAreProcessing = projects.some((project) => project.thumbnail_status === "pending");
  return (
    <main>
      <PreviewStatusRefresh active={previewsAreProcessing} />
      <SiteNav />
      <section id="content" tabIndex={-1} className="mvp-page dashboard-page shell">
        <div className="dashboard-heading"><div><span className="section-number">CREATOR / @{creator.github_handle}</span><h1>Your projects</h1><p className="profile-live-note">Your maker profile is live now. <Link href={`/maker/${creator.github_handle}`}>View public profile ↗</Link></p></div><Link className="mvp-button primary" href="/submit">Add a project ↗</Link></div>
        {query.submitted && <div className="form-notice success" role="status"><b>Your project is live on your profile.</b> It is also in review for the gallery.</div>}
        {query.updated && <div className="form-notice success" role="status">{query.updated === "withdrawn" ? "The project is now hidden from your profile and withdrawn from Explore review." : query.updated === "profile" ? "The project is live on your profile." : query.updated === "thumbnail" ? "Preview capture has been queued." : query.updated === "gallery" ? "Your project has been submitted to Explore." : "Your project has been updated."}</div>}
        {query.error && <div className="form-notice error" role="alert">{query.error}</div>}
        <div className="dashboard-section-heading"><span className="section-number">SHARED ON SUNDAYS</span><h2>Your shared projects</h2></div>
        {projects.length === 0 ? <div className="dashboard-empty"><p>Nothing shared yet. Add a project or choose a public repository below.</p></div> : (
          <div className="dashboard-projects">
            {projects.map((project) => (
              <article className="dashboard-card" key={project.id}>
                <div className="dashboard-thumb"><ProjectThumbnail project={project} /></div>
                <div className="dashboard-card-head"><div><span className={`status-chip profile-${project.profile_status}`}>{project.profile_status === "visible" ? "Live on profile" : "Hidden from profile"}</span><span className={`status-chip status-${project.moderation_status}`}>{galleryStatusCopy(project)}</span><span className={`status-chip thumbnail-${project.thumbnail_status}`}>{project.thumbnail_status === "ready" ? "Preview: captured" : project.thumbnail_status === "pending" ? "Preview: capturing" : "Preview: retry needed"}</span><span className={`status-chip verification-${project.verification_status}`}>{project.verification_status === "verified" ? "Repository matched" : "Repository unverified"}</span><span className={`status-chip link-${project.last_check_status}`}>Link: {project.last_check_status}</span></div><small>Shared {new Date(project.created_at).toLocaleDateString()}</small></div>
                <ProjectForm className="dashboard-edit-form" action={`/api/projects/${project.id}`}>
                  <input type="hidden" name="action" value="update" />
                  <label>Title<input name="title" defaultValue={project.title} minLength={2} maxLength={80} required /></label>
                  <label>Live URL<input name="live_url" type="url" defaultValue={project.live_url} required /></label>
                  <label>GitHub repository<input name="repository_url" type="url" defaultValue={project.repository_url ?? ""} placeholder={`https://github.com/${creator.github_handle}/project`} /></label>
                  <label>Description<textarea name="description" defaultValue={project.short_description} minLength={10} maxLength={240} rows={3} required /></label>
                  {project.moderation_note && <p className="moderation-feedback"><b>Review note:</b> {project.moderation_note}</p>}
                  <div className="form-actions"><button type="submit">Save changes</button>{project.moderation_status === "approved" && <small>Saving sends this project back to gallery review.</small>}{project.moderation_status === "approved" && <Link href={`/project/${project.slug}`}>View project page</Link>}</div>
                </ProjectForm>
                <div className="secondary-actions">
                  {/* Server-only request-time age check, not a client render. */}
                  {/* eslint-disable-next-line react-hooks/purity */}
                  {(project.thumbnail_status === "failed" || (project.thumbnail_status === "pending" && Date.now() - Date.parse(project.updated_at) > 120_000)) && <form action={`/api/projects/${project.id}/recapture`} method="post"><button type="submit">Retry preview</button></form>}
                  {(project.moderation_status === "draft" || project.moderation_status === "declined") && project.profile_status === "visible" && <form action={`/api/projects/${project.id}`} method="post"><input type="hidden" name="action" value="submit_gallery" /><button type="submit">Submit to Explore</button></form>}
                  {project.profile_status === "visible" ? <form action={`/api/projects/${project.id}`} method="post"><input type="hidden" name="action" value="withdraw" /><button className="danger-link" type="submit">Hide project everywhere</button></form> : <form action={`/api/projects/${project.id}`} method="post"><input type="hidden" name="action" value="show_profile" /><button type="submit">Share on profile</button></form>}
                </div>
              </article>
            ))}
          </div>
        )}
        <section className="repository-picker" aria-labelledby="public-repositories-heading">
          <div className="repository-picker-heading"><div><span className="section-number">PUBLIC ON GITHUB</span><h2 id="public-repositories-heading">Choose what to share.</h2></div><span>{repositories.length} repositories</span></div>
          {repositoryError ? <div className="form-notice error" role="status">{repositoryError} <a href="/dashboard">Try again</a></div> : repositories.length === 0 ? <div className="repository-empty">No public repositories found. <Link href="/submit">Add a project ↗</Link></div> : (
            <div className="repository-list">
              {repositories.map((repository) => {
                const alreadyShared = sharedRepositories.has(repository.repositoryUrl.replace(/\/$/, "").toLowerCase());
                const params = new URLSearchParams({ repository_url: repository.repositoryUrl, title: repository.name });
                if (repository.description.length >= 10) params.set("description", repository.description.slice(0, 240));
                if (repository.liveUrl) params.set("live_url", repository.liveUrl);
                return <article className="repository-row" key={repository.id}>
                  <div><h3>{repository.name}</h3><p>{repository.description || "No description on GitHub."}</p></div>
                  <div className="repository-meta">{repository.language && <span>{repository.language}</span>}{repository.isFork && <span>Fork</span>}{repository.isArchived && <span>Archived</span>}<span>Updated {new Date(repository.updatedAt).toLocaleDateString()}</span></div>
                  {alreadyShared ? <span className="repository-shared">Shared</span> : <Link className="repository-share" href={`/submit?${params.toString()}`}>Share ↗</Link>}
                </article>;
              })}
            </div>
          )}
        </section>
        <form action="/api/auth/signout" method="post"><button className="plain-button" type="submit">Sign out</button></form>
      </section>
    </main>
  );
}
