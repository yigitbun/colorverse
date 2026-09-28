# STUDIO-MEMBERS-01 — compact multi-color workspace and Extract insertion

Prepared follow-up for the same Studio Claude writer AFTER STUDIO-UX-02 ends.
Do not launch a second writer on its files. Base includes reviewed first-pass
changes. No hosted migrations/settings/data changes, commit/push/deploy or emails.

## Owner request

Studio must not be limited to five visible palette colors: support 8–10 compactly
without making the left column taller. Existing member palettes support 2–24;
never silently truncate those. Five explicit preview roles remain separate from
the complete palette. Extract/Image to palette needs a plus between color rows.
No corpus import, research, automatic curated palettes or new scientific model.

## Small compatible client model

- Keep current.colors as the five preview-role values for existing renderers,
  colorway baselines and RPCs. Store a validated versioned workspace with ALL
  palette members and five distinct assigned member indices alongside it.
- Preserve 5–24 incoming member colors. An existing <5 member palette stays
  intact; do not invent supporting colors to open it in a five-role preview.
- On normal 5-color palettes use identity mapping. More colors are not renamed
  Foundation etc.; unassigned colors have clear neutral labels. Explicit role
  reassignment UI, never auto score/arrange/silent mapping.
- >5 left palette becomes compact two-column cells with accessible color square,
  shade toggle and assignment action. 8–10 should fit roughly the current five
  rows' height. >10 can use contained scrolling rather than truncate the list.
- Editing assigned/unassigned colors, shade opening/closing, swap, Color Globe
  and copy/export operate on the intended member. Preview changes only when an
  assigned member changes. Maintain same dependable first-pass hitboxes.
- Copy/HEX/JSON retain all members, with explicit preview-role mapping. Five-role
  CSS/SCSS/Tailwind can remain role exports, labelled accordingly. No undefined
  role keys, no extra members sent to five-only PNG/project/prototype/template RPCs.
- Project/prototype editor_state and template defaults preserve workspace using
  their existing JSON paths; wire ALL save/resume/seed paths. No new SQL needed.
  Old five-color snapshots still load. Validate bounded data/mapping consistency.
- My palettes -> Studio: after existing explicit five-role selection, send ALL
  original colors plus selected indices. Saving a multi-color palette uses the
  existing save_member_palette RPC (2–24), not five-only collection RPC. Do not
  lose user name, collection, preview assignments or overwrite an existing item.

## Extract

- Small + controls between rows insert an extra sampled/manual color at that
  position, up to 10. New numbered point is linked to its color; existing dragged
  sample positions must not move. Support removal of inserted extra colors,
  undo and reset. Never silently replace the original five assigned colors.
- Indices/mapping update on insert/remove so the five original role assignments
  remain attached to their original members. Dynamic color count/ARIA, no "5"
  promises for a ten-member list.
- Continue in Studio preserves complete palette, member order and explicit
  preview-role mapping. No generation/imaginary scientific recommendation score.
- Clarify numbered fields minimally: sample number linked to image point;
  color edit and HEX copy have separate accessible labels.

## Writable scope when activated

dist/app.js, dist/studio/index.html, dist/studio-editor.css, dist/color-globe.js,
dist/color-globe.css, dist/member-palette.js, dist/account.js, dist/project-store.js,
dist/color.js (exports only), dist/extract/index.html, dist/extract-workspace.css,
new dist/studio-members.js, scripts/test-studio-members.mjs,
scripts/test-studio-ux.mjs, scripts/test-member-palettes.mjs,
scripts/test-context-kits.mjs, scripts/test-account-entry.mjs,
scripts/test-color-globe.mjs, scripts/test-design-refresh.mjs,
package.json (test registration only).

No gallery/photo writer files. Reuse completed persistence audit, no new agents
or repeated broad inspection. Keep authentication code unchanged.
Run targeted tests then one final check:release and diff check. Parent performs
isolated-origin UI tests and integration. Deliver exact changes and real checks.
