# Sundays

Sundays is a curated gallery for personal software made after hours. Creators keep hosting and control of every application; Sundays stores only creator identity, listing metadata, moderation state, and promotional thumbnails.

## Local development

```bash
npm install
npm run dev
```

The project uses Cloudflare D1 (`DB`) and R2 (`THUMBNAILS`) through `.openai/hosting.json`. Runtime routes initialize the checked-in schema when a new local binding is empty. Generate migrations after schema changes with:

```bash
npm run db:generate
```

## GitHub OAuth setup

Create a GitHub OAuth App and set:

- Homepage URL: the deployed Sundays origin
- Authorization callback URL: `https://YOUR-DOMAIN/api/auth/github/callback`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `APP_ORIGIN`

Sundays deliberately omits the OAuth `scope` parameter. GitHub is used only for public creator identity; repository access is never requested. Access and refresh tokens are not retained after the public profile is read.

Set `ADMIN_GITHUB_HANDLES` to a comma-separated allowlist of GitHub handles permitted to use `/admin`.

## Screenshot capture

Sundays uses Webshot's public `desktop_viewport` capture endpoint by default and stores the returned image in its own R2 bucket. The public service is suitable for early testing but rate-limited, so production can override it with `SCREENSHOT_API_URL` and `SCREENSHOT_API_TOKEN`.

For a custom capture provider, Sundays sends an authenticated `POST` with:

```json
{
  "url": "https://creator-owned.example",
  "viewport": { "width": 1440, "height": 1024 },
  "output": { "format": "webp", "quality": 82, "width": 1200, "height": 850 },
  "security": { "blockPrivateNetworks": true, "maxRedirects": 3 }
}
```

The provider must return raw `image/webp`, `image/png`, or `image/jpeg` bytes, enforce private-network blocking independently, and complete within 50 seconds. `SCREENSHOT_API_TOKEN` is sent as a bearer token when present. Capture failures never prevent profile sharing; the dashboard offers a retry.

## Production setup checklist

1. Apply the generated D1 migration.
2. Configure the `DB` and `THUMBNAILS` bindings through Sites.
3. Create the GitHub OAuth App and add the three GitHub/origin variables above.
4. Set the administrator handle allowlist.
5. Optionally configure a higher-volume screenshot service and token.
6. Test sign-in, submission, thumbnail capture/failure, moderation, publication, launch links, and broken-link reports before recruiting creators.

## Validation

```bash
npm run build
npm test
```
