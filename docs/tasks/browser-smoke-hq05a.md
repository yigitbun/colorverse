# HQ-05A — local browser smoke foundation

Owner: Claude implementation; Codex review and integration. Status: delivered
and locally integrated 2026-09-29. Branch/worktree:
`codex/claude-browser-smoke-hq05a` at
`.local/worktrees/claude-browser-smoke-hq05a`. Base `6ef9756`, Claude revision
`304de3f`, reviewed main integration `42478e1`; no push or publication.

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

## Delivery evidence

- `npm run test:browser:smoke`: PASS 2/2 in Claude worktree and after main
  integration. Fresh local server/browser, off-origin request guard, Explore
  handoff, 390px scroll and keyboard assertions passed.
- `npm run check:release`: PASS on integrated main; 113 static files and
  232/232 tests. `npm ci` installed pinned `playwright-core` locally first.
- Browser: cached Playwright headless shell or system Chrome/Chromium; on a
  clean machine use `npx playwright-core install chromium-headless-shell` or
  set `CHROME_PATH`.
- NOT RUN: intentional mutation test, Extract→Studio, account form states.
  These remain HQ-05 follow-ups; no real mail or account creation is allowed.
