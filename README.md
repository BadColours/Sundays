# Sundays gallery — local partner review

This is an isolated review copy of the Sundays product at Git revision `37359b0` (the last Sundays-only revision). The parent workspace contains other projects and unrelated uncommitted work. Do not deploy or replace it from the parent directory.

The local review was completed before publication. The user subsequently requested upload of the reviewed version to the existing public Sundays gallery.

## Review locally

- Gallery: http://localhost:3007/
- Populated demo: http://localhost:3007/demo
- Fictional creator dashboard: http://localhost:3008/dashboard

The normal routes use local D1 records. `/demo` always uses explicitly fictional fixtures, in both development and production. Sample records are labeled “local sample”; they are not copies of production users or records.

The creator preview on port 3008 is a separate loopback-only development proxy. It uses an expiring session for a fictional creator in the local database. It is not a login bypass in application code and is not included in the Worker build. It exists so a reviewer can exercise forms without a production GitHub account. Sign out revokes the sample session server-side. To resume creator review after signing out, reseed and restart the proxy.

## Run from this directory

Validated here with Node 25.9.0 and npm. Tests require native TypeScript stripping and `module.registerHooks`; keep the existing dependency lockfile. This workspace currently reuses its installed dependencies through a `node_modules` symlink; in a standalone checkout use `npm ci`.

```sh
npm run db:local
npm run dev -- --host 127.0.0.1 --port 3007
```

For fictional creator review, in separate terminals:

```sh
npm run review:seed
npm run review:creator
```

Seed once, then start the proxy. Reseeding rotates the sample session, so restart the proxy afterward. The sample session expires after 24 hours. These scripts explicitly use local D1/R2 and do not accept a remote flag.

The ignored `.dev.vars` in this review points thumbnail capture at a deliberately unavailable local endpoint to exercise failure/retry handling without sending projects to a third-party service. Existing sample artwork is stored in local R2. Live capture still requires a staging integration check.

## Validation

```sh
npm run typecheck
npm test
npm run lint
npm run build
node scripts/check-local.mjs
```

The HTTP checks require the development server and seeded local fixtures. They modify only sample records and submit sample reports. The pure tests execute the real repository SQL against an isolated SQLite database and the original migration chain. Lint has no errors; eight existing-pattern image warnings remain because supplied artwork and R2 images are deliberately rendered directly, without requiring a hosted image optimizer.

See [AUDIT.md](AUDIT.md) for the product changes, evidence, and release caveats.

## Deployment contract

The only intended Site is `appgprj_6a6a635771fc8191af1955b18bd07801`, the Sundays gallery at `https://offhours-gallery.badcolours.chatgpt.site`. Its logical bindings remain `DB` and `THUMBNAILS`.

`npm run build` emits `dist/server/index.js` with a default `fetch` handler, public assets under `dist/client`, and hosting/migration metadata under `dist/.openai`. The Sites platform supplies production D1 and R2 resources. Placeholder database IDs and `site-creator-r2` in local Wrangler configuration are local bindings, not production resource IDs.

The three existing Drizzle migration files and snapshots are unchanged. Schema initialization no longer performs DDL in requests; deploy the recorded migration chain before starting a new database. Check existing production migration bookkeeping before a later deployment because older Sundays code also performed runtime schema changes.

Configure GitHub credentials, `APP_ORIGIN`, admin allowlist, and any custom screenshot provider only through hosted runtime settings. `.env.example` lists the keys; never package `.dev.vars`, `.wrangler`, the review proxy, or session files. A custom screenshot provider must enforce private-network isolation for its browser, including redirects and subresources. Sundays' URL checks do not replace isolation inside that third-party browser.

Publish from this isolated directory to the existing Sundays Site after local review. Keep its established audience and runtime configuration.
