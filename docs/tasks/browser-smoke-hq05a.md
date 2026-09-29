# HQ-05A — local browser smoke foundation

Owner: Claude implementation; Codex review and integration. Status: assigned,
not yet started. Branch/worktree: `codex/claude-browser-smoke-hq05a` at
`.local/worktrees/claude-browser-smoke-hq05a`. Base: the local `main` commit
that records this assignment; Codex supplies its exact SHA before work starts.

## Outcome

Add one repeatable local browser smoke command for the current static app.
This first slice covers an isolated Explore → Studio handoff, 390px horizontal
overflow, and keyboard selection of Studio palette members. HQ-05 remains
partial until Extract → Studio and account form states are automated.

## Allowed files

- `scripts/test-browser-smoke.mjs` (new)
- `package.json`, `package-lock.json` if a small browser driver dependency or
  command is needed
- This task brief only for factual check results after delivery

No edits to `dist/`, shared docs, Supabase, Cloudflare, or the main checkout.
Avoid the owner’s local dirty home page files entirely.

## Acceptance

1. `npm run test:browser:smoke` starts and stops its own local server and
   isolated headless browser; it does not depend on a pre-opened tab/session.
2. The test follows a real visible palette entry from Explore into Studio and
   checks the expected palette/member state, not just HTTP 200 or source regex.
3. At 390px, no document horizontal overflow; Studio rail scrolls within its
   own width; keyboard navigation selects another member and updates the
   selected-color panel.
4. Block remote account/analytics requests in the test. Never create users,
   send mail, touch hosted data, or modify browser profiles outside the
   disposable test run.
5. Existing `npm run build` and focused tests still pass. Report exact checks,
   PASS/FAIL/NOT RUN, dependency/browser requirements, and remaining HQ-05
   coverage. Commit only assigned files on the task branch.
