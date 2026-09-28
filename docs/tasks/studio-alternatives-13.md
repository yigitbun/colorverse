# STUDIO-ALTERNATIVES-13 — palette-aware alternative ranking

Owner: Claude Opus 5.5; Codex reviews/integrates. Base and isolated branch are
provided in the launch message. This is independent of STUDIO-SHORT-12's
workspace/export files; do not edit them.

## Problem and outcome

`colorAlternatives(hex)` currently sees only the selected HEX. The owner asks
whether the suggested replacement works with the other colors. It currently
cannot answer that. Make the alternatives in Studio **consider the entire
authored palette** while still changing only one selected member. Use existing
candidate generation as a conservative basis; no autonomous palette creation.

## Bounded implementation

- Keep `colorAlternatives(hex)` backward compatible for callers/tests. Add a
  pure palette-aware ranking/selection API in `dist/color-alternatives.js`.
  Input: selected HEX, all authored member HEX values and selected member
  index; never use the five preview-only support roles as if authored.
- Exclude exact duplicates and near-indistinguishable alternatives to another
  member. Prefer modest changes that preserve the selected color's pairwise
  relationships to the remaining members and avoid losing an existing useful
  light/dark separation. Do not label any candidate scientifically optimal,
  guaranteed harmonious, or corpus-derived. Ensure deterministic, bounded
  output and reasonable fallback if fewer than eight pass; a shorter honest
  set is better than duplicate/poor suggestions.
- Wire `renderColorLab` in `dist/app.js` to pass
  `current.workspace.members` and `activeColorIndex`. Keep existing one-click
  replacement and live preview behavior; update the short scope copy to say
  candidates are considered against the other authored colors, but only the
  selected color changes. No changes to shades, quick actions or contrast.
- Extend `scripts/test-color-alternatives.mjs` with a few realistic 2/5/10
  color cases and keep existing neutral/validity tests. Update only directly
  affected existing static assertion(s) in `scripts/test-studio-ux.mjs`.

## Limits / checks

No approved reference corpus exists yet: do not import AI studies, the 100
legacy palettes, Adobe, or unapproved research as reference palettes. No new
scores or marketing claims. Writable files: `dist/color-alternatives.js`,
`dist/app.js`, `scripts/test-color-alternatives.mjs`, and directly affected
`scripts/test-studio-ux.mjs` only. Codex owns cache-pin changes. Run focused
tests, `npm run check:release`, `git diff --check`; commit locally if permitted
and report revision/evidence. No main, account, CSS, corpus, DB or deploy.
