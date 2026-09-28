# HOME-GLOBE-SEED-09 — open homepage with one globe color selected

Owner/writer: Claude Code, model `claude-opus-5-5`. Codex coordinates, reviews,
and integrates. Prepared from clean main `a88e435`; implementation base is the
assignment commit containing this brief. Branch `codex/claude-home-globe-seed`,
separate worktree `.local/worktrees/claude-home-globe-seed`. Status: prepared;
do not claim Claude started until its actual session begins.

## Owner decision

On opening the homepage, one color from the active globe world should already
be selected on the globe and shown in Mini Studio. This supersedes only the
previous rejection of *seeded startup*. Do not restore the rejected full
instrument trial, automatic step advance, transactional Apply, or reverse globe
coupling. Keep the compact six-world menu and existing controls.

## Bounded engineering task

- Use the currently active world, respecting a valid saved `colorverse-world`;
  otherwise use the existing default world. The seed must be an actual visible
  globe cell and its exact generated HEX, not an unrelated starter-palette HEX.
- Show a single selection immediately: globe indicator, Selected readout,
  `1 / 5`, Mini Studio swatch/editor and normal suggestions. No entry toast or
  `palette_started` event solely for this automatic seed.
- Preserve deliberate actions: clicking the seeded cell can deselect it; Clear
  empties it and does not instantly reseed; user color choice, editing, world
  switching, palette completion and Studio handoff behave as before. Do not
  overwrite stored world or Studio drafts. Avoid an initialization race with
  globe rendering/animation and mobile/reduced-motion behavior.
- Keep the chosen cell visible at startup as the globe rotates; a brief initial
  pause or deterministic front-facing cell is acceptable. No new content,
  visuals, dependency, or unrelated redesign.

Writable implementation scope: `dist/app.js`, `dist/globe.js`, the existing
`dist/index.html` script cache pin if changed, and directly affected existing
`scripts/test-*.mjs`. Ask Codex before expanding scope. Do not write main
checkout or shared docs. No hosted data, account flows, push, or deployment.

Acceptance: targeted behavioral regression for startup selection and clear;
`npm run check:release`; `git diff --check`. Report exact base/final revision,
changed files, checks and anything not run. Make one local task-branch commit,
then stop for Codex review. Browser QA can be performed by Codex on an isolated
origin; do not claim it if Claude only ran static tests.
