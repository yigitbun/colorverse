# QA-RELEASE-02 — repair the live release check

Owner: Codex-launched Claude Code; integration and publication: Codex.
Base: `09bba4052608c6c21ea6d8765a83cf037b9ea240`.
Branch: `codex/claude-release-check`.
Worktree: `.local/worktrees/claude-release-check`.
Exclusive writable file: `scripts/test-live-mvp.mjs`.

QA-01 and Codex independently reproduced a stale copy assertion at line 75.
The current Account and Studio say "No password."; the test expects "No
password needed". This prevents later candidate checks from running. The
application is published; this is a test maintenance defect, not evidence
that sign-in itself failed.

Update the assertion to require the current passwordless meaning without
depending on the exact marketing sentence. Keep the actual code-field,
eight-digit, no-password-input and asset checks. Do not weaken or remove
unrelated checks. Only fix further stale assertions if the same candidate
run concretely demonstrates them; report actual product defects to Codex.

Run `npm run test:live:release`, `npm run check:release` and
`git diff --check`. Existing smoke checks probe anonymous boundaries but
must not create accounts or send mail. No credentials, administrative/live
member tests, hosted changes, main-checkout writes, commit, push or deploy.
Use native Edit/Write for the one permitted file. Leave the delivery dirty.
Return the diff summary, PASS/FAIL/NOT RUN and any remaining issue. Implement
the fix and finish the checks in one focused session.

## Delivery — 2026-09-28

Claude changed only `/No password needed/` to `/No password/i`; every other
candidate assertion remains intact. Codex reviewed and integrated this exact
one-line diff. Claude's live candidate check PASS, static build PASS, 118 local
tests PASS and one ignored private-backup test SKIP in the isolated checkout.
`git diff --check` PASS. No real email or authenticated browser journey ran.
