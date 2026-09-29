# STU-13 — click a Studio color to open Color Globe

Owner: Claude implementation; Codex review/integration. Status: integrated locally; not published.
Branch `codex/claude-studio-card-globe-13`, worktree
`.local/worktrees/claude-studio-card-globe-13`; base is Codex's assignment
commit. Independent from STU-12's report files; one writer per file.

## User outcome

Clicking/tapping a Color X card in Studio opens Color Globe for that exact
member. The user can edit it there; opening and cancelling alone never changes
the palette. The existing right-side Color Globe button remains available.

## Behavior boundaries

- The card click selects the member and opens its Color Globe. Keyboard Enter
  or Space on a focused card does the same. Arrow/Home/End navigation only
  changes selected member and focus, **without** opening the dialog.
- Grip pointer drag still swaps, never opens the dialog or accidentally edits;
  the add-color plus is separate and unaffected. Label/ARIA/title/cursor should
  describe the new action. Closing/cancelling Globe restores focus sensibly to
  the card that opened it (or the right button when opened there).
- Keep the existing apply/cancel semantics, 2–24 member identity, preview role
  mapping, palette persistence, and 390px rail behavior. No new picker or
  palette state model. Reuse `colorGlobe.open(index)`.

## Allowed files

- `dist/app.js` Studio palette selection/Color Globe opening only (main also
  has unrelated dirty home zoom—never copy or touch it).
- `dist/studio-editor.css` card affordance only if needed.
- `dist/studio/index.html` cache versions only.
- Focused Studio tests under `scripts/`, including impacted existing keyboard,
  drag and cache assertions.
- This brief for factual delivery evidence.

No report files, shared docs, main checkout, Supabase, or deployment. No push.
Use disposable local browser and block off-origin account/analytics requests.

## Acceptance

Real browser: pointer card click and keyboard activation open the correct
member's dialog; ArrowRight selects next without modal; apply changes only
that member; Escape/cancel leaves colors unchanged and restores focus; grip
drag still swaps without opening. Check 390px and >5 members. Run build,
focused browser checks, existing drag/smoke and release check if feasible;
report exact PASS/FAIL/NOT RUN, SHA and files.

## Delivery (Claude, 2026-09-29)

Status: delivered for Codex review on the task branch (base `29dbfbc`); not
pushed or deployed.

- Card click/tap/Enter/Space selects the member and calls
  `colorGlobe.open(index)`; Arrow/Home/End call the shared selection only.
  Grip presses/drags never open it (a just-finished drag suppresses the
  trailing click). Cards carry `aria-haspopup="dialog"`, an "Edit … in Color
  Globe" label/title and a pointer cursor; the rail label names the action.
- Closing restores focus to the opening card (or `#openSelectedGlobe`) only
  when focus was lost; the async dialog `close` event no longer steals focus
  the user already moved (found by the new test, ~30% of fast runs).
- Cache: Studio `app.js?v=110`, `studio-editor.css?v=22`.
- New `scripts/test-studio-card-globe.mjs` (isolated Chromium, off-origin
  requests aborted): 8 members desktop click/Enter/Space/arrows/Cancel/
  Escape/close/Apply (only Color 4 and role map intact)/right button; grip
  click, drag swap, drag onto itself, plus; 390px touch tap, Cancel, touch
  grip swap. Passed 12/12 repeated runs.
- PASS: `npm run build`; `npm run check:release` (231 pass, 1 pre-existing
  skip); browser `test-studio-card-globe`, `test-studio-drag`,
  `test-studio-add-color`, `test-browser-smoke`. Hosted: NOT RUN.

## Codex integration (2026-09-29)

Reviewed Claude `dbcbb90` and integrated as `b8d4911`. Main browser checks:
card-globe 3/3, add 5/5, drag 4/4, smoke 2/2; `npm run check:release` 232/232
PASS. Public deployment and owner acceptance remain open.
