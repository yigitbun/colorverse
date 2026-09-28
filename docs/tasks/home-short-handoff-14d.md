# HOME-SHORT-14D — Globe selections open with their authored count

Owner: Claude Opus 5.5; Codex reviews/integrates. Read AGENTS.md,
docs/agent-coordination.md, this brief and the existing STUDIO-SHORT-12/14B
contracts before editing. Writable: `dist/app.js` plus focused existing
homepage/Studio handoff tests. No HTML/CSS/model/Account/project store changes.

## Gap

Studio now understands 2–4 authored members and fixed preview-only support.
But homepage `buildAtlasPalette()` still passes the five colors produced by
`miniStudioColors()` as if all were chosen. A user who explicitly selected two
globe colors therefore reaches Studio with five authored colors. This violates
the owner's “two should start as two” promise.

## Acceptance

- Keep the homepage's suggested swatch display and ability to accept them.
  When 2–4 colors have actually been selected, `buildAtlasPalette()` hands
  Studio a valid short workspace with exactly those selected HEX values as
  `members` and fixed neutral preview support only in role slots. The
  persisted five role colors may accompany that workspace for compatibility.
- One selected color may retain the existing completion behavior until the
  product defines a one-color workspace, but its copy must be honest. Five
  explicit selections stay the historic five-member path. Clear/reselect,
  editing, `openMiniStudio`, `useAtlasPalette`, reload and browser storage
  failure should preserve existing behavior.
- Do not call generated suggested tones “your colors” or export them as
  authored members. Test one/two/three/four/five globe selections and
  read-only round-trip through `withWorkspace`/`savePaletteHandoff`.

Run focused/full tests and diff-check, commit locally if permitted, report
exact revision. No push/deploy.
