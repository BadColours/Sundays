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

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS creators (
    id TEXT PRIMARY KEY NOT NULL,
    github_id TEXT NOT NULL,
    github_handle TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    github_profile_url TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS creators_github_id_idx ON creators (github_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS creators_github_handle_idx ON creators (github_handle)`,
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY NOT NULL,
    creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT NOT NULL,
    live_url TEXT NOT NULL,
    repository_url TEXT,
    verification_status TEXT NOT NULL DEFAULT 'unverified',
    profile_status TEXT NOT NULL DEFAULT 'visible',
    moderation_status TEXT NOT NULL DEFAULT 'submitted',
    thumbnail_status TEXT NOT NULL DEFAULT 'pending',
    thumbnail_storage_key TEXT,
    thumbnail_error TEXT,
    moderation_note TEXT,
    last_checked_at TEXT,
    last_check_status TEXT NOT NULL DEFAULT 'unchecked',
    consecutive_check_failures INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_idx ON projects (slug)`,
  `CREATE INDEX IF NOT EXISTS projects_creator_idx ON projects (creator_id)`,
  `CREATE INDEX IF NOT EXISTS projects_creator_profile_idx ON projects (creator_id, profile_status)`,
  `CREATE INDEX IF NOT EXISTS projects_status_published_idx ON projects (moderation_status, published_at)`,
  `CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY NOT NULL,
    creator_id TEXT NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS sessions_creator_idx ON sessions (creator_id)`,
  `CREATE TABLE IF NOT EXISTS oauth_states (
    state_hash TEXT PRIMARY KEY NOT NULL,
    return_to TEXT NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS project_reports (
    id TEXT PRIMARY KEY NOT NULL,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS project_reports_project_idx ON project_reports (project_id, status)`,
  `CREATE TABLE IF NOT EXISTS report_rate_limits (
    fingerprint TEXT PRIMARY KEY NOT NULL,
    window_start TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0
  )`,
];

const projectUpgradeStatements = [
  "ALTER TABLE projects ADD COLUMN repository_url TEXT",
  "ALTER TABLE projects ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'unverified'",
  "ALTER TABLE projects ADD COLUMN profile_status TEXT NOT NULL DEFAULT 'visible'",
  "ALTER TABLE projects ADD COLUMN last_checked_at TEXT",
  "ALTER TABLE projects ADD COLUMN last_check_status TEXT NOT NULL DEFAULT 'unchecked'",
  "ALTER TABLE projects ADD COLUMN consecutive_check_failures INTEGER NOT NULL DEFAULT 0",
];

let initialized = false;
export async function ensureSchema() {
  if (initialized) return;
  const db = database();
  await db.batch(schemaStatements.map((sql) => db.prepare(sql)));
  for (const sql of projectUpgradeStatements) {
    try { await db.prepare(sql).run(); } catch { /* Column already exists. */ }
  }
  initialized = true;
}

function joinedProjectSelect() {
  return `SELECT projects.*, creators.github_handle, creators.display_name, creators.avatar_url, creators.github_profile_url
    FROM projects JOIN creators ON creators.id = projects.creator_id`;
}

export async function listApprovedProjects(limit = 60): Promise<Project[]> {
  await ensureSchema();
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.moderation_status = 'approved'
    ORDER BY projects.published_at DESC LIMIT ?`).bind(limit).all<Project>();
  return result.results;
}

export async function getApprovedProjectBySlug(slug: string): Promise<Project | null> {
  await ensureSchema();
  return await database().prepare(`${joinedProjectSelect()}
    WHERE projects.slug = ? AND projects.moderation_status = 'approved' LIMIT 1`).bind(slug).first<Project>();
}

export async function getCreatorByHandle(handle: string): Promise<Creator | null> {
  await ensureSchema();
  return await database().prepare("SELECT * FROM creators WHERE lower(github_handle) = lower(?) LIMIT 1").bind(handle).first<Creator>();
}

export async function listVisibleProjectsForCreator(creatorId: string): Promise<Project[]> {
  await ensureSchema();
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.creator_id = ? AND projects.profile_status = 'visible'
    ORDER BY projects.created_at DESC`).bind(creatorId).all<Project>();
  return result.results;
}

export async function getCreatorForSession(tokenHash: string): Promise<Creator | null> {
  await ensureSchema();
  return await database().prepare(`SELECT creators.* FROM sessions
    JOIN creators ON creators.id = sessions.creator_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ? LIMIT 1`).bind(tokenHash, new Date().toISOString()).first<Creator>();
}

export async function createOAuthState(stateHash: string, returnTo: string) {
  await ensureSchema();
  const now = new Date();
  const expires = new Date(now.getTime() + 10 * 60 * 1000);
  await database().prepare("INSERT INTO oauth_states (state_hash, return_to, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(stateHash, returnTo, now.toISOString(), expires.toISOString()).run();
}

export async function consumeOAuthState(stateHash: string): Promise<string | null> {
  await ensureSchema();
  const db = database();
  const state = await db.prepare("SELECT return_to FROM oauth_states WHERE state_hash = ? AND expires_at > ? LIMIT 1")
    .bind(stateHash, new Date().toISOString()).first<{ return_to: string }>();
  await db.prepare("DELETE FROM oauth_states WHERE state_hash = ?").bind(stateHash).run();
  return state?.return_to ?? null;
}

export async function upsertCreator(profile: {
  githubId: string;
  githubHandle: string;
  displayName: string;
  avatarUrl: string;
  profileUrl: string;
}): Promise<Creator> {
  await ensureSchema();
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
  await ensureSchema();
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await database().prepare("INSERT INTO sessions (token_hash, creator_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(tokenHash, creatorId, now.toISOString(), expires.toISOString()).run();
}

export async function deleteSession(tokenHash: string) {
  await ensureSchema();
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
  await ensureSchema();
  const id = crypto.randomUUID();
  const slug = await uniqueSlug(input.title);
  const now = new Date().toISOString();
  await database().prepare(`INSERT INTO projects
    (id, creator_id, slug, title, short_description, live_url, repository_url, verification_status, profile_status, moderation_status, thumbnail_status, last_checked_at, last_check_status, consecutive_check_failures, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'visible', 'submitted', 'pending', ?, 'healthy', 0, ?, ?)`)
    .bind(id, input.creatorId, slug, input.title, input.description, input.liveUrl, input.repositoryUrl, input.verificationStatus, now, now, now).run();
  return (await getProjectById(id))!;
}

export async function getProjectById(id: string): Promise<Project | null> {
  await ensureSchema();
  return await database().prepare(`${joinedProjectSelect()} WHERE projects.id = ? LIMIT 1`).bind(id).first<Project>();
}

export async function getOwnedProject(id: string, creatorId: string): Promise<Project | null> {
  await ensureSchema();
  return await database().prepare(`${joinedProjectSelect()} WHERE projects.id = ? AND projects.creator_id = ? LIMIT 1`).bind(id, creatorId).first<Project>();
}

export async function listProjectsForOwner(creatorId: string): Promise<Project[]> {
  await ensureSchema();
  const result = await database().prepare(`${joinedProjectSelect()} WHERE projects.creator_id = ? ORDER BY projects.created_at DESC`)
    .bind(creatorId).all<Project>();
  return result.results;
}

export async function updateOwnedProject(id: string, creatorId: string, input: { title: string; description: string; liveUrl: string; repositoryUrl: string | null; verificationStatus: VerificationStatus }) {
  await ensureSchema();
  const project = await getOwnedProject(id, creatorId);
  if (!project) return false;
  const nextStatus: ModerationStatus = project.moderation_status === "approved" ? "submitted" : project.moderation_status === "unavailable" ? "submitted" : project.moderation_status;
  const now = new Date().toISOString();
  await database().prepare(`UPDATE projects SET title = ?, short_description = ?, live_url = ?, repository_url = ?, verification_status = ?, moderation_status = ?, moderation_note = NULL, last_checked_at = ?, last_check_status = 'healthy', consecutive_check_failures = 0, updated_at = ? WHERE id = ? AND creator_id = ?`)
    .bind(input.title, input.description, input.liveUrl, input.repositoryUrl, input.verificationStatus, nextStatus, now, now, id, creatorId).run();
  return true;
}

export async function withdrawOwnedProject(id: string, creatorId: string) {
  await ensureSchema();
  await database().prepare("UPDATE projects SET profile_status = 'hidden', moderation_status = 'draft', published_at = NULL, updated_at = ? WHERE id = ? AND creator_id = ?")
    .bind(new Date().toISOString(), id, creatorId).run();
}

export async function showOwnedProjectOnProfile(id: string, creatorId: string) {
  await ensureSchema();
  await database().prepare("UPDATE projects SET profile_status = 'visible', updated_at = ? WHERE id = ? AND creator_id = ?")
    .bind(new Date().toISOString(), id, creatorId).run();
}

export async function setThumbnailState(id: string, status: ThumbnailStatus, key: string | null, error: string | null) {
  await ensureSchema();
  await database().prepare("UPDATE projects SET thumbnail_status = ?, thumbnail_storage_key = ?, thumbnail_error = ?, updated_at = ? WHERE id = ?")
    .bind(status, key, error, new Date().toISOString(), id).run();
}

export async function queueThumbnail(id: string) {
  await setThumbnailState(id, "pending", null, null);
}

export async function listProjectsForModeration(): Promise<Project[]> {
  await ensureSchema();
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.moderation_status IN ('submitted', 'approved', 'declined', 'unavailable')
    ORDER BY CASE projects.moderation_status WHEN 'submitted' THEN 0 ELSE 1 END, projects.updated_at DESC`).all<Project>();
  return result.results;
}

export async function listProjectsForHealthCheck(limit = 12): Promise<Project[]> {
  await ensureSchema();
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.moderation_status = 'approved'
      OR (projects.moderation_status = 'unavailable' AND projects.moderation_note LIKE 'Automatic link check:%')
    ORDER BY CASE WHEN projects.last_checked_at IS NULL THEN 0 ELSE 1 END, projects.last_checked_at ASC
    LIMIT ?`).bind(limit).all<Project>();
  return result.results;
}

export async function moderateProject(id: string, action: "approve" | "decline" | "unavailable" | "restore", note: string | null) {
  await ensureSchema();
  const now = new Date().toISOString();
  const status: ModerationStatus = action === "approve" || action === "restore" ? "approved" : action === "decline" ? "declined" : "unavailable";
  const published = status === "approved" ? now : null;
  await database().prepare(`UPDATE projects SET moderation_status = ?, moderation_note = ?, published_at = CASE WHEN ? = 'approved' THEN COALESCE(published_at, ?) ELSE NULL END, updated_at = ? WHERE id = ?`)
    .bind(status, note, status, published, now, id).run();
}

export async function createReport(projectId: string, reason: string, details: string | null) {
  await ensureSchema();
  await database().prepare("INSERT INTO project_reports (id, project_id, reason, details, status, created_at) VALUES (?, ?, ?, ?, 'open', ?)")
    .bind(crypto.randomUUID(), projectId, reason, details, new Date().toISOString()).run();
}

export async function consumeReportAllowance(fingerprint: string, limit = 5) {
  await ensureSchema();
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
  await ensureSchema();
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
  await ensureSchema();
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
  await ensureSchema();
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
