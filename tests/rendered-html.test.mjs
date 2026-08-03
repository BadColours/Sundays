import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("anonymous gallery uses approved database records and an honest cold-start state", async () => {
  const [page, gallery] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PublicGallery.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(page, /listApprovedProjects\(6\)/);
  assert.match(gallery, /EARLY COLLECTION/);
  assert.match(gallery, /first Sundays are still being collected/i);
  assert.match(gallery, /Submit a project/);
  assert.doesNotMatch(page + gallery, /Maya Chen|Theo Hart|001—056|Submit from GitHub/);
});

test("submission page explains identity-only GitHub access", async () => {
  const page = await readFile(new URL("../app/submit/page.tsx", import.meta.url), "utf8");
  assert.match(page, /request no repository access/i);
  assert.match(page, /never ingest or deploy code/i);
  assert.match(page, /GitHub setup required/);
  assert.match(page, /\/api\/auth\/github\/start/);
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
