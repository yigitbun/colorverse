# STU-10 — add a palette color from Studio rail

Owner: Claude implementation; Codex review/integration. Status: assigned.
Branch `codex/claude-studio-add-color-10`, worktree
`.local/worktrees/claude-studio-add-color-10`; base is Codex's local main
assignment commit supplied before work starts.

## User outcome

Add a visually distinctive, restrained plus control directly below the Studio
Color 1–5 rail (below the rail at every width). It should let a user choose a
new color and add it as Color 6, then Color 7 etc. Make this a real palette
member, not just a color-tray item or preview-only swatch.

## Product behavior

- Plus opens a compact, accessible inline choice with native color input and
  exact HEX entry; add is explicit, cancel/escape does not change the palette.
  A sensible suggested initial color may be prefilled, but it must be editable
  before commit and the preview swatch must reflect the valid choice.
- On confirmation use existing `insertMember`/`commitWorkspace` with append
  position, then select the new member and show it in the existing right-side
  Edit color panel. The five preview roles remain attached to Color 1–5 when
  adding Color 6; later 6–24 additions also preserve preview mapping. For
  short palettes, the existing model's support-slot behavior remains intact.
- Enforce the existing 24-member maximum. The plus is still clearly discoverable
  in desktop rail and below the horizontally scrolling mobile rail; it does not
  become a drag target or interfere with grip drag. Collapsed state should not
  expose a broken form.
- Preserve existing save/reload, export, color tray, drag, keyboard selection,
  and all unrelated homepage behavior. No hosted writes or publication.

## Allowed files

- `dist/app.js` Studio palette/add flow only (main has unrelated dirty home zoom).
- `dist/studio/index.html` Studio markup and cache versions only.
- `dist/studio-editor.css` add-control/form styling only.
- Focused Studio tests under `scripts/` and existing cache/version assertions
  there only if needed.
- This task brief for factual delivery evidence.

No main checkout edits, Supabase, Cloudflare, other shared docs, or package
manifest changes. Do not push/deploy. Build/test in isolated worktree; browser
QA must use a disposable local profile and block external account/analytics.

## Acceptance

1. Real browser: plus opens form, invalid HEX cannot add, valid HEX adds Color
   6; selected label/HEX and rail count update, existing five role colors stay
   unchanged. Cancel/Escape leaves palette unchanged.
2. Add another color to a 6+ palette and verify member order, role map, export
   and reload. At 24, add is unavailable with understandable feedback.
3. Desktop and 390px: control visible, no page overflow, usable by keyboard;
   existing drag and `npm run test:browser:smoke` still pass.
4. Run `npm run build`, focused browser checks and `npm run check:release` if
   feasible. Report exact PASS/FAIL/NOT RUN, final SHA and files; commit only
   assigned files to task branch.
