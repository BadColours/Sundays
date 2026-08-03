import { listOpenReports, listProjectsForModeration, type Project, type ProjectReport } from "../../db/repository";
import { currentCreator, githubAuthConfigured, isAdmin } from "../../lib/auth";
import { ProjectThumbnail } from "../ProjectThumbnail";
import { SiteNav } from "../SiteNav";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const creator = await currentCreator();
  if (!creator) return <main><SiteNav /><section className="mvp-page shell"><div className="signin-panel"><div><h1>Administrator sign-in</h1><p>Use an allowlisted GitHub identity to review submissions.</p></div>{githubAuthConfigured() && <a className="mvp-button primary" href="/api/auth/github/start?return_to=%2Fadmin">Continue with GitHub</a>}</div></section></main>;
  if (!isAdmin(creator)) return <main><SiteNav /><section className="mvp-page shell"><div className="form-notice error">This GitHub identity is not authorized to moderate Sundays.</div></section></main>;
  let projects: Project[] = [];
  let reports: ProjectReport[] = [];
  try { [projects, reports] = await Promise.all([listProjectsForModeration(), listOpenReports()]); } catch { projects = []; reports = []; }
  return (
    <main>
      <SiteNav />
      <section className="mvp-page admin-page shell">
        <div className="dashboard-heading"><div><span className="section-number">ADMIN / REVIEW</span><h1>Submission queue</h1></div></div>
        <form className="health-check-control" action="/api/admin/projects/check" method="post"><div><b>Link health</b><span>Checks the twelve projects that have gone longest without a successful check. Three consecutive failures remove an approved project and notify its maker in their dashboard.</span></div><button type="submit">Check next 12 links</button></form>
        <section className="admin-report-section">
          <div className="admin-section-heading"><span className="section-number">REPORTS / OPEN</span><h2>{reports.length} to review</h2></div>
          {reports.length === 0 ? <div className="dashboard-empty">No open reports.</div> : <div className="report-list">
            {reports.map((report) => <article className="report-card" key={report.id}>
              <div><span className="status-chip status-unavailable">{report.reason.replaceAll("_", " ")}</span><h3>{report.project_title}</h3><p>{report.details ?? "No additional details were supplied."}</p><small>{report.display_name} · @{report.github_handle} · {new Date(report.created_at).toLocaleDateString()}</small></div>
              <div className="report-links"><a href={report.project_live_url} target="_blank" rel="noopener noreferrer">Open project ↗</a><a href={`/project/${report.project_slug}`}>View Sundays page</a></div>
              <form action={`/api/admin/reports/${report.id}`} method="post"><button name="action" value="reviewed" type="submit">Mark reviewed</button><button name="action" value="dismissed" type="submit">Dismiss</button><button className="danger-link" name="action" value="unavailable" type="submit">Mark unavailable</button></form>
            </article>)}
          </div>}
        </section>
        {projects.length === 0 ? <div className="dashboard-empty">No projects are waiting for review.</div> : (
          <div className="review-list">
            {projects.map((project) => (
              <article className="review-card" key={project.id}>
                <div className="review-thumb"><ProjectThumbnail project={project} /></div>
                <div className="review-copy"><div className="review-statuses"><span className={`status-chip status-${project.moderation_status}`}>{project.moderation_status}</span><span className={`status-chip verification-${project.verification_status}`}>{project.verification_status}</span><span className={`status-chip link-${project.last_check_status}`}>link: {project.last_check_status}</span></div><h2>{project.title}</h2><p>{project.short_description}</p><p><a href={project.github_profile_url} target="_blank" rel="noopener noreferrer">{project.display_name} · @{project.github_handle}</a></p>{project.repository_url && <a className="text-link" href={project.repository_url} target="_blank" rel="noopener noreferrer">Open repository ↗</a>}<a className="text-link" href={project.live_url} target="_blank" rel="noopener noreferrer">Open live project safely ↗</a>{project.last_checked_at && <small>Last checked {new Date(project.last_checked_at).toLocaleString()}</small>}</div>
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
