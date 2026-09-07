import { env } from "cloudflare:workers";

export type ModerationStatus = "draft" | "submitted" | "approved" | "declined" | "unavailable";
export type ProfileStatus = "visible" | "hidden";
export type ThumbnailStatus = "pending" | "ready" | "failed";
export type VerificationStatus = "unverified" | "verified" | "disputed";
export type LinkCheckStatus = "unchecked" | "healthy" | "failing";

export type Creator = {
  id: string;
  github_id: string;
  github_handle: string;
  display_name: string;
  avatar_url: string;
  github_profile_url: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  creator_id: string;
  slug: string;
  title: string;
  short_description: string;
  live_url: string;
  repository_url: string | null;
  verification_status: VerificationStatus;
  profile_status: ProfileStatus;
  moderation_status: ModerationStatus;
  thumbnail_status: ThumbnailStatus;
  thumbnail_storage_key: string | null;
  thumbnail_error: string | null;
  moderation_note: string | null;
  last_checked_at: string | null;
  last_check_status: LinkCheckStatus;
  consecutive_check_failures: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  github_handle?: string;
  display_name?: string;
  avatar_url?: string;
  github_profile_url?: string;
};

export type ProjectReport = {
  id: string;
  project_id: string;
  reason: string;
  details: string | null;
  status: "open" | "reviewed" | "dismissed";
  created_at: string;
  project_title: string;
  project_slug: string;
  project_live_url: string;
  github_handle: string;
  display_name: string;
};

type RuntimeBindings = {
  DB?: D1Database;
  THUMBNAILS?: R2Bucket;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  APP_ORIGIN?: string;
  SESSION_SECRET?: string;
  ADMIN_GITHUB_HANDLES?: string;
  SCREENSHOT_API_URL?: string;
  SCREENSHOT_API_TOKEN?: string;
};

export function bindings(): RuntimeBindings {
  return env as unknown as RuntimeBindings;
}

export function database(): D1Database {
  const databaseBinding = bindings().DB;
  if (!databaseBinding) throw new Error("D1 binding DB is unavailable");
  return databaseBinding;
}

function joinedProjectSelect() {
  return `SELECT projects.*, creators.github_handle, creators.display_name, creators.avatar_url, creators.github_profile_url
    FROM projects JOIN creators ON creators.id = projects.creator_id`;
}

export async function listApprovedProjects(limit = 60): Promise<Project[]> {
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.moderation_status = 'approved' AND projects.profile_status = 'visible' AND projects.moderation_status != 'unavailable'
    ORDER BY projects.published_at DESC LIMIT ?`).bind(limit).all<Project>();
  return result.results;
}

export async function getApprovedProjectBySlug(slug: string): Promise<Project | null> {
  return await database().prepare(`${joinedProjectSelect()}
    WHERE projects.slug = ? AND projects.moderation_status = 'approved' AND projects.profile_status = 'visible' LIMIT 1`).bind(slug).first<Project>();
}

export async function getCreatorByHandle(handle: string): Promise<Creator | null> {
  return await database().prepare("SELECT * FROM creators WHERE lower(github_handle) = lower(?) LIMIT 1").bind(handle).first<Creator>();
}

export async function listVisibleProjectsForCreator(creatorId: string): Promise<Project[]> {
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.creator_id = ? AND projects.profile_status = 'visible' AND projects.moderation_status != 'unavailable'
    ORDER BY projects.created_at DESC`).bind(creatorId).all<Project>();
  return result.results;
}

export async function getCreatorForSession(tokenHash: string): Promise<Creator | null> {
  return await database().prepare(`SELECT creators.* FROM sessions
    JOIN creators ON creators.id = sessions.creator_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ? LIMIT 1`).bind(tokenHash, new Date().toISOString()).first<Creator>();
}

export async function createOAuthState(stateHash: string, returnTo: string) {
  const now = new Date();
  const expires = new Date(now.getTime() + 10 * 60 * 1000);
  await database().prepare("INSERT INTO oauth_states (state_hash, return_to, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(stateHash, returnTo, now.toISOString(), expires.toISOString()).run();
}

export async function consumeOAuthState(stateHash: string): Promise<string | null> {
  const db = database();
  const state = await db.prepare("DELETE FROM oauth_states WHERE state_hash = ? AND expires_at > ? RETURNING return_to")
    .bind(stateHash, new Date().toISOString()).first<{ return_to: string }>();
  return state?.return_to ?? null;
}

export async function upsertCreator(profile: {
  githubId: string;
  githubHandle: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
}): Promise<Creator> {
  const db = database();
  const existing = await db.prepare("SELECT id FROM creators WHERE github_id = ? LIMIT 1").bind(profile.githubId).first<{ id: string }>();
  const id = existing?.id ?? crypto.randomUUID();
  const now = new Date().toISOString();
  if (existing) {
    await db.prepare(`UPDATE creators SET github_handle = ?, display_name = ?, avatar_url = ?, github_profile_url = ?, updated_at = ? WHERE id = ?`)
      .bind(profile.githubHandle, profile.displayName, profile.avatarUrl, profile.profileUrl, now, id).run();
  } else {
    await db.prepare(`INSERT INTO creators (id, github_id, github_handle, display_name, avatar_url, github_profile_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(id, profile.githubId, profile.githubHandle, profile.displayName, profile.avatarUrl, profile.profileUrl, now, now).run();
  }
  return (await db.prepare("SELECT * FROM creators WHERE id = ?").bind(id).first<Creator>())!;
}

export async function createSession(tokenHash: string, creatorId: string) {
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await database().prepare("INSERT INTO sessions (token_hash, creator_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, creatorId, now.toISOString(), expires.toISOString()).run();
}

export async function deleteSession(tokenHash: string) {
  await database().prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}

function slugBase(value: string) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 46) || "project";
}

async function uniqueSlug(title: string) {
  const db = database();
  const base = slugBase(title);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${crypto.randomUUID().slice(0, 6)}`;
    const slug = `${base}${suffix}`;
    const found = await db.prepare("SELECT 1 AS found FROM projects WHERE slug = ? LIMIT 1").bind(slug).first();
    if (!found) return slug;
  }
  return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function createProject(input: { creatorId: string; title: string; description: string; liveUrl: string; repositoryUrl: string | null; verificationStatus: VerificationStatus }): Promise<Project> {
  const id = crypto.randomUUID();
  const slug = await uniqueSlug(input.title);
  const now = new Date().toISOString();
  await database().prepare(`INSERT INTO projects
    (id, creator_id, slug, title, short_description, live_url, repository_url, verification_status, profile_status, moderation_status, thumbnail_status, last_checked_at, last_check_status, consecutive_check_failures, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible', 'submitted', 'pending', NULL, 'unchecked', 0, ?, ?)`)
    .bind(id, input.creatorId, slug, input.title, input.description, input.liveUrl, input.repositoryUrl, input.verificationStatus, now, now).run();
  return (await getProjectById(id))!;
}

export async function getProjectById(id: string): Promise<Project | null> {
  return await database().prepare(`${joinedProjectSelect()} WHERE projects.id = ? LIMIT 1`).bind(id).first<Project>();
}

export async function getOwnedProject(id: string, creatorId: string): Promise<Project | null> {
  return await database().prepare(`${joinedProjectSelect()} WHERE projects.id = ? AND projects.creator_id = ? LIMIT 1`).bind(id, creatorId).first<Project>();
}

export async function listProjectsForOwner(creatorId: string): Promise<Project[]> {
  const result = await database().prepare(`${joinedProjectSelect()} WHERE projects.creator_id = ? ORDER BY projects.created_at DESC`)
    .bind(creatorId).all<Project>();
  return result.results;
}

export async function updateOwnedProject(id: string, creatorId: string, input: { title: string; description: string; liveUrl: string; repositoryUrl: string | null; verificationStatus: VerificationStatus }) {
  const project = await getOwnedProject(id, creatorId);
  if (!project) return false;
  const nextStatus: ModerationStatus = project.moderation_status === "approved" ? "submitted" : project.moderation_status === "unavailable" ? "submitted" : project.moderation_status;
  const now = new Date().toISOString();
  await database().prepare(`UPDATE projects SET title = ?, short_description = ?, live_url = ?, repository_url = ?, verification_status = ?, moderation_status = ?, moderation_note = NULL, last_checked_at = NULL, last_check_status = 'unchecked', consecutive_check_failures = 0, updated_at = ? WHERE id = ? AND creator_id = ?`)
    .bind(input.title, input.description, input.liveUrl, input.repositoryUrl, input.verificationStatus, nextStatus, now, id, creatorId).run();
  return true;
}

export async function withdrawOwnedProject(id: string, creatorId: string) {
  await database().prepare("UPDATE projects SET profile_status = 'hidden', moderation_status = 'draft', published_at = NULL, updated_at = ? WHERE id = ? AND creator_id = ?")
    .bind(new Date().toISOString(), id, creatorId).run();
}

export async function showOwnedProjectOnProfile(id: string, creatorId: string) {
  await database().prepare("UPDATE projects SET profile_status = 'visible', updated_at = ? WHERE id = ? AND creator_id = ?")
    .bind(new Date().toISOString(), id, creatorId).run();
}

export async function submitOwnedProjectToGallery(id: string, creatorId: string) {
  const project = await getOwnedProject(id, creatorId);
  if (!project || project.profile_status !== "visible" || !["draft", "declined"].includes(project.moderation_status)) return false;
  await database().prepare("UPDATE projects SET moderation_status = 'submitted', moderation_note = NULL, updated_at = ? WHERE id = ? AND creator_id = ?")
    .bind(new Date().toISOString(), id, creatorId).run();
  return true;
}

export async function setThumbnailState(id: string, status: ThumbnailStatus, key: string | null, error: string | null, expectedUrl: string, expectedVersion: string) {
  const result = await database().prepare("UPDATE projects SET thumbnail_status = ?, thumbnail_storage_key = COALESCE(?, thumbnail_storage_key), thumbnail_error = ? WHERE id = ? AND live_url = ? AND updated_at = ?")
    .bind(status, key, error, id, expectedUrl, expectedVersion).run();
  return result.meta.changes > 0;
}

export async function queueThumbnail(id: string, clear = false) {
  await database().prepare("UPDATE projects SET thumbnail_status = 'pending', thumbnail_storage_key = CASE WHEN ? THEN NULL ELSE thumbnail_storage_key END, thumbnail_error = NULL, updated_at = ? WHERE id = ?")
    .bind(clear ? 1 : 0, new Date().toISOString(), id).run();
}

export async function listProjectsForModeration(): Promise<Project[]> {
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.moderation_status IN ('submitted', 'approved', 'declined', 'unavailable')
    ORDER BY CASE projects.moderation_status WHEN 'submitted' THEN 0 ELSE 1 END, projects.updated_at DESC`).all<Project>();
  return result.results;
}

export async function listProjectsForHealthCheck(limit = 12): Promise<Project[]> {
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.moderation_status = 'approved'
      OR (projects.moderation_status = 'unavailable' AND projects.moderation_note LIKE 'Automatic link check:%')
    ORDER BY CASE WHEN projects.last_checked_at IS NULL THEN 0 ELSE 1 END, projects.last_checked_at ASC
    LIMIT ?`).bind(limit).all<Project>();
  return result.results;
}

export async function moderateProject(id: string, action: "approve" | "decline" | "unavailable" | "restore", note: string | null) {
  const now = new Date().toISOString();
  const status: ModerationStatus = action === "approve" || action === "restore" ? "approved" : action === "decline" ? "declined" : "unavailable";
  const published = status === "approved" ? now : null;
  await database().prepare(`UPDATE projects SET moderation_status = ?, moderation_note = ?, published_at = CASE WHEN ? = 'approved' THEN COALESCE(published_at, ?) ELSE NULL END, updated_at = ? WHERE id = ? AND profile_status = 'visible'`)
    .bind(status, note, status, published, now, id).run();
}

export async function createReport(projectId: string, reason: string, details: string | null) {
  await database().prepare("INSERT INTO project_reports (id, project_id, reason, details, status, created_at) VALUES (?, ?, ?, ?, 'open', ?)")
    .bind(crypto.randomUUID(), projectId, reason, details, new Date().toISOString()).run();
}

export async function consumeReportAllowance(fingerprint: string, limit = 5) {
  const now = new Date().toISOString();
  const db = database();
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  await db.batch([
    db.prepare("DELETE FROM report_rate_limits WHERE window_start < ?").bind(cutoff),
    db.prepare(`INSERT INTO report_rate_limits (fingerprint, window_start, count) VALUES (?, ?, 1)
      ON CONFLICT(fingerprint) DO UPDATE SET count = count + 1`).bind(fingerprint, now),
  ]);
  const row = await db.prepare("SELECT count FROM report_rate_limits WHERE fingerprint = ? LIMIT 1").bind(fingerprint).first<{ count: number }>();
  return (row?.count ?? limit + 1) <= limit;
}

export async function listOpenReports(): Promise<ProjectReport[]> {
  const result = await database().prepare(`SELECT project_reports.*, projects.title AS project_title, projects.slug AS project_slug,
    projects.live_url AS project_live_url, creators.github_handle, creators.display_name
    FROM project_reports
    JOIN projects ON projects.id = project_reports.project_id
    JOIN creators ON creators.id = projects.creator_id
    WHERE project_reports.status = 'open'
    ORDER BY project_reports.created_at DESC`).all<ProjectReport>();
  return result.results;
}

export async function resolveProjectReport(reportId: string, action: "reviewed" | "dismissed" | "unavailable") {
  const db = database();
  const report = await db.prepare("SELECT project_id, reason FROM project_reports WHERE id = ? AND status = 'open' LIMIT 1")
    .bind(reportId).first<{ project_id: string; reason: string }>();
  if (!report) return false;
  const now = new Date().toISOString();
  const updates = [db.prepare("UPDATE project_reports SET status = ? WHERE id = ?").bind(action === "dismissed" ? "dismissed" : "reviewed", reportId)];
  if (action === "unavailable") {
    updates.push(db.prepare(`UPDATE projects SET moderation_status = 'unavailable', verification_status = CASE WHEN ? THEN 'disputed' ELSE verification_status END, moderation_note = ?, published_at = NULL, updated_at = ? WHERE id = ?`)
      .bind(report.reason === "ownership_dispute" ? 1 : 0, "A visitor reported a problem with this project. Check the live URL or repository, then update the project to resubmit it.", now, report.project_id));
  }
  await db.batch(updates);
  return true;
}

export async function setProjectLinkHealth(id: string, healthy: boolean, message?: string) {
  const db = database();
  const project = await db.prepare("SELECT consecutive_check_failures, moderation_status, moderation_note FROM projects WHERE id = ? LIMIT 1")
    .bind(id).first<{ consecutive_check_failures: number; moderation_status: ModerationStatus; moderation_note: string | null }>();
  if (!project) return null;
  const now = new Date().toISOString();
  if (healthy) {
    const autoRestore = project.moderation_status === "unavailable" && project.moderation_note?.startsWith("Automatic link check:");
    await db.prepare(`UPDATE projects SET last_checked_at = ?, last_check_status = 'healthy', consecutive_check_failures = 0,
      moderation_status = CASE WHEN ? THEN 'approved' ELSE moderation_status END,
      moderation_note = CASE WHEN ? THEN NULL ELSE moderation_note END,
      published_at = CASE WHEN ? THEN ? ELSE published_at END, updated_at = ? WHERE id = ?`)
      .bind(now, autoRestore ? 1 : 0, autoRestore ? 1 : 0, autoRestore ? 1 : 0, now, now, id).run();
    return { status: "healthy" as const, failures: 0, restored: autoRestore };
  }
  const failures = (project.consecutive_check_failures ?? 0) + 1;
  const markUnavailable = failures >= 3 && project.moderation_status === "approved";
  await db.prepare(`UPDATE projects SET last_checked_at = ?, last_check_status = 'failing', consecutive_check_failures = ?,
    moderation_status = CASE WHEN ? THEN 'unavailable' ELSE moderation_status END,
    moderation_note = CASE WHEN ? THEN ? ELSE moderation_note END,
    published_at = CASE WHEN ? THEN NULL ELSE published_at END, updated_at = ? WHERE id = ?`)
    .bind(now, failures, markUnavailable ? 1 : 0, markUnavailable ? 1 : 0,
      `Automatic link check: the project could not be reached three times${message ? ` (${message})` : ""}. It will return automatically after a successful check.`, markUnavailable ? 1 : 0, now, id).run();
  return { status: "failing" as const, failures, unavailable: markUnavailable };
}
