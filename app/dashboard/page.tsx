import Link from "next/link";
import { listProjectsForOwner, type Project } from "../../db/repository";
import { currentCreator, githubAuthConfigured } from "../../lib/auth";
import { ProjectThumbnail } from "../ProjectThumbnail";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

function statusCopy(project: Project) {
  if (project.moderation_status === "submitted") return "In review";
  if (project.moderation_status === "approved") return "Published";
  if (project.moderation_status === "declined") return "Changes requested";
  if (project.moderation_status === "unavailable") return "Unavailable";
  return "Draft / withdrawn";
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ submitted?: string; updated?: string; error?: string }> }) {
  const creator = await currentCreator();
  const query = await searchParams;
  if (!creator) {
    return <main><SiteNav /><section className="mvp-page shell"><span className="section-number">CREATOR / DASHBOARD</span><div className="signin-panel"><div><h1>Sign in to manage your projects.</h1><p>GitHub is used only for public creator identity. Sundays never requests repository access.</p></div>{githubAuthConfigured() ? <a className="mvp-button primary" href="/api/auth/github/start?return_to=%2Fdashboard">Continue with GitHub</a> : <Link className="mvp-button" href="/submit?error=github_not_configured">View setup status</Link>}</div></section></main>;
  }
  let projects: Project[] = [];
  try { projects = await listProjectsForOwner(creator.id); } catch { projects = []; }
  return (
    <main>
      <SiteNav />
      <section className="mvp-page dashboard-page shell">
        <div className="dashboard-heading"><div><span className="section-number">CREATOR / @{creator.github_handle}</span><h1>Your projects</h1></div><Link className="mvp-button primary" href="/submit">Submit another ↗</Link></div>
        {query.submitted && <div className="form-notice success" role="status"><b>Your project is in review.</b> We’ll check the live experience before publishing it. Nothing will go live until it is approved.</div>}
        {query.updated && <div className="form-notice success" role="status">Your project has been updated.</div>}
        {query.error && <div className="form-notice error" role="alert">{query.error}</div>}
        {projects.length === 0 ? <div className="dashboard-empty"><p>You have not submitted a project yet.</p><Link href="/submit">Submit a project ↗</Link></div> : (
          <div className="dashboard-projects">
            {projects.map((project) => (
              <article className="dashboard-card" key={project.id}>
                <div className="dashboard-thumb"><ProjectThumbnail project={project} /></div>
                <div className="dashboard-card-head"><div><span className={`status-chip status-${project.moderation_status}`}>{statusCopy(project)}</span><span className={`status-chip thumbnail-${project.thumbnail_status}`}>Thumbnail: {project.thumbnail_status}</span></div><small>Submitted {new Date(project.created_at).toLocaleDateString()}</small></div>
                <form className="dashboard-edit-form" action={`/api/projects/${project.id}`} method="post">
                  <input type="hidden" name="action" value="update" />
                  <label>Title<input name="title" defaultValue={project.title} minLength={2} maxLength={80} required /></label>
                  <label>Live URL<input name="live_url" type="url" defaultValue={project.live_url} required /></label>
                  <label>Description<textarea name="description" defaultValue={project.short_description} minLength={10} maxLength={240} rows={3} required /></label>
                  {project.moderation_note && <p className="moderation-feedback"><b>Review note:</b> {project.moderation_note}</p>}
                  <div className="form-actions"><button type="submit">Save changes</button>{project.moderation_status === "approved" && <Link href={`/project/${project.slug}`}>View project page</Link>}</div>
                </form>
                <div className="secondary-actions">
                  <form action={`/api/projects/${project.id}/recapture`} method="post"><button type="submit">Recapture thumbnail</button></form>
                  <form action={`/api/projects/${project.id}`} method="post"><input type="hidden" name="action" value="withdraw" /><button className="danger-link" type="submit">{project.moderation_status === "approved" ? "Unpublish" : "Withdraw"}</button></form>
                </div>
              </article>
            ))}
          </div>
        )}
        <form action="/api/auth/signout" method="post"><button className="plain-button" type="submit">Sign out</button></form>
      </section>
    </main>
  );
}
