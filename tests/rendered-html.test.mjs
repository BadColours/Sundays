import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("anonymous gallery uses approved records while creator profiles stay open", async () => {
  const [page, gallery, maker, repository] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PublicGallery.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/maker/[handle]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../db/repository.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /listApprovedProjects\(6\)/);
  assert.match(gallery, /if \(projects\.length === 0\) return null/);
  assert.doesNotMatch(gallery, /OPEN DIRECTORY|Log in|Anyone can create a public maker profile/i);
  assert.match(maker, /listVisibleProjectsForCreator/);
  assert.match(repository, /profile_status = 'visible'/);
  assert.match(repository, /moderation_status = 'approved'/);
  assert.doesNotMatch(page + gallery, /Maya Chen|Theo Hart|001—056|Submit from GitHub/);
});

test("submission page explains identity-only GitHub access", async () => {
  const [page, input] = await Promise.all([
    readFile(new URL("../app/submit/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/project-input.ts", import.meta.url), "utf8"),
  ]);
  assert.match(page, /request no repository access/i);
  assert.match(page, /never ingest or deploy code/i);
  assert.match(page, /Share on profile/);
  assert.doesNotMatch(page, /Submit for review/);
  assert.match(page, /Login unavailable/);
  assert.match(page, /\/api\/auth\/github\/start/);
  assert.match(input, /validatePublicUrl/);
  assert.doesNotMatch(input, /probePublicUrl/);
});

test("dashboard lists public GitHub repositories without private repository access", async () => {
  const [dashboard, thumbnail, github, createRoute, updateRoute] = await Promise.all([
    readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ProjectThumbnail.tsx", import.meta.url), "utf8"),
    readFile(new URL("../lib/github-public.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/projects/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/projects/[id]/route.ts", import.meta.url), "utf8"),
  ]);
  assert.match(dashboard, /Choose what to share/);
  assert.match(dashboard, /Share ↗/);
  assert.match(dashboard, /Add something else/);
  assert.match(dashboard, /PreviewStatusRefresh/);
  assert.match(dashboard, /Preview: capturing/);
  assert.match(dashboard, /Retry preview/);
  assert.match(dashboard, /Submit to Explore/);
  assert.match(updateRoute, /submit_gallery/);
  assert.match(updateRoute, /submitOwnedProjectToGallery/);
  assert.doesNotMatch(dashboard, />Capture preview</);
  assert.match(createRoute, /waitUntil\(captureProjectThumbnail/);
  assert.doesNotMatch(createRoute, /await captureProjectThumbnail/);
  assert.match(updateRoute, /existing\.live_url !== input\.liveUrl/);
  assert.match(updateRoute, /existing\.thumbnail_status !== "ready"/);
  assert.match(updateRoute, /queueThumbnail/);
  assert.doesNotMatch(thumbnail, /iframe|liveFallback/);
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
  for (const state of ["visible", "hidden", "draft", "submitted", "approved", "declined", "unavailable", "pending", "ready", "failed"]) assert.match(schema, new RegExp(state));
  assert.match(oauth, /No scope parameter/);
  assert.doesNotMatch(oauth, /searchParams\.set\("scope"|read:org|repo:status/);
});

test("captured project previews preserve the full app frame", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.project-thumbnail\{[^}]*object-fit:contain[^}]*object-position:center top/);
  assert.doesNotMatch(styles, /\.project-thumbnail\{[^}]*object-fit:cover/);
});

test("the demo has self-contained navigation and no gallery login promotion", async () => {
  const [nav, gallery, demoArchive, demoAbout] = await Promise.all([
    readFile(new URL("../app/SiteNav.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/PublicGallery.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demo/archive/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/demo/about/page.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(nav, /demo \? "\/demo\/archive" : "\/archive"/);
  assert.match(nav, /demo \? "\/demo\/about" : "\/about"/);
  assert.doesNotMatch(gallery, /collection-empty|Log in/);
  assert.match(demoArchive, /\/demo\/maker\//);
  assert.match(demoAbout, /DEMO \/ ABOUT SUNDAYS/);
});

test("demo profile thumbnails contain their app preview", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.profile-thumb\{[^}]*display:block[^}]*overflow:hidden[^}]*position:relative/);
  assert.match(styles, /\.profile-thumb \.app-screen\{[^}]*width:100%[^}]*height:calc\(100% - 26px\)/);
});

test("demo profiles support multiple projects with distinct project routes", async () => {
  const fixture = await readFile(new URL("../app/fixtures/demoGallery.ts", import.meta.url), "utf8");
  const makerPage = await readFile(new URL("../app/demo/maker/[handle]/page.tsx", import.meta.url), "utf8");
  assert.match(fixture, /makerIndexByProject/);
  assert.match(fixture, /projectSlug/);
  assert.match(makerPage, /galleryProjects\.filter/);
  assert.match(makerPage, /projects\.map/);
  assert.match(makerPage, /demo-profile-projects/);
});

test("all image thumbnails use one frameless contain model", async () => {
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(styles, /\.creator-image-frame\{[^}]*border:0!important/);
  assert.match(styles, /\.creator-image-frame\{[^}]*place-items:center[^}]*padding:clamp\(8px,1vw,14px\)!important/);
  assert.match(styles, /\.creator-preview\{[^}]*object-fit:contain/);
  assert.match(styles, /\.profile-projects \.profile-thumb\.creator-image-frame img\{[^}]*object-fit:contain[^}]*transform:none/);
  assert.match(styles, /\.profile-projects \.profile-thumb\.creator-image-frame::after\{content:none/);
});

test("demo thumbnails are normalized before they reach the gallery", async () => {
  const [fixture, styles, normalizer] = await Promise.all([
    readFile(new URL("../app/fixtures/demoGallery.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../scripts/normalize-demo-thumbnails.mjs", import.meta.url), "utf8"),
  ]);
  assert.match(fixture, /\/explore-thumbs\/normalized\//);
  assert.match(styles, /\.creator-image-frame\.demo-normalized-frame\{padding:0!important/);
  assert.match(normalizer, /const canvasSize = 800/);
  assert.match(normalizer, /const safeArea = 52/);
  assert.match(normalizer, /fit: "contain"/);
  assert.doesNotMatch(normalizer, /fit: "cover"/);
});
