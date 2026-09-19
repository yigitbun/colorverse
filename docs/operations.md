# ColorVerse operations

This document is the durable source of truth for hosting and deployment. Keep
opaque IDs and credentials in their existing configuration or secret stores;
do not copy them into this document.

## Production

- Public URL: <https://colorverse.byigit.dev>
- Production host: Cloudflare Pages
- Cloudflare Pages project: `colorverse`
- Pages origin: <https://colorverse-85o.pages.dev>
- Source repository: <https://github.com/yigitbun/colorverse>
- Production branch: `main`
- Published static directory: `dist/`
- Release trigger: a push to `main` starts the Cloudflare Pages production deployment

The public DNS route is a proxied CNAME named `colorverse` pointing to
`colorverse-85o.pages.dev`. Do not point it to `custom-domains.chatgpt.site` or
attach `colorverse.byigit.dev` to a ChatGPT Site.

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
  content-type protection, referrer policy, permissions policy, and HSTS.
  The production CSP intentionally blocks inline scripts and event handlers;
  `npm run build` rejects either pattern in HTML.
- The public privacy notice lives at `/privacy/`. Keep it synchronized whenever
  storage, analytics, hosting, image delivery, or account behavior changes.
- Nunito Sans is self-hosted under `dist/assets/fonts/` with its OFL license;
  palette reference images are cached under `dist/assets/palette-library/`.
  Production pages must not request Google Fonts or third-party image CDNs.
- Supabase powers opt-in private Studio projects. The browser uses only the
  publishable key; never place a secret or service-role key in `dist/`. Project
  tables use explicit grants plus owner-only RLS, and uploaded images remain local.
- Supabase Auth Site URL is `https://colorverse.byigit.dev`; the allowed magic-link
  return URL is `https://colorverse.byigit.dev/studio/`.

## Release checklist

1. Run `npm run build`.
2. Review `git status` and `git diff`; preserve unrelated changes.
3. Commit only the intended files and push `main` to `origin`.
4. Confirm the Cloudflare Pages production deployment completed.
5. Verify the affected public routes on `https://colorverse.byigit.dev` return
   HTTP 200 and do not show a ChatGPT sign-in screen.
6. For releases touching `_headers`, verify the public response includes CSP,
   `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`, then
   check the browser console for blocked required assets.

For a quick Studio check:

```sh
curl -sS -o /dev/null -w '%{http_code}\n' https://colorverse.byigit.dev/studio/
```

Expected output: `200`.

## Decision record

On 2026-09-14, the public domain was briefly attached to ChatGPT Sites. That
introduced a ChatGPT sign-in gate on the live product. The attachment was
removed and the Cloudflare Pages CNAME was restored. Keep production on
Cloudflare Pages unless the owner explicitly makes a new hosting decision.
