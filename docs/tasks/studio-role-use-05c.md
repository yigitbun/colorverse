# STUDIO-ROLE-USE-05C — explain where the selected color appears

Owner: Claude implementation; Codex review/integration. Small next task.
Worktree: `.local/worktrees/claude-studio-small`, branch `codex/claude-studio-small`.
Base: the clean 05B final commit (`bc9d6bf`, full SHA supplied at dispatch).
Same short-context session `a060c844-3ef8-498c-9dcf-07204ec47851`.

Problem: a member named Background may have no effect on the fixed-backdrop
Katre photo; Text may color caps, not fixed printed lettering. Do not change
the user's palette or lie that a fixed image background is being recolored.

In the existing Selected color panel, add ONE compact contextual use hint for
Products → Skincare only. Derive used surface names (Tube, Bottle, Jar, Caps)
from the current member-to-role mapping and careAssignment, not hardcoded default
names. If the selected member is not used, say so plainly and point to the
existing product assignment controls. Make fixed background/printed lettering
clear without another large instruction block. Update the hint on color/member,
context and product-assignment changes. Other contexts must not show stale photo
claims. Unassigned extra members and restored snapshots must be handled safely.

Allowed files: `dist/app.js`, `dist/studio/index.html`,
`scripts/test-studio-ux.mjs`. Codex transfers sole writing ownership for this task.
No new controls, renderer work, role renaming, palette reorder, photo replacement,
recommendation engine, changes to saved data, cache versions or other files.

Add focused checks for assigned/unassigned members, explicit changed surface
maps and leaving Skincare. Run tests/check:release and diff-check. Commit only
allowed files, return exact base/final/checks and STOP. No push, deployment,
hosted writes, real mail/users or private-project access. Read the brief from
main's absolute path if absent in this earlier-base worktree.
