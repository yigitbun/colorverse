# STUDIO-UX-05A — remove duplicated shade editing

Owner: Claude implementation; Codex product direction, review and integration.
Status: prepared, not started. Worktree: `.local/worktrees/claude-studio-small`;
branch: `codex/claude-studio-small`. Start from the local UX-04 checkpoint
created with this brief; Codex supplies its exact commit before dispatch.

## Small first task

Remove the right-hand vertical Light-to-deep / 12 tones strip from Studio.
It repeats the left-hand inline shades that the owner prefers. Keep the right
panel as compact selected-color tools: nearby alternatives, pair contrast and
the existing color tray. Label it clearly, rather than calling it Shades.

Keep the inline accordion, outside-click/Escape close, Color Globe, all palette
members, explicit roles, swapping, persisted drafts and export behavior.
Fix any keyboard-focus path that assumed the removed right strip existed;
do not focus hidden controls. Do not build a palette recommendation engine or
change the mathematics, photo renderer, image assets or corpus data.

Allowed files: `dist/studio/index.html`, `dist/studio-editor.css`, `dist/app.js`,
`scripts/test-studio-ux.mjs`. No other files without asking Codex. Codex gives
these files' sole writing ownership to this Claude session for this task;
Codex does not edit them concurrently.

## Acceptance and delivery

- One visible shades interaction remains, beside the selected left-hand color.
- The right panel retains alternatives, contrast and tray, without an empty
  column or a repeated instruction to choose a shade.
- Alternative labels still explain that only the selected color changes.
- Inline shade keyboard paths work without querying/focusing removed nodes.
- Run relevant tests, `npm run check:release` and `git diff --check`. If another
  pinned cache test needs an out-of-scope change, report it before editing.
- Commit only allowed files on the assigned branch and return base/final SHA,
  file list, checks actually run and remaining issues. Then STOP for review.

No live email, hosted data writes, deployment, push, branch switching in other
worktrees, generation or private project/inbox access. Browser checks only in
an isolated origin/profile with disposable local drafts; otherwise NOT RUN.

The next small task is photo role-use guidance. It is not part of this delivery
and is assigned only after Codex reviews this commit.
