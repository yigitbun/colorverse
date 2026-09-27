# ColorVerse operations

This document is the durable source of truth for hosting and deployment. Keep
opaque IDs and credentials in their existing configuration or secret stores;
do not copy them into this document.

## Live working site

- Sole public ColorVerse URL: <https://colorverse.byigit.dev>
- Production host: Cloudflare Pages
- Cloudflare Pages project: `colorverse`
- Pages origin: <https://colorverse-85o.pages.dev>
- Source repository: <https://github.com/yigitbun/colorverse>
- Production branch: `main`
- Published static directory: `dist/`
- Release trigger: a push to `main` starts the Cloudflare Pages deployment.
  This is presently a public working environment; visitors can see each release.

The public DNS route is a proxied CNAME named `colorverse` pointing to
`colorverse-85o.pages.dev`. Do not point it to `custom-domains.chatgpt.site` or
attach `colorverse.byigit.dev` to a ChatGPT Site.

## Development

- Local URL: `http://127.0.0.1:4174` via `npm run dev`
- Vite hot reload makes local HTML/CSS/JS edits visible without deploying.
- There is no separate online development hostname. Publish approved work to
  `main` and review it at the sole public URL above. Do not create or reattach
  `dev.colorverse.byigit.dev` or start Cloudflare Access for this workflow.
- Membership uses the existing ColorVerse Studio Supabase project. The owner
  approved using it when the free-project cap prevented a second database;
  preserve existing records. Do not treat it as disposable test data.

Account browser settings live in `dist/account-config.js`. Unknown preview
hostnames fail closed rather than silently connecting to the shared backend.
The account page and migration passed anonymous and owner-boundary tests. A
real inbox eight-digit code-delivery/verification and private save/resume test
remain required. Password recovery is not part of the current account flow.

## Local checkpoint and public-repository safety

The repository was verified **PUBLIC** on 2026-09-27. Local commit permission
does not authorize a push: a push to `main` publishes the site automatically.
Do not use a blanket `git add -A` for this workspace. Inspect the diff and stage
only the intended app, tests, schema/template sources and documentation.

Root ignore rules exclude `colorverse-chat-transcript.md`, `backups/`, `.local/`
and `founder-playbook/`, in addition to existing credential/runtime exclusions.
They remain local, not deleted. Check that none are already tracked before
committing; `.gitignore` does not untrack an existing file. A local commit is
neither an off-machine backup nor a release. The private originals and retired
source-photo backup need a separately selected private backup destination.

[Handoff](handoff.md) and [open work](open-work.md) replace the closing chat.
Preserve the rejected/rolled-back decisions as history, not active instructions.
Do not enter Claude/ChatGPT projects to reconstruct history without a new scoped
owner request.

Fresh checkouts should run `npm ci` and `npm run check:release` without private
artifacts. The retired-photo backup integrity test skips when its ignored local
backup is absent; retired-photo exclusion and app checks still run. Sandbox and
home-test live inside `dist/` and are therefore public after a normal release;
`noindex` is not an authentication boundary.

`scripts/test-member-live.mjs` is an administrative test that creates/deletes
temporary users and uses a legacy password probe. Do not run it as an automatic
handoff check or pretend it verifies email-code delivery. Obtain fresh explicit
authority for user-creating/destructive tests, and use the owner's real inbox
for the current OTP journey.

## ChatGPT Sites preview

`.openai/hosting.json` configures a separate, private Sites preview. Its project
ID remains in that file so preview tooling can reuse the same project. This
preview is secondary: it does not own the production domain and its generated
`*.chatgpt.site` address is not the canonical ColorVerse URL.

Sites verification TXT records may still exist in Cloudflare. They do not route
traffic and are not evidence that the domain should be attached to Sites.

## Privacy, analytics, and browser security

- Google Analytics property: `ColorVerse`; web stream URL:
  `https://colorverse.byigit.dev`; measurement ID: `G-TJG8M3VE03`.
- Analytics uses basic consent mode. The Google tag is not requested until the
  visitor explicitly allows analytics. Rejecting analytics leaves all color
  tools available.
- Page views exclude query strings and fragments. Product events are restricted
  to fixed allowlisted values; uploaded images, project names, form text, and
  palette values are not analytics payloads.
- Consent lasts up to 180 days; GA cookies are configured for up to 90 days and
  are removed from the ColorVerse host when consent is withdrawn.
- GA Enhanced Measurement is disabled; ColorVerse sends its own sanitized page
  views and allowlisted product events. GA event data and user data retention
  are both set to two months, with “reset on new user activity” disabled.
- `dist/_headers` is the Cloudflare Pages source for CSP, frame blocking,
  cross-origin isolation, content-type protection, referrer policy, permissions
  policy, and HSTS.
  The production CSP intentionally blocks inline scripts and event handlers;
  `npm run build` rejects either pattern in HTML.
- The public privacy notice lives at `/privacy/`. Keep it synchronized whenever
  storage, analytics, hosting, image delivery, or account behavior changes.
- Nunito Sans is self-hosted under `dist/assets/fonts/` with its OFL license.
  The previous palette, editorial, and edition images have been removed from the
  deployable site. Eight optimized owner-supplied AI study JPEGs now live under
  `dist/assets/studies/`; Explore selects four with visible AI disclosure.
  Display permission is not Library/palette approval. Retired external photos
  remain in ignored local backups, not deployment artifacts. No new image is
  generated or added without owner direction. Production pages must not request
  Google Fonts or third-party image CDNs.
- Supabase powers opt-in private Studio projects. The browser uses only the
  publishable key; never place a secret or service-role key in `dist/`. Project
  tables use explicit grants plus owner-only RLS, and uploaded images remain local.
- Browser-local extraction has no direct write grant to the reserved
  `extraction_runs` table; add a validated RPC before persisting extraction
  history.
- Browser-local image tools accept only JPEG, PNG, and WebP after checking both
  the declared MIME type and binary signature. Files over 20 MB, 25 megapixels,
  or 12,000 pixels on either edge are rejected before browser decoding to limit
  malformed-file and decompression-bomb risk. Keep `scripts/test-image-file.mjs`
  in the release checks whenever upload handling changes.
- Supabase Auth Site URL is `https://colorverse.byigit.dev`; the legacy allowed
  link return URL is `https://colorverse.byigit.dev/studio/`. It is retained
  configuration, not the current entry UX: both new and returning accounts now
  verify an emailed eight-digit token, without requesting a sign-in link.

## Release checklist

1. Run `npm run check:release` (static build plus local regression tests), and
   review the open gates in `docs/mvp-gap-audit.md`. Run `npm audit --audit-level=high`.
2. Run `npm run test:live` to verify the existing production headers, consent-gated GA,
   Supabase catalog counts, and anonymous private-write rejection.
3. Review `git status` and `git diff`; preserve unrelated changes.
4. Commit only the intended files. Push `main` to `origin` only with publishing
   direction; commit-only requests stop before this external action.
5. Confirm the Cloudflare Pages production deployment completed.
6. Run `npm run test:live:release` against `https://colorverse.byigit.dev` to
   verify affected routes, new code-entry assets, current product contracts and
   anonymous boundaries. Verify real email-code consumption, private save/resume
   and narrow-screen navigation separately; an infrastructure pass is not a
   product release or proof of email delivery.
7. For releases touching `_headers`, verify the public response includes CSP,
   `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`, then
   check the browser console for blocked required assets.

For a quick Studio check:

```sh
curl -sS -o /dev/null -w '%{http_code}\n' https://colorverse.byigit.dev/studio/
```

Expected output: `200`.

## Decision record

On 2026-09-23, the owner chose one public working address:
`colorverse.byigit.dev`. The tested membership and site updates were published
through the existing `main` Pages project. The accidental
`dev.colorverse.byigit.dev` custom-domain attachment and its CNAME were removed
after explicit confirmation. Cloudflare Access was not enabled; visitors may
see the current working site. The now-redundant `colorverse-dev` Pages project
was also deleted after separate approval; its deployments and Pages hostname
are not recoverable, but the Git repository and Supabase data are untouched.
Do not restore that extra hostname or project for the current workflow.

On 2026-09-14, the public domain was briefly attached to ChatGPT Sites. That
introduced a ChatGPT sign-in gate on the live product. The attachment was
removed and the Cloudflare Pages CNAME was restored. Keep production on
Cloudflare Pages unless the owner explicitly makes a new hosting decision.
