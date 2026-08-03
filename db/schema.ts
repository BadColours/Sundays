import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const creators = sqliteTable("creators", {
  id: text("id").primaryKey(),
  githubId: text("github_id").notNull(),
  githubHandle: text("github_handle").notNull(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  githubProfileUrl: text("github_profile_url").notNull(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => [
  uniqueIndex("creators_github_id_idx").on(table.githubId),
  uniqueIndex("creators_github_handle_idx").on(table.githubHandle),
]);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  creatorId: text("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  shortDescription: text("short_description").notNull(),
  liveUrl: text("live_url").notNull(),
  moderationStatus: text("moderation_status", { enum: ["draft", "submitted", "approved", "declined", "unavailable"] }).notNull().default("submitted"),
  thumbnailStatus: text("thumbnail_status", { enum: ["pending", "ready", "failed"] }).notNull().default("pending"),
  thumbnailStorageKey: text("thumbnail_storage_key"),
  thumbnailError: text("thumbnail_error"),
  moderationNote: text("moderation_note"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  publishedAt: text("published_at"),
}, (table) => [
  uniqueIndex("projects_slug_idx").on(table.slug),
  index("projects_creator_idx").on(table.creatorId),
  index("projects_status_published_idx").on(table.moderationStatus, table.publishedAt),
]);

export const sessions = sqliteTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  creatorId: text("creator_id").notNull().references(() => creators.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
}, (table) => [index("sessions_creator_idx").on(table.creatorId)]);

export const oauthStates = sqliteTable("oauth_states", {
  stateHash: text("state_hash").primaryKey(),
  returnTo: text("return_to").notNull(),
  createdAt: text("created_at").notNull(),
  expiresAt: text("expires_at").notNull(),
});

export const projectReports = sqliteTable("project_reports", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status", { enum: ["open", "reviewed", "dismissed"] }).notNull().default("open"),
  createdAt: text("created_at").notNull(),
}, (table) => [index("project_reports_project_idx").on(table.projectId, table.status)]);
