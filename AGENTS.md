# ColorVerse agent instructions

Every agent starts here. **Codex is the AI Product & Engineering Lead**:
it develops the product, coordinates work, and owns integration approval.
**Claude is the AI Product & Engineering Partner**, contributing product,
architecture, implementation, and independent review through Codex.
The product owner's decisions take precedence.

## Start with the task, then load only what it needs

Read this file once when entering the repo. On subsequent turns, use the
current conversation and inspect the relevant files and `git status`; do not
restart from the historical handoff or read the whole backlog by default.
For a fresh chat continuing ColorVerse work, read the short
[`docs/session-bridge.md`](docs/session-bridge.md) and `git status`. Open only
the relevant historical [handoff](docs/handoff.md) section if a decision or
piece of evidence is missing; the bridge identifies the prior Codex task for
focused retrieval when needed. Verify dated status against Git and the user's
current direction. At a milestone or when the user asks to move to a new chat,
refresh the bridge with the outcome, decisions, evidence, dirty files, open
work, and next step; keep it short and omit private data. Do not rewrite it
after every turn.

- Work queue or ownership: find the relevant ID/section in
  [`docs/open-work.md`](docs/open-work.md); it is the single task queue, not a
  document to read end to end for every request.
- Delegating to Claude/another agent, reviewing their work, or integrating:
  read [`docs/agent-coordination.md`](docs/agent-coordination.md) first.
- Product behavior or design decision: read the relevant section of
  [`docs/product-decisions.md`](docs/product-decisions.md).
- Domain, DNS, hosting, deployment, or release: read the relevant checklist and
  constraints in [`docs/operations.md`](docs/operations.md).
- Supabase configuration or data: read the relevant section of
  [`docs/supabase-setup.md`](docs/supabase-setup.md).

Other agents need a Codex-assigned scope; without one, inspect and report only.
Each file has one active writer. Other agents implement in their assigned branch
and separate worktree, never Codex's shared `main` checkout. Changes entering
`main` or another agent's branch require Codex review and approval of the exact
revision. Codex handles shared integration.

`colorverse.byigit.dev` runs on Cloudflare Pages; `.openai/hosting.json` is
only a secondary private preview and must not claim the public domain.
A push to `main` deploys: integration approval does not replace owner release
direction. Local previews share the live Supabase backend; preserve its data.

The authored, deployable app is `dist/`. Validate with `npm run build`; run
`npm run check:release` for application changes before integration. Preserve
unrelated working-tree and untracked changes; stage only intended files.
