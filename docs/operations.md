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

## Release checklist

1. Run `npm run build`.
2. Review `git status` and `git diff`; preserve unrelated changes.
3. Commit only the intended files and push `main` to `origin`.
4. Confirm the Cloudflare Pages production deployment completed.
5. Verify the affected public routes on `https://colorverse.byigit.dev` return
   HTTP 200 and do not show a ChatGPT sign-in screen.

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
