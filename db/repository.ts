import { env } from "cloudflare:workers";

export type ModerationStatus = "draft" | "submitted" | "approved" | "declined" | "unavailable";
export type ThumbnailStatus = "pending" | "ready" | "failed";

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
  moderation_status: ModerationStatus;
  thumbnail_status: ThumbnailStatus;
  thumbnail_storage_key: string | null;
  thumbnail_error: string | null;
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  github_handle?: string;
  display_name?: string;
  avatar_url?: string;
  github_profile_url?: string;
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
    moderation_status TEXT NOT NULL DEFAULT 'submitted',
    thumbnail_status TEXT NOT NULL DEFAULT 'pending',
    thumbnail_storage_key TEXT,
    thumbnail_error TEXT,
    moderation_note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS projects_slug_idx ON projects (slug)`,
  `CREATE INDEX IF NOT EXISTS projects_creator_idx ON projects (creator_id)`,
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
];

let initialized = false;
export async function ensureSchema() {
  if (initialized) return;
  const db = database();
  await db.batch(schemaStatements.map((sql) => db.prepare(sql)));
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

export async function listPublishedProjectsForCreator(creatorId: string): Promise<Project[]> {
  await ensureSchema();
  const result = await database().prepare(`${joinedProjectSelect()}
    WHERE projects.creator_id = ? AND projects.moderation_status = 'approved'
    ORDER BY projects.published_at DESC`).bind(creatorId).all<Project>();
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

export async function createProject(input: { creatorId: string; title: string; description: string; liveUrl: string }): Promise<Project> {
  await ensureSchema();
  const id = crypto.randomUUID();
  const slug = await uniqueSlug(input.title);
  const now = new Date().toISOString();
  await database().prepare(`INSERT INTO projects
    (id, creator_id, slug, title, short_description, live_url, moderation_status, thumbnail_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'submitted', 'pending', ?, ?)`)
    .bind(id, input.creatorId, slug, input.title, input.description, input.liveUrl, now, now).run();
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

export async function updateOwnedProject(id: string, creatorId: string, input: { title: string; description: string; liveUrl: string }) {
  await ensureSchema();
  const project = await getOwnedProject(id, creatorId);
  if (!project) return false;
  const nextStatus: ModerationStatus = project.moderation_status === "approved" ? "submitted" : project.moderation_status === "unavailable" ? "submitted" : project.moderation_status;
  await database().prepare(`UPDATE projects SET title = ?, short_description = ?, live_url = ?, moderation_status = ?, moderation_note = NULL, updated_at = ? WHERE id = ? AND creator_id = ?`)
    .bind(input.title, input.description, input.liveUrl, nextStatus, new Date().toISOString(), id, creatorId).run();
  return true;
}

export async function withdrawOwnedProject(id: string, creatorId: string) {
  await ensureSchema();
  await database().prepare("UPDATE projects SET moderation_status = 'draft', published_at = NULL, updated_at = ? WHERE id = ? AND creator_id = ?")
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
