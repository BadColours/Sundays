import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("anonymous gallery uses approved records while creator profiles stay open", async () => {
  const [page, gallery] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PublicGallery.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /listApprovedProjects\(6\)/);
  assert.match(gallery, /OPEN DIRECTORY/);
  assert.match(gallery, /Anyone can create a public maker profile/i);
  assert.match(gallery, /Log in/);
  assert.doesNotMatch(page + gallery, /Maya Chen|Theo Hart|001—056|Submit from GitHub/);
});

test("submission page explains identity-only GitHub access", async () => {
  const page = await readFile(new URL("../app/submit/page.tsx", import.meta.url), "utf8");
  assert.match(page, /request no repository access/i);
  assert.match(page, /never ingest or deploy code/i);
  assert.match(page, /Login unavailable/);
  assert.match(page, /\/api\/auth\/github\/start/);
});

test("dashboard lists public GitHub repositories without private repository access", async () => {
  const [dashboard, github] = await Promise.all([
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/github-public.ts", import.meta.url), "utf8"),
  ]);
  assert.match(dashboard, /Choose what to share/);
  assert.match(dashboard, /Share ↗/);
  assert.match(dashboard, /Add something else/);
  assert.match(github, /api\.github\.com\/users/);
  assert.match(github, /type.*owner/);
  assert.doesNotMatch(github, /GITHUB_CLIENT_SECRET|\/user\/repos|scope|private/i);
});

test("schema and hosting contract include D1, R2, moderation, and thumbnail states", async () => {
  const [schema, hosting, oauth] = await Promise.all([
    readFile(new URL("../db/schema.ts", import.meta.url), "utf8"),
    readFile(new URL("../.openai/hosting.json", import.meta.url), "utf8"),
    readFile(new URL("../app/api/auth/github/start/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(hosting, /"d1": "DB"/);
  assert.match(hosting, /"r2": "THUMBNAILS"/);
  for (const state of ["draft", "submitted", "approved", "declined", "unavailable", "pending", "ready", "failed"]) assert.match(schema, new RegExp(state));
  assert.match(oauth, /No scope parameter/);
  assert.doesNotMatch(oauth, /searchParams\.set\("scope"|read:org|repo:status/);
});
