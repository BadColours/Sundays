import { listProjectsForModeration, type Project } from "../../db/repository";
import { currentCreator, githubAuthConfigured, isAdmin } from "../../lib/auth";
import { ProjectThumbnail } from "../ProjectThumbnail";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const creator = await currentCreator();
  if (!creator) return <main><SiteNav /><section className="mvp-page shell"><div className="signin-panel"><div><h1>Administrator sign-in</h1><p>Use an allowlisted GitHub identity to review submissions.</p></div>{githubAuthConfigured() && <a className="mvp-button primary" href="/api/auth/github/start?return_to=%2Fadmin">Continue with GitHub</a>}</div></section></main>;
  if (!isAdmin(creator)) return <main><SiteNav /><section className="mvp-page shell"><div className="form-notice error">This GitHub identity is not authorized to moderate Sundays.</div></section></main>;
  let projects: Project[] = [];
  try { projects = await listProjectsForModeration(); } catch { projects = []; }
  return (
    <main>
      <SiteNav />
      <section className="mvp-page admin-page shell">
        <div className="dashboard-heading"><div><span className="section-number">ADMIN / REVIEW</span><h1>Submission queue</h1></div></div>
        {projects.length === 0 ? <div className="dashboard-empty">No projects are waiting for review.</div> : (
          <div className="review-list">
            {projects.map((project) => (
              <article className="review-card" key={project.id}>
                <div className="review-thumb"><ProjectThumbnail project={project} /></div>
                <div className="review-copy"><span className={`status-chip status-${project.moderation_status}`}>{project.moderation_status}</span><h2>{project.title}</h2><p>{project.short_description}</p><p><a href={project.github_profile_url} target="_blank" rel="noopener noreferrer">{project.display_name} · @{project.github_handle}</a></p><a className="text-link" href={project.live_url} target="_blank" rel="noopener noreferrer">Open live project safely ↗</a></div>
                <form className="review-actions" action={`/api/admin/projects/${project.id}`} method="post">
                  <label>Private review note<textarea name="note" rows={3} maxLength={500} defaultValue={project.moderation_note ?? ""} /></label>
                  <div>
                    {project.moderation_status === "submitted" && <><button name="action" value="approve" type="submit">Approve</button><button name="action" value="decline" type="submit">Decline</button></>}
                    {project.moderation_status === "approved" && <button name="action" value="unavailable" type="submit">Mark unavailable</button>}
                    {project.moderation_status === "unavailable" && <button name="action" value="restore" type="submit">Restore</button>}
                    {project.moderation_status === "declined" && <button name="action" value="approve" type="submit">Approve</button>}
                  </div>
                </form>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
