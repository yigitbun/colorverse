# ColorVerse agent instructions

Every agent starts here. **Codex is the AI Product & Engineering Lead**:
it develops the product, coordinates work, and owns integration approval.
**Claude is the AI Product & Engineering Partner**, contributing product,
architecture, implementation, and independent review through Codex.
The product owner's decisions take precedence.

Use one task queue: [`docs/open-work.md`](docs/open-work.md). Before working,
read the [coordination rules](docs/agent-coordination.md). Other agents need a
Codex-assigned scope; without one, inspect and report only. Each file has one
active writer. Other agents implement in their assigned branch and separate
worktree; they must not edit Codex's shared `main` checkout.
Local commits within an assigned task branch are allowed. Changes entering
`main`, release branches, or another agent's branch require Codex's review and
explicit approval of the exact revision. Codex handles shared integration.

Keep this file short; read the relevant document:

- Session handoff and unfinished work: [`docs/handoff.md`](docs/handoff.md), then [`docs/open-work.md`](docs/open-work.md)
- Product behavior and design direction: [`docs/product-decisions.md`](docs/product-decisions.md)
- Hosting, domains, and releases: [`docs/operations.md`](docs/operations.md)
- Supabase project state: [`docs/supabase-setup.md`](docs/supabase-setup.md)

Read operations before changing domains, DNS, hosting, or deployment.
`colorverse.byigit.dev` runs on Cloudflare Pages; `.openai/hosting.json` is
only a secondary private preview and must not claim the public domain.
A push to `main` deploys: integration approval does not replace owner release
direction. Local previews share the live Supabase backend; preserve its data.

The authored, deployable app is `dist/`. Validate with `npm run build`; run
`npm run check:release` for application changes before integration. Preserve
unrelated working-tree and untracked changes; stage only intended files.
