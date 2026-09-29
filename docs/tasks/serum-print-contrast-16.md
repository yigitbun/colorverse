# STU-16 — readable Katre label print in Skincare preview

Owner: Claude assigned; call stalled before any file edit. Codex fallback implementation. Status: locally integrated; not published.
Branch `codex/claude-serum-print-contrast-16`, reuse clean
`.local/worktrees/claude-studio-card-globe-13` from Codex assignment commit.

## Owner request and decision

The owner sees the Katre brand/label lettering disappear when Product →
Skincare's Color 1 label is light and the print color is too similar. The owner
explicitly authorizes automatic contrast in the preview and says it may be
reverted if the result looks wrong. Explain the behavior in plain UI language:
“Label text adjusted for readability” or similar, not technical “print
contrast”. Do not add a new block or large control.

The approved serum maps Label→assigned color (normally Color 1) and printed
glyphs→Text (role 5), with preserved palette HEX/order and comparison data.
This task may derive a **preview-only** readable print tone from the authored
Text color when its contrast against the *actual assigned label color* is too
low. No authored color, role assignment, saved project, palette export, source
image, or renderer mask changes. If contrast is already sufficient, preserve
exact existing output, especially default Citrus Muse source identity. The
same rule must apply to the live preview, frozen comparison and PNG export.
Do not imply this is a physical print proof or whole-product accessibility
guarantee.

## Scope / acceptance

- Add a pure, testable resolver to the Katre serum profile. Nominal flat-color
  target: at least 4.5:1 for the effective text/label pair. Prefer a dark/light
  version of the selected Text color retaining its hue, with smallest useful
  lightness change; if necessary use a readable neutral. Use the real label
  assignment, not hard-coded Color 1. Return whether adjustment occurred.
- Apply only to actual printed glyph pixels (existing ink surface) in
  `renderSerumColorway`; all other assigned surfaces, background, clear glass,
  image geometry and source masks remain unchanged. Keep exact-source identity
  for default colors. Render/canvas/export must use the same effective pixels.
- A brief visible note close to the Skincare photo appears **only when** the
  current preview's label text is adjusted; comparison baseline may separately
  need the note if it is adjusted. Wording must not claim the saved Text HEX was
  changed. Avoid adding new prominent blocks, controls or modal UI.
- Unit tests for light/light, dark/dark, adequate-contrast pass-through,
  nondefault label assignment, palette/input immutability and source identity.
  Browser QA: edit palette in isolated local Studio and verify note + visible
  text, Undo/comparison, no outside-mask changes or console errors. Keep remote
  account/analytics requests blocked.

## Allowed files

- `dist/katre-serum.js` resolver and renderer ink target only.
- `dist/app.js` Skincare preview/caption wiring only. Main's unrelated dirty
  homepage zoom must not be copied or modified.
- `dist/studio/index.html` cache pins only if needed; focused photo CSS only
  if the unobtrusive note needs it.
- Focused serum/Studio tests under `scripts/`; this brief for delivery facts.

No source image, mask polygons, `dist/photo-colorway.js`, schema, Supabase,
hosted data, shared docs, package manifest, main checkout or deployment. Build,
focused tests, browser checks and `npm run check:release`; report exact
PASS/FAIL/NOT RUN, base/final SHA, changed files and limitations. Commit only
assigned files; no push.

## Codex fallback delivery (2026-09-29)

Claude produced no file change and was stopped after a prolonged idle call.
Codex implemented the scoped correction on main in `54e66bc`. The resolver
keeps a sufficiently contrasting Text role exact; otherwise it searches the
closest readable lighter/darker tone of that color (flat-role threshold 4.5:1,
5.5:1 target for thin photo lettering). Only existing glyph-mask pixels use
the derived tone. The default v3 image remains byte-identical. The existing
photo caption adds “Label text adjusted for readability” only when the current
or comparison image needs it; saved colors and export inputs are unchanged.

PASS: build 113 static files; release 235/235; focused serum 9/9; local-only
browser smoke/card/shuffle 9/9. Isolated browser with off-origin requests
blocked: light/light and dark/dark Katre images visually reviewed, caption
correct, console errors none. Frozen comparison canvas stayed byte-identical
after changing current Text color; its separate note remained. Actual device
PNG download and hosted/private project save NOT RUN. No push/deployment.
