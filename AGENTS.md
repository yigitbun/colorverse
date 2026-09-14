# ColorVerse agent notes

Before changing domains, DNS, hosting, or deployment, read
[`docs/operations.md`](docs/operations.md). It is the source of truth for the
public production route. In particular, `colorverse.byigit.dev` is served by
Cloudflare Pages; the project in `.openai/hosting.json` is only a secondary
private preview and must not claim the public domain.

Use this documentation map instead of expanding this file:

- Product behavior and design direction: [`docs/product-decisions.md`](docs/product-decisions.md)
- Hosting, domains, and releases: [`docs/operations.md`](docs/operations.md)
- Supabase project state: [`docs/supabase-setup.md`](docs/supabase-setup.md)

The deployable static application lives in `dist/`. Validate it with
`npm run build`. Preserve unrelated working-tree and untracked changes, and
stage only the files intended for the current change.
