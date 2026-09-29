# STU-09 — dragged color card follows the pointer

Owner: Claude implementation; Codex review and integration. Status: delivered
for Codex review (not integrated).
Branch `codex/claude-studio-drag-09`, worktree
`.local/worktrees/claude-studio-drag-09`; base is the local main assignment
commit supplied by Codex.

## User outcome

When dragging a Studio palette member by its grip, the actual Color X card
should visibly travel with the pointer/finger. Keep the source position clear
and the destination legible; on drop, complete the existing member swap.

## Allowed files

- `dist/app.js` — Studio palette drag code only, near `paletteRoles` listeners.
- `dist/studio-editor.css` — related palette member/drag visuals only.
- `dist/studio/index.html` — cache versions only if those assets change.
- Focused Studio test file(s) under `scripts/`, only for this behavior.
- This brief for factual delivery evidence.

No other files, no hosted writes, no main checkout. Main has unrelated dirty
home edits in `dist/app.js`; do not copy or touch those. Do not deploy/push.

## Acceptance

1. Drag starts only from grip; on threshold crossing, a faithful Color X card
   follows pointer/touch with smooth positioning, not just opacity on the fixed
   card. Avoid duplicate interactive/announced controls (e.g. inert visual
   proxy is acceptable). Desktop and 390px horizontal rail both work.
2. Target highlight and actual swap semantics remain intact for 2–24 members.
   Clicking a color still selects it; pointer/touch drag must not accidentally
   select or persist before drop.
3. Pointercancel, Escape, release outside a target, lost capture, and rerender
   remove every temporary visual/DOM state; no ghost or stuck target remains.
   Respect reduced-motion preferences. Do not cover the pointer target with
   the moving visual.
4. Add a focused real-browser check that moves the pointer and verifies the
   moving card changes screen position, then verifies drop and cancel cleanup.
   Use isolated local browser/profile and no hosted account/analytics writes.
5. Run `npm run build`, focused tests and, if feasible, `npm run check:release`.
   Report exact PASS/FAIL/NOT RUN, base/final SHA and changed files. Commit only
   assigned files on the task branch.

## Delivery evidence (Claude, 2026-09-29)

Base `51ae5b400e158cc8901520934693efe957991335`; final commit is reported in
the handoff. Local checks only; no hosted writes, push, or deploy.

- A grip drag past 7px lifts an inert clone (`aria-hidden`, `inert`,
  `tabindex=-1`, no `data-select-member`/label, `pointer-events:none`) inside
  the rail as `position:fixed`, so rail overflow/fade never clips it. It is
  placed synchronously on each pointer move with the grabbed point kept under
  the pointer. The source slot stays in place as a dashed, empty outline.
- Targets use `elementsFromPoint`; swap happens only on pointerup over another
  member. Near a scrollable rail edge the rail auto-scrolls (instant steps, no
  animation), so 24-member and 390px rails reach every member.
- Cleanup on drop, `pointercancel`, `lostpointercapture`, Escape (document
  listener while dragging), release outside, and rail rerender
  (MutationObserver on the source card). No transitions/animations are used, so
  reduced motion needs no separate path.
- Studio cache versions: `app.js?v=108`, `studio-editor.css?v=20` (Studio page
  only); the two existing assertions pinning those versions were updated in
  `scripts/test-studio-ux.mjs` and `scripts/test-studio-integration.mjs`.
- `scripts/test-studio-drag.mjs` (real headless Chromium, disposable context,
  all off-origin requests aborted, optional analytics declined): desktop mouse
  travel/swap/click-select; Escape, release outside, keyboard rerender
  mid-drag; 2 and 24 members; 390px touch via CDP with finger drift, touch
  drop and touch cancel. Not wired into `package.json` (outside allowed files);
  run `node --test scripts/test-studio-drag.mjs`.

Results: `npm run build` PASS; `npm run check:release` PASS (231 pass,
1 pre-existing skip); `scripts/test-studio-drag.mjs` PASS 4/4 (3 repeat runs);
`npm run test:browser:smoke` PASS 2/2. Real-device touch and hosted smoke:
NOT RUN.
