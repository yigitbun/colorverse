# STUDIO-SHADES-10 — vertical horizontal-strip shades

Owner/writer: Claude Code Opus 5.5; Codex reviews/integrates. Prepared from
clean main `1245cb7`; implementation base is this assignment's docs commit.
Branch `codex/claude-studio-shades`, worktree
`.local/worktrees/claude-studio-shades`. Status: prepared, not started.

The owner prefers the earlier right-side Shades appearance: a vertical list of
full-width horizontal color strips, rather than the current 7×3 chip grid.
Historical design reference: `git show 4e8b48e:dist/studio-editor.css`,
`.vertical-shades` styles (read-only). Keep the current right-side location,
21 shades, selected source behavior, one-click application, accessible labels,
keyboard focus and the rest of the color tools. Do not restore the old inline
editor, modal, second shade path, or obsolete product layout.

Writable files: `dist/studio-editor.css` and directly affected existing
`scripts/test-studio-ux.mjs`. No shared HTML/cache-pin edit: Codex will bump the
Studio CSS pin after integration. No app logic, palette data, auth, corpus,
deployment or other files. Ask for scope expansion if unavoidable.

Acceptance: strips read light→deep, span the tool width, indicate the current
choice and hover/focus, remain keyboard/touch usable and contained at narrow
width without horizontal overflow. Maintain vertical space reasonably;
scrolling within the list is acceptable if obvious. Add focused regression,
run targeted tests and `npm run check:release`, `git diff --check`; commit only
allowed files locally. Return exact revision and PASS/FAIL/NOT RUN evidence,
including whether browser QA was actually run. Stop for Codex review.
