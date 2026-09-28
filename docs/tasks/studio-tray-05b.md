# STUDIO-TRAY-05B — store the selected member color

Owner: Claude implementer; Codex review/integration. Small follow-up to 05A.
Worktree: `.local/worktrees/claude-studio-small`; branch `codex/claude-studio-small`.
Base: `9b25e0898a6b9c8f6c7bcfb7a53660ee44d63969`. Fresh Claude session
`a060c844-3ef8-498c-9dcf-07204ec47851`, short context rather than the large
historical implementation session. No other writer owns the files below.

Fix only the Add to color tray handler: use `activeColor()` (workspace member),
not `current.colors[activeColorIndex]` (preview-role array). The latter stores
the wrong color or fails when selecting a member past index four. Preserve
uppercase HEX, de-duplication, 18-color cap, local-only storage and removal.

Allowed files only: `dist/app.js`, `scripts/test-context-kits.mjs`,
`scripts/test-studio-members.mjs`. Update any old source-text assertion that
mistakenly demands the preview-role indexing expression. Add a narrow regression
that covers an 8-member workspace with a non-identity role map and the sixth/
last member selection. Do not modify other interactions, caches or shared docs.

Read main's brief at its absolute path if absent in this earlier-base worktree.
Read AGENTS/coordination first, run targeted checks and check:release, commit
only allowed files, report base/final/checks, then STOP. No pushes, deployment,
hosted writes, real users, private projects, dependency changes or new features.
