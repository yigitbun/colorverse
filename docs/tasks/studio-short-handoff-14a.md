# STUDIO-SHORT-14A — saved 2–4 color palette opens in Studio

Owner: Claude Opus 5.5; Codex reviews/integrates. Base and worktree are in the
launch message. STUDIO-SHORT-12's pure model is already on main. This task is
only the Account-side handoff; the Studio rendering/persistence task follows.

## Outcome

A member can save 2–24 authored colors, but Account currently disables Open
in Studio under five. Enable it for 2–4 and send **only the authored colors**
through the existing sessionStorage handoff. For 2–4, skip the five-choice
picker: Studio's `workspaceFromColors` will make the deterministic preview
mapping with neutral preview-only support. For exactly five, keep identity;
for 6–24, keep the explicit five-choice picker and every source member.

Ensure no support tone is written into the saved member palette or handoff
payload. Preserve invalid-data and storage-failure messages. Do not send auth
requests in tests. Replace stale UI/test language claiming five is required.

Writable files: `dist/account.js`, and directly affected existing
`scripts/test-member-palettes.mjs`, `scripts/test-studio-members.mjs`,
`scripts/test-auth-layout.mjs` only. No `dist/app.js`, Studio HTML/CSS, shared
model/export, Supabase/schema, corpus, deployment or push. Codex owns any
asset cache pin. Run focused tests, `npm run check:release`, `git diff --check`,
make one local commit if permitted; report revision and real checks, then stop.
This slice alone is not user-facing completion until Studio-side 14B lands.
