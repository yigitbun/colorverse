# STUDIO-SHORT-12 — 2–4 authored colors with preview-only support

Owner: Claude Opus 5.5. Codex integrates and owns the follow-on account/Studio
UI handoff. Base and isolated worktree are given in the launch message.

## Product contract

A saved member palette may contain 2–24 real colors. For 2–4 colors, Studio
must preserve exactly those authored colors. The existing five preview surfaces
may use quiet neutral **support colors**, but they are not palette members,
must never be counted, saved, or exported as authored colors, and the UI will
label them as preview-only in a follow-on task. For two members, default the
first to Primary and the second to Accent; neutral support fills Background,
Surface and Text. For three/four, put the remaining authored colors into open
roles deterministically. No unrelated redesign or color generation.

## This bounded engineering slice

Implement only the pure workspace/export contract. Extend
`dist/studio-members.js` to accept 2–4 members with explicit preview-role
provenance (an index for an authored member; a distinct support marker for a
non-authored neutral). Keep existing five and 6–24 behavior, old saved
workspaces and legacy exports compatible. `roleColors` still returns five
colors for existing renderers. Workspace validation must reject corrupt,
duplicate/out-of-range mappings and preserve the 2–4 member count across
JSON round-trip, edits, insert/assignment and rehydration. Support colors
must never be silently promoted to member colors by `withWorkspace`,
`syncRoleColors` or `exportPalette`.

Extend `dist/color.js` exports so raw HEX lists only authored members and
structured exports identify which preview roles are support, without implying
those colors were supplied by the user. For normal five/6–24 palettes,
outputs should remain byte-compatible where practical. No claims about
color science; use fixed universally quiet neutrals for the support roles.

Add focused coverage in the existing `scripts/test-studio-members.mjs` for
2/3/4 input, old 5/10/24 compatibility, persistence round-trip, editing and
export provenance. Call out any existing app-level line requiring a later
follow-up, but do not edit it in this task.

## Ownership / stop

Writable files: `dist/studio-members.js`, `dist/color.js`, and
`scripts/test-studio-members.mjs` only. Do not edit `dist/app.js`, account,
HTML/CSS, DB/Supabase, release docs, other tests, another worktree or main.
Run the focused tests, `npm run check:release`, `git diff --check` and commit
locally if permitted. Report exact revision, checks and compatibility caveats.
Do not push/deploy; stop for Codex review. This slice is not a user-facing
completion until the subsequent handoff/UI task passes.
