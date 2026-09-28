# STUDIO-NAMING-06 — separate palette identity from application

Owner/writer: Codex lead. Base: `9e4d39e`, shared main initially clean.
Status: delivered locally; not published or visually accepted by the owner yet.
Owner asked to continue ordinary work but
reserve Claude's capacity for another project; no Claude calls in this task.

Apply the preceding neutral naming proposal as a narrow local Studio change:
palette members are Color 1…N, not Background/Surface/Primary/Accent/Text.
Use the same neutral names for Extract sample rows during the handoff; sample
point numbering, HEX copy, add/remove/undo and five-slot mapping stay unchanged.
Surface assignment remains beside the product: Label, Body, Accent, Cap,
with Print following the existing fifth preview slot. In larger palettes,
explicit five-slot assignment remains possible without dropping any members.

Allowed files: `dist/app.js`, `dist/studio-members.js`, `dist/studio/index.html`,
`dist/studio-editor.css` (320px label-fit fix),
canonical HTML app cache pins, affected existing tests, and task/status/product
documentation. Only add styles if required to preserve existing compact rows.
Codex is the only active writer; no other agent implementation/review calls.

Preserve persisted roles/indices/HEX/order, careAssignment, baseline, snapshot,
legacy CSS/JSON export keys, and all source images. Change display labels only.
Related correctness fix: on initial load, shade anchors must use the ordered
workspace members, not the separately mapped five preview colors. The old
initializer could show another member's shade family in a saved larger palette.
No generated palettes/images, corpus import, new name-editing feature,
Campaigns/product-category decision, hosted data/auth/mail, push or deployment.

Acceptance: neutral member and mapped-preview labels for 5/10/24 colors,
extra-member edits and assignment unaffected, right-side surface dropdowns and
Print note identify actual members, contrast pair/Globe/keyboard/swap labels
remain truthful. Run release suite and isolated-origin browser checks, including
small-screen serum/comparison. Do not touch the owner's 4201 localStorage or tab.

## Delivery and evidence

- Studio/Extract display Color 1…N; product options, Print, contrast, Globe,
  shades and swap labels identify the actual mapped member. Larger palettes
  retain five explicit preview slots and every original member.
- Persisted roles/indices, order, HEX, assignments and legacy export keys stay
  unchanged. Shade initialization now anchors each ordered member correctly.
- 320px rows retain readable color numbers and HEX without increasing height;
  ten-member compact cells show Color 10 rather than cutting off its number.
- `npm run check:release`: 189 PASS / 0 FAIL / 0 skipped. `git diff --check` PASS.
  App cache v101, member module v3, Studio stylesheet v13.
- Actual isolated 4202 browser: five-color Globe/shades; comparison/restore;
  local Extract PNG sampling → ten-color Studio; edit an unassigned member
  without altering the preview; explicitly assign it, reload and preserve all
  ten colors; Screens/Products switch; 320px five/ten-color layout and serum
  comparison. No horizontal overflow; console warn/error empty.
- Neutral Extract labels checked with the unchanged repo v3 PNG. Sampling was
  temporary browser QA, not corpus creation or editorial approval.
- Deliverable: `http://127.0.0.1:4202/studio/?p=concept-piera`, original five
  colors restored and temporary comparison cleared. Owner's 4201 tab/draft was
  not operated on. Temporary Extract QA tab closed.
- No Claude or other agent calls, new images, hosted writes, push or deployment.
  Device PNG, real inbox and authenticated save/resume remain NOT RUN. Other
  product-decision and corpus-approval gates remain open.
