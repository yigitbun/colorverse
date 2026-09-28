# STUDIO-SHORT-14B — Studio handoff, project and member-palette persistence

Owner: Claude Opus 5.5; Codex reviews/integrates. Base/worktree in launch
message. STUDIO-SHORT-12's model is on main. The Account-side 14A is a separate
writer. This is the Studio data path, not the UI polish.

## User promise

Opening a 2–4 authored-color palette in Studio must retain that authored
count. Any extra neutral tones are preview support only. A reload, Save
project/resume and Save palette round-trip must never turn support into member
colors. Five and larger member palettes must behave as before.

## Implementation boundary

- `dist/app.js`: accept the existing `?saved=1` handoff with 2–4 colors and
  no roleIndex; keep the 6–24 path requiring the user's five-choice map.
  Persist the complete short workspace whenever a project snapshot or
  sessionStorage working draft is written. Restore it beside its five preview
  role colors. Preserve safety checks for malformed drafts/snapshots.
- `dist/project-store.js`: when saving a 2–4 or 6–24 *member* palette from
  Studio, send the authored `workspace.members` through the existing
  `save_member_palette` RPC; use the historical five-color RPC only for exactly
  five actual members. Do not write/support-count neutrals as member colors.
- Add focused tests to existing `scripts/test-studio-integration.mjs` and,
  if needed, `scripts/test-release-readiness.mjs`. The Account-side agent owns
  `scripts/test-studio-members.mjs` and `scripts/test-member-palettes.mjs`;
  do not edit them.
  Show 2/3/4/5/8 handoff, project snapshot, reload and collection save
  branches. Static contract checks are useful; do not claim hosted Supabase
  round-trip without real authorized browser evidence.

Writable files: `dist/app.js`, `dist/project-store.js`,
`scripts/test-studio-integration.mjs` and, if directly affected,
`scripts/test-release-readiness.mjs`.
No Account (14A owner), model/export, HTML/CSS, Supabase migration/RPC,
corpus, push/deploy. Codex owns asset pins. Run focused tests,
`npm run check:release`, `git diff --check`; commit locally if permitted,
report exact revision and any path not browser-tested, then stop.
