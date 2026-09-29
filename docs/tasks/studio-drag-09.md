# STU-09 — dragged color card follows the pointer

Owner: Claude implementation; Codex review and integration. Status: assigned.
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
