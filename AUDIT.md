# Sundays product review — September 7, 2026

## Scope and provenance

Reviewed the published homepage and `/demo`, live Explore, Archive, About, login, submission entry, dashboard entry, and demo creator profile in the browser. Inspected all Sundays application routes, the SQL repository and original migrations, authentication, capture/storage, report/moderation code, and build/hosting configuration.

The parent checkout currently contains a Freedom Atlas homepage, a Schoolwise package/hosting identity, and uncommitted work. The last Sundays-only source revision is `37359b0` (saved Sundays version 36). The latest saved Sundays version metadata points at a later Schoolwise revision (`dd48a32`), while the live pages observed still render Sundays. A saved version number alone is not evidence that its artifact matches this product. This review is based on the intact Sundays source and uses its verified Site ID; nothing in the parent checkout was overwritten.

## Fixed product problems

| Area | Before | Local upgrade |
| --- | --- | --- |
| Mobile navigation | Login/account actions disappeared below 620px; all account buttons disappeared below 520px. | Account access remains visible, with a second navigation row and usable touch targets. Active routes expose `aria-current`. |
| Gallery/data | Development silently showed fictional fixtures on live routes; database errors became empty collections. | Live and demo routes have consistent behavior in every environment. Empty collections explain their state; service errors offer recovery. |
| Project discovery | Project titles and previews both opened the external app, making the existing details/report page hard to discover. | Titles open Sundays project details; previews retain direct creator-site launch. |
| Archive | Mismatched column counts put arrows on separate rows. Creator and date vanished on mobile. | Explicit responsive columns retain creator, date/category, thumbnail, title, and launch action. |
| About | Only the headline explained the product. | Headline retained; concise text explains creator ownership, public profiles, separate gallery selection, and GitHub access. |
| Login | Bare button, invisible/unexplained unavailable state, inconsistent return destination. | Context, accessible unavailable/error states, and validated return paths. Dashboard entry routes through the same login page. |
| Dashboard | Up to 100 repositories preceded existing work; small labels and unclear hide/edit effects. | Shared projects come first, labels are readable, and hiding/review effects are explicit. Repository fetches time out independently. |
| Submission/editing | A server validation error redirected away and discarded entered fields. | Enhanced forms retain entries, focus errors, prevent duplicate in-flight submissions, and show pending feedback. |
| Creator profiles | Oversized fixed hero spacing, narrow name columns, and broken avatars. | Responsive identity block, wrapping long names, preserved project frames, and avatar fallback. |
| Demo | Explore omitted featured work; Archive omitted most of the catalogue; controls used incomplete tab semantics. | All 56 examples are reachable from both indexes. Category buttons have pressed states and result announcements; pagination and shuffle work. |
| Demo detail | Static screenshots appeared as if they were working apps, without project or maker context. | Explicit static-concept label, title, maker link, and demo return link. |
| Thumbnails | Grid sizing could create large blank image areas; source-specific crops cut artwork; broken image URLs had no fallback. | Bounded tracks, centered contain-fit images, no source-specific cropping, readable missing-preview states. Source artwork is unchanged. |
| Capture lifecycle | Unbounded response bodies, any `image/*` accepted, body read outside timeout, old jobs overwrote newer edits. | Bounded streamed PNG/JPEG/WebP ingestion, signature checks, full-fetch timeout, guarded completion, and stale-result disposal. Retry keeps a usable existing preview when the URL has not changed. |
| Link health | New and edited URLs were labeled healthy without being checked; screenshot success marked links healthy. | New/edited links remain unchecked. Only the actual link checker establishes health. |
| Verification | A typed GitHub owner name alone earned a “Verified maker” badge. | New verification requires a public GitHub repository response. UI says “Repository matched” and explicitly does not certify the live site. |
| Errors | Missing pages used generic framework output; outages could look like missing creators. | Sundays-styled 404/recovery pages, separate demo recovery, and service errors distinct from missing records. |

## Security and implementation

- All write routes reject cross-origin or missing-origin requests before data access. Form bodies are bounded even without a Content-Length header.
- Project ownership is checked before every owner action, including hide/show; unknown IDs no longer return false success.
- Public galleries require both approval and profile visibility. Moderation-unavailable projects do not remain visible on creator profiles. A stale admin approval cannot republish a hidden project.
- OAuth state is consumed with one atomic SQL statement. Provider requests have timeouts and callback exceptions return to sign-in. Sessions remain server-side, hashed, expiring, HttpOnly, and SameSite=Lax.
- URL guards cover canonicalized/obfuscated loopback, mapped IPv6, shared/reserved networks, credentials, and non-web ports. Link probes check DNS and every redirect. DNS preflight remains a defense layer, not a guarantee against DNS rebinding between validation and fetch.
- Thumbnail serving restricts storage keys and content types. Worker responses add MIME, referrer, permission, and form/base/object CSP protections; account/API responses are not publicly cacheable.
- Removed request-time schema creation/alteration. The original migration files and metadata are preserved unchanged.
- Added keyboard skip navigation, readable form/status text, visible focus, truthful filter semantics, announced save/results/report states, and reduced-motion behavior. Creator artwork retains its own visual language; miniature UI inside preview artwork is not treated as interactive Sundays controls.

## Validation evidence

- TypeScript check: passed.
- 14 behavior/security/data-integrity tests: passed.
- 132 HTTP/flow checks: passed, covering 112 public routes, all 56 demo project routes and every demo creator, live/demo navigation boundaries, missing routes, local authenticated dashboard, unauthorized writes, hide/show visibility, R2 serving, validation failures, and report feedback.
- Production Worker build: passed; default `fetch` export, public assets, and hosting/migrations are present. Seven compiled-Worker routes, authenticated local rendering, D1/R2, private caching, security response headers, and server-side sign-out were also tested. Local credentials, QA records, and the review proxy are absent from the build.
- Lint: no errors; eight direct-image warnings, intentionally retained for source artwork and R2 previews.
- Browser checks: desktop at 1280px; mobile at 390px; 320px overflow sweep across 14 key routes; 768px tablet reflow checks. No page-level horizontal overflow found. Visually reviewed gallery, Explore, Archive, About, login, submission error, dashboard, creator profiles, project detail/report, static demo detail, and 404 states. A separate compiled instance with an unavailable database rendered the recovery screen; retry and fallback demo navigation were exercised.
- Browser interaction: category filtering, pagination, shuffle, multiple-project maker links, private-URL rejection retaining all entered fields, successful local submission, successful edit, and public profile visibility verified.

## Release caveats and decisions

1. This audit records the completed local review. At that stage no source commit, push, saved hosted version, deployment, access change, production record mutation, or real-account sign-in was performed. The user subsequently requested publication of the reviewed version to the existing public Sundays Site.
2. The published runtime has GitHub credentials, an application origin, and an admin allowlist configured. Their secret values were not copied into this checkout. Complete a staging OAuth round trip and verify cookie/sign-out behavior against the intended origin before release.
3. The live configuration currently relies on the implicit Webshot default. Local capture failure/retry and R2 serving are tested; the external provider's availability, current contract, network isolation, and successful capture need a staging check. Local sample thumbnails use existing supplied artwork.
4. Old “verified” database records were not rewritten. A later backfill/recheck should validate those public repository links before treating the historical flag as evidence of a fetch-confirmed match.
5. Demo people, titles, and images are illustrative. Some supplied screenshots contain different in-image product names than fixture titles (notably Shortcut/Studio Walter). Assets were preserved rather than inventing new creator identities or replacing their aesthetics. Before sending the demo as evidence of real partners, replace fixtures with permissioned real creator records or explicitly present it as a fictional concept gallery.
6. No WCAG certification or screen-reader audit is claimed. Keyboard semantics, focus, reflow, reduced motion, and visual contrast/readability were reviewed; deeper assistive-technology testing remains a release check.
7. The SQL gallery query still uses the existing 60-record collection limit and GitHub repository picker uses the existing 100-record page. Current production volume does not hit these limits; add real pagination when actual catalogue size requires it.
