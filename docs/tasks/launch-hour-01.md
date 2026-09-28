# LAUNCH-HOUR-01 — engineering for the one-hour launch push

Owner: one Codex-launched Claude Code engineer, with three read-only subagents.
Codex keeps product decisions, task changes, review, integration and publication.
The owner explicitly requested Claude implementation and parallel subagents.
Start: 2026-09-28 02:04 Europe/Berlin; one-hour target: 03:04 Europe/Berlin.
The launch prompt records the exact base revision before starting.
Branch `codex/claude-launch-hour`; worktree `.local/worktrees/claude-launch-hour`.

Read AGENTS.md, CLAUDE.md, coordination, this brief and the current open-work
table. Prior AUTH-ACCOUNT-01 and QA-01 deliveries are already integrated;
do not repeat completed design work or start an independent backlog.

## Parallel analysis, single implementation owner

Start these three named subagents in parallel, read-only:

1. **auth-audit:** shared email/code lifecycle, reset/stop while requests are
   pending, resend/change-email cooldown, duplicate submit, expiry errors,
   leading zeroes/paste, actual session required, focus and busy states.
2. **workspace-audit:** Account and Studio session changes, save-after-login
   intent, local drafts on failure, cross-user state leakage, templates,
   palette/project integrity. Public/anonymous security checks are distinct
   from real authenticated browser evidence.
3. **release-audit:** entrypoint/module cache consistency, required assets,
   CSS rules for signed-in/out surfaces, accessible labels/statuses and
   publishing checks. Report demonstrated issues, not speculative redesigns.

Subagents may read project code but cannot write, run commands, spawn more
agents or access personal/credential files. Primary Claude is the sole writer.
Pass them the relevant product invariants; do not rely on inherited chat.
Wait for all three results before final delivery. Use specific findings to
implement small P0/P1 fixes; add meaningful mocked regressions reproducing
each demonstrated behavior. Do not stop after returning an audit proposal.

## Exclusive initial edit scope

- `dist/email-code-flow.js`, `dist/email-access.js`.
- `dist/account.js`, `dist/project-store.js`.
- `dist/account/index.html`, `dist/studio/index.html`, `dist/email-entry.css`.
- `scripts/test-account-entry.mjs`, `scripts/test-auth-layout.mjs`.
- `dist/app.js`: only the project-store import cache version.
- Other `dist/**/index.html`, `dist/index.html`: only matching root app.js
  cache versions if needed; home-test's own app.js is not part of this change.

No planning/AGENTS/CLAUDE changes, packages/dependencies, DB schema, account
client/config, SMTP/provider/security settings or new features without a
Codex assignment. The owner will supply further product changes in the lead
conversation; Codex will sequence file ownership and issue additional scope.
Preserve eight-digit email OTP, one-hour expiry, new/returning same path,
English UI, 2–24 member colors and explicit five Studio roles. No passwords,
magic links, OTP persistence, new images, fake success or broad refactor.

## Checks and limits

Use native Edit/Write for files. Keep output uncommitted for Codex review.
Do not touch main, push/merge/deploy, access credentials/personal material,
send real emails, create/delete live accounts, run test-member-live.mjs or
change hosted data. Local previews share the live backend. No production mock
bypass. Browser and inbox are NOT RUN unless actually exercised; do not
claim code review demonstrates real save/resume.

Run focused auth tests after fixes, `npm run check:release`, and
`git diff --check`. The build+test suite need only run once at final delivery
unless failures require another run. Public infrastructure was just checked;
do not loop live requests. Spend the next 15–20 minutes on concrete engineering,
leaving time for Codex review and the owner's remaining changes. Return a
short first delivery once implementation and verification finish.

Include base revision, paths, the actual three subagent results, specific fixes,
PASS/FAIL/NOT RUN and unresolved items. If there is no proven fix to make,
report that honestly instead of manufacturing changes. Work must not depend
on the owner's inbox being supplied; continue the local engineering scope.
