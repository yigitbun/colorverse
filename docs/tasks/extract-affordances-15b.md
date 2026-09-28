# EXTRACT-AFFORDANCES-15B — Clear readings and contextual color tools

Owner: Claude Opus 5.5; Codex reviews/integrates. Start after the current
`dist/app.js` writer is integrated. Read AGENTS.md, coordination and this
brief. The Adobe/Coolors screenshots supplied by the owner are references for
what users discover, not UI or icon sets to copy.

## User problem

The existing Extract page has three readings — Observed, Focused, Applied —
but the dropdown gives little reason to change them. The full-height color
rows expose HEX and a native color input; the edit affordance is obscure.
Coolors makes relevant actions visible over a color on hover. We should
surface only actions ColorVerse truly supports, in our quieter style.

## Narrow change

- Add a concise visible explanation beside/below the Reading control that
  updates when Observed/Focused/Applied changes. Explain which colors are
  source-based and which can be derived; do not claim any exact Adobe match,
  scientific optimization or corpus reference. Preserve the existing three
  variants, dropdown and each variant's independent manual edits.
- Give each swatch row a compact contextual action rail: Copy HEX and Edit
  color via the existing native picker. Keep Insert/Remove actions only where
  the current editor already safely allows them; no nonfunctional lock,
  favorite or AI icon. Reuse existing event handlers rather than implement a
  parallel edit path. Icons must have text/ARIA labels and visible focus.
- On hover/focus-within show the tools without hiding the HEX; on touch/coarse
  pointer keep tools visible. Do not require hover for a core action. Ensure
  readable contrast on very light/dark swatches and 320–390px layouts.
- Preserve image point dragging, undo/reset, 5–10 color insert/remove,
  Continue in Studio and privacy behavior. No new upload/network path.

Writable: `dist/app.js`, `dist/extract-workspace.css`,
`dist/extract/index.html` and focused existing Extract tests. No algorithm,
Studio, Account, catalog, corpus, or deployment files. Run focused/full
checks, diff-check, commit locally, report exact revision and untested paths.
