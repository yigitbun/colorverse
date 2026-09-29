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

## Delivery (Claude)

Base `9abbc19`. Implemented on `codex/claude-studio-add-color-10`.

- Markup (`dist/studio/index.html`): `#paletteAdd` directly after
  `#paletteRoles` (outside the rail, so never a drag target): a dashed plus
  button (`aria-expanded`/`aria-controls`) and a hidden inline form with a
  native color input, a labelled HEX text field, a live hint, and explicit
  Add / Cancel buttons. In 2–4 color palettes the existing support note stays
  between rail and plus.
- Flow (`dist/app.js`): the button names the member it creates ("Add Color 6").
  Opening prefills an editable suggestion (hue turn from the last member, kept
  distinct from all members) and focuses the HEX field. HEX is the source of
  truth (`normalizeHex`, 6 digits, `#` optional); invalid input disables Add,
  sets `aria-invalid` and shows an error; the picker follows a valid value and
  writes the field. Cancel, Escape and collapsing the rail close without any
  write; focus returns to the plus. Add uses `insertMember(workspace, count,
  color)` + `commitWorkspace`, selects the new member (Edit panel, rail focus,
  scroll into view) and announces it in `#paletteOrderStatus` plus a toast.
  Preview roles are untouched for 5+; 2–4 keep the model's support-slot fill,
  and a 4→5 addition follows its canonical reorder (selection and shade
  anchors track the new color). At 24 the plus shows "Palette full", is
  `aria-disabled` (still focusable) with a visible "at most 24" note, and
  activating it only announces the limit. A collapsed rail shows an icon-only
  plus (text kept for its accessible name); activating it expands the rail and
  opens the form.
- Styles (`dist/studio-editor.css`): add control/form only; inline-width
  control under the horizontal rail at ≤1100px, full width in the 390px layout;
  16px HEX text and 40px targets on coarse pointers.
- Cache versions: `app.js?v=109`, `studio-editor.css?v=21`; the pinned
  assertions in `scripts/test-studio-ux.mjs` / `scripts/test-studio-integration.mjs`
  were updated, and the unit rail harness stubs the new `renderPaletteAdd` call.
- `scripts/test-studio-add-color.mjs` (headless Chromium, disposable context,
  all off-origin requests aborted, analytics declined): invalid HEX variants
  (click and Enter), Cancel, Escape, keyboard open, valid add → Color 6 with
  label/HEX/selection/count/focus and unchanged roles; drag onto plus does not
  swap; 7-color custom role map → add by picker and by Enter, JSON export
  members/previewRoles, reload; 3→4→5 support-slot fill; 23→24 limit;
  collapsed rail; 390px touch with no page overflow. Not wired into
  `package.json` (outside allowed files); run
  `node --test scripts/test-studio-add-color.mjs`.

Results: `npm run build` PASS (113 static files); `npm run check:release` PASS
(231 pass, 1 pre-existing skip); `scripts/test-studio-add-color.mjs` PASS 5/5
(3 runs); `scripts/test-studio-drag.mjs` PASS 4/4; `npm run test:browser:smoke`
PASS 2/2. No remote origins were requested in the browser runs. Real-device
touch, native color-picker popup UI and hosted smoke: NOT RUN.
