# STU-14 — visible Studio palette Shuffle

Owner: Claude implementation; Codex review/integration. Status: assigned.
Branch `codex/claude-studio-shuffle-14`, reuse clean worktree
`.local/worktrees/claude-studio-card-globe-13`; base is Codex's assignment
commit. This branch must start from the current local `main`.

## Outcome and placement

The owner wants **Shuffle** above Color 1, clearly visible. It rearranges the
existing palette members; it does not generate/replace colors. Put a labelled
button in the expanded left inspector after the palette title/count and before
the member rail, visually distinct from the add-color plus below the rail.
Give it a recognizable shuffle icon and concise explanatory text/tooltip such
as “Mix order · keep colors”. On 390px it remains visible and easy to tap.
Collapsed rail may show an accessible icon button or reveal expanded rail on
activation; never show a squeezed/ambiguous label. No decorative hidden-only
control. Do not add a Generate action in this task; Codex will decide its
distinct place and semantics with the owner.

## Behavior

- Use a sound Fisher–Yates permutation with `crypto.getRandomValues` where
  available and a safe fallback, retrying/adjusting if it yields the original
  order. Palette size is 2–24; one click must visibly change order. No HEX is
  created/deleted and no palette is applied to live external data.
- Preserve workspace validity, role mapping, shade anchors, save/reload and
  preview. For exactly five members the five preview slots follow reordered
  positions, as existing member drag does; with 2–4 or 6–24 members, preserve
  role-to-color identity across permutation as existing drag does for >5.
  Choose active/focused color identity sensibly and announce new order in the
  existing live region. Keep card click/Globe and grip drag behavior intact.
- No page reload. Explicit action only. If implementable cleanly, give a
  one-step Undo affordance after shuffle; otherwise report the tradeoff to
  Codex, do not build a global history system.

## Allowed files

- `dist/app.js` Studio shuffle flow only; main's unrelated dirty homepage zoom
  must not be copied or altered.
- `dist/studio/index.html` Studio rail markup/cache pin only.
- `dist/studio-editor.css` shuffle control/responsive styling only.
- Focused Studio tests under `scripts/`; this brief for factual delivery notes.

No shared docs, main checkout, Supabase, deployment, package manifest or
unrelated features. Use isolated local browser, blocking off-origin requests.
Run build, focused tests, drag/add/card-globe/smoke browser checks and release
check if feasible. Report exact PASS/FAIL/NOT RUN, base/final SHA and changed
files. Commit only assigned files; no push.

## Delivery (Claude, 2026-09-29)

Status: delivered for Codex review on the task branch (base `2130f1f`); not
pushed or deployed.

## Owner correction — STU-14A (2026-09-29)

The owner rejects the new full-width Shuffle block: “shuffle sadece minik bir
icon olsa yeterdi, blok ekleyip durma.” Claude should revise the locally
integrated STU-14 UI on a separate branch `codex/claude-studio-shuffle-icon-14a`
from current main. Remove the extra Shuffle row entirely. Keep a compact
icon-only Shuffle control **on the same line as the palette name (e.g. Citrus
Muse), right-aligned**, above Color 1, without adding vertical layout height
or changing the “Your palette” top line. Give it `aria-label` and `title` that
plainly say it mixes the current colors' order without generating new ones.
Keep Undo as an equally compact icon-only peer if feasible; do not introduce
another row, toolbar or block. In collapsed mode, it may be hidden until the
rail is expanded if two icon controls cannot fit safely. Preserve the tested
shuffle/undo logic and all other controls. Update only Studio HTML/CSS and the
focused tests whose old large-button placement assumptions change; `dist/app.js`
should not change unless strictly necessary. Use the original allowed-file and
test/safety constraints. Codex reviews/merges exact revision; no push/deploy.

- A labelled `Shuffle` button (recognizable crossing-arrows icon, visible
  label, `title="Mix order · keep colors"`) sits in a new row between the
  palette title/count and the member rail, styled distinctly from the dashed
  add-color control below the rail. While the rail is collapsed the button
  stays as a real accessible icon control (label kept in the DOM via the same
  visually-hidden technique already used for `#paletteAddToggle`, never
  `display:none`); it is never a squeezed or decorative-only label.
- `shufflePalette()` draws a Fisher–Yates permutation (`randomPaletteOrder`)
  using `crypto.getRandomValues` when available, a `Math.random` fallback
  otherwise, retried up to 40 times if it lands back on the original order and
  otherwise adjusted by swapping the first two positions, so one click always
  visibly reorders 2–24 members. It only reorders `workspace.members`: no HEX
  is added, edited or removed.
- Exactly five members keep the historic identity role map (unchanged), so
  the five preview slots follow the new positions, matching existing member
  drag. For 2–4 and 6–24 members, each preview role is remapped to follow its
  color's new index (`order.indexOf`), exactly generalising the pairwise
  remap `swapPaletteMembers` already does for one drag swap — preview/role
  colors are unaffected by a shuffle. `shadeSourceColors` and the active
  color both travel with their color's identity, not their old index. The
  new order is announced in the existing `#paletteOrderStatus` live region;
  no page reload.
- One-step Undo: a snapshot of the pre-shuffle workspace, shade sources and
  active index is kept only until the next `commitWorkspace` call (every
  other Studio writer funnels through it, so any other edit silently clears
  the pending Undo — no history stack). A small `Undo` button appears next to
  Shuffle immediately after a shuffle, restores the exact prior order in one
  action, then disappears and returns focus to Shuffle. Tradeoff: the Undo
  button is not shown while the rail is collapsed (icon-only mode has no room
  for a second labelled control); Shuffle itself remains fully usable there.
- Cache: Studio `app.js?v=111`, `studio-editor.css?v=23`.
- New `scripts/test-studio-shuffle.mjs` (no browser; runs the real
  `randomPaletteOrder`/`shufflePalette`/`commitWorkspace` bodies from `app.js`
  against the real `studio-members.js` reducers): permutation validity and
  non-identity across 2–24 members; crypto-preferred/Math.random-fallback;
  the deterministic adjust-on-repeated-identity path; full round-trip
  correctness (same color set, role/shade/active-color identity preservation,
  live-region text, undo snapshot, `track` call) for 2, 3, 4, 5, 6, 8, 10, 24
  members; the shared `commitWorkspace` funnel clearing the undo snapshot for
  any other writer; markup placement/tooltip/distinct styling; and the
  Shuffle/Undo click-handler wiring.
- New `scripts/test-studio-shuffle-browser.mjs` (isolated headless Chromium,
  off-origin requests aborted, no page-reload guard): Shuffle sits above
  Color 1 with icon/label/tooltip, reorders without navigation, announces,
  and offers a one-step Undo that restores the exact order and does not
  stack; shuffling and undoing never disturb card click/Globe or grip drag,
  and any other edit clears a pending Undo; the collapsed rail keeps an
  accessible icon-only Shuffle; 390px touch tap reorders with no horizontal
  overflow and a touch-friendly (40px+) target.
- Updated stale hardcoded assertions to match the intentional changes: the
  `app.js`/`studio-editor.css` version pins in `scripts/test-studio-ux.mjs`
  and `scripts/test-studio-integration.mjs`, and the `paletteCount`→
  `paletteRoles` adjacency regex in `scripts/test-studio-members.mjs` (now
  expects the new shuffle row between them).

Results: `npm run build` PASS (113 static files). `npm run check:release`
PASS (233 pass, 1 pre-existing unrelated skip). `node --test
scripts/test-studio-shuffle.mjs` PASS 9/9. `node --test
scripts/test-studio-shuffle-browser.mjs` PASS 4/4. Regression browser checks
PASS 14/14: `scripts/test-studio-drag.mjs` (3/3), `scripts/test-studio-add-color.mjs`
(6/6), `scripts/test-studio-card-globe.mjs` (3/3), `scripts/test-browser-smoke.mjs`
(2/2). Real-device touch and hosted/Supabase-connected smoke: NOT RUN.

## Delivery — STU-14A correction (Claude, 2026-09-29)

Status: delivered for Codex review on `codex/claude-studio-shuffle-icon-14a`,
base `4a45f28`; not pushed or deployed. Implements the owner's plain-language
correction above (lines 58–72); the itemized bullets and version pins directly
under the correction heading described the prior full-block delivery being
replaced and are superseded by this entry.

- Removed the `.palette-shuffle-row` block entirely. `#paletteName` now sits
  in a new `.palette-name-row` flex row (`justify-content:space-between`)
  alongside a `.palette-name-actions` wrapper holding two 26px icon-only
  buttons — `#paletteShuffle` and `#paletteShuffleUndo` (same IDs, so no
  `app.js` wiring changed). The "Your palette" `.inspector-top` line (eyebrow
  + collapse toggle) is untouched.
- Shuffle and Undo are icon-only (no visible `<span>` label); `aria-label`
  and `title` on `#paletteShuffle` both read "Shuffle palette order — mixes
  your colors, doesn't create new ones", plainly stating it mixes order
  without generating colors, per the correction. `#paletteShuffleUndo` gets
  its own compact icon (a return-arrow glyph) with `aria-label`/`title`
  "Undo shuffle"/"Undo shuffle, restore the previous order".
- No extra vertical height: the h3's `margin` moved onto `.palette-name-row`
  (including the two responsive breakpoints that used to set it on the h3
  directly) so the row occupies the same space the name occupied before.
- Collapsed rail (64px): `.palette-name-row` (name + both icons) hides as one
  unit, extending the existing rule that used to hide `#paletteName` alone —
  two icon controls do not fit the collapsed rail safely, which the
  correction explicitly allows. Expanding the rail restores both.
- `shufflePalette`/`randomPaletteOrder`/`commitWorkspace`/undo logic in
  `dist/app.js` is unchanged (not touched at all, per the correction's "should
  not change unless strictly necessary"); only markup/CSS moved.
- Cache: `studio-editor.css?v=24` (content changed); `app.js?v=111` unchanged
  (no JS edit).
- Updated tests: the two `scripts/test-studio-shuffle.mjs` markup tests now
  assert the icon-only row placement, the absent visible label, and that the
  whole name row (not just Shuffle) hides while collapsed. Updated
  `scripts/test-studio-shuffle-browser.mjs`: same-row/right-aligned
  bounding-box checks, aria-label/title wording checks, a rewritten collapsed
  test (Shuffle now hidden while collapsed, reappears on expand), and a
  relaxed 390px tap-size floor (24px, matching the existing 28px
  `.palette-rail-toggle` convention in this panel, since the correction asks
  for compactness rather than a large dedicated touch target). Updated the
  cache-pin assertion in `scripts/test-studio-ux.mjs` to `v=24` and the
  `paletteCount`→`paletteRoles` adjacency regex in
  `scripts/test-studio-members.mjs` (the shuffle row no longer sits between
  them).

Results: `npm run build` PASS (113 static files). `node --test
scripts/test-studio-shuffle.mjs` PASS 9/9. `node --test
scripts/test-studio-shuffle-browser.mjs` PASS 4/4. `npm run check:release`
PASS (233 pass, 1 pre-existing unrelated skip, build revalidated). Regression
browser checks PASS 14/14:
`scripts/test-studio-drag.mjs` (3/3), `scripts/test-studio-add-color.mjs`
(6/6), `scripts/test-studio-card-globe.mjs` (3/3), `scripts/test-browser-smoke.mjs`
(2/2). Visual sanity: isolated headless-Chrome screenshots of the expanded,
collapsed and 390px inspector, plus post-shuffle state, confirm Shuffle/Undo
sit right-aligned on the "Citrus Muse" name row with no added block, and hide
together while collapsed. Real-device touch and hosted/Supabase-connected
smoke: NOT RUN.
