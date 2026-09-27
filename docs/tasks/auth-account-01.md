# AUTH-ACCOUNT-01 — complete passwordless account experience

Owner: the existing Codex-launched Claude Code implementation session, resumed
in `.local/worktrees/claude-auth-email`, branch `codex/claude-auth-email`.
Base: `47084b0df2d65be73cd694be88ae8908dfec451b`. Codex owns review, shared
integration, hosted settings and release. Other Claude sessions are read-only
reviewers unless Codex explicitly transfers ownership again.

The owner explicitly delegated the entire account/email engineering task to
Claude. This supersedes the UI ownership and narrow edit restrictions in
AUTH-EMAIL-01. Existing email output is retained, not restarted. Codex's five
uncommitted UI files are copied into this worktree as an unfinished starting
point, not an approved design. Codex pauses implementation of these files.

## Product outcome

New and returning members reach the same **Sign in or create an account**
screen: email → OK → emailed code → real authenticated account. No password,
separate signup mode, account-existence lookup, magic-link login or fake success.
Account and Studio must share behavior and visual vocabulary. Studio login
must preserve the current unsaved workspace and return to its intended action.

Reference observed in Jack Wolfskin's Shopify account entry: white page,
centered brand near the top, compact ~380 px form, short left-aligned heading,
one sentence, bordered rounded email field with integrated continue action,
and quiet footer. The owner wants this simplicity using ColorVerse typography,
colors and wordmark; do not copy third-party branding, legal text or artwork.
Retain the existing OK action unless an accessibility issue requires a label.

The email reference is similarly white, centered, with a large brand, brief
code label, prominent spaced code, expiry and quiet privacy footer. **480 px
email width and no purple accent are approved.** English UI, eight-digit code,
one-hour expiry and 60-second resend cooldown remain the product decisions;
the reference's six digits / fifteen minutes do not supersede them.

## Exclusive edit scope

- Existing AUTH-EMAIL-01 HTML, TXT and template test.
- `dist/account/index.html`, `dist/account.js`.
- `dist/studio/index.html`, `dist/project-store.js`.
- `dist/email-entry.css`, `dist/email-code-flow.js`, `dist/email-access.js`.
- `scripts/test-account-entry.mjs`, optional `scripts/test-auth-layout.mjs`.
- `package.json`: only add auth test scripts to the existing test command;
  no dependencies or unrelated script changes.
- `dist/app.js`: only the project-store import cache version.
- Other `dist/**/index.html` and `dist/index.html`: only the matching root
  `/app.js` cache version if that module changes; do not touch home-test/app.js.

Planning/AGENTS/CLAUDE docs, account backend/client, schema, data, hosting,
dependencies and unrelated application behavior remain out of scope. Read
them as needed. Do not edit the main checkout, push, merge, deploy, commit,
send real mail, access credentials, create/delete users or change remote
services. Local previews share the live backend. No production mock bypass.
Use native Edit/Write tools for file edits, not shell writes.

## Required work and acceptance

1. Review and finish the inherited UI across Account and Studio. Calm spacing,
   mobile 320/390 px and desktop, no overflow, keyboard labels/focus, readable
   contrast, status announced accessibly. Preserve the signed-in library and
   existing private palette/project operations; no unrelated redesign.
2. Complete the shared email/code state machine. Honest send/verify failures,
   pending/disabled states, duplicate submit protection, resend countdown,
   change email, wrong/expired code, leading zeroes and whole-code paste.
   No success without a session. Preserve work on failure. Review refresh,
   dialog close/reopen and late async responses; fix demonstrated local bugs,
   do not persist OTPs or introduce a new auth architecture.
3. Finish email follow-ups from the independent review: add `mso-hide:all` to
   the hidden preheader; test absence of src/URL remote resources and the
   unsolicited-email ignore sentence. Keep a single contiguous `{{ .Token }}`
   in each template; layout must survive removal of head CSS. Subject for both
   Supabase flows: **Your ColorVerse sign-in code** (never include the code).
4. Add meaningful dependency-free regression tests; wire new auth tests into
   `npm test`. Check actual behavior with mocks, not only source-string tests.
   No live-user/admin tests. Keep unrelated tests passing and cache versions
   consistent. Avoid unnecessary refactoring and dependencies.

Run `npm run check:release`, targeted auth tests and `git diff --check`.
If a check is unavailable, report it honestly. Browser/inbox/hosted checks are
separate from mocked tests. Codex handles visual integration review and hosted
template application; the owner completes real inbox and save/resume gates.

## Deliver now

Implement, do not stop at a plan. Return base revision, changed files, concise
decisions, PASS/FAIL/NOT RUN evidence and remaining blockers. Leave edits
uncommitted. Codex reviews the exact delivered files before integration.

## Integration review findings

- Codex browser review, 2026-09-27: the initial email is readable on desktop
  and fits 320 px with its media query. With head `<style>` tags stripped,
  the 8-digit synthetic sample produces document width 322 px in a 320 px
  viewport (code cell 274.23 px, plus 48 px outer padding). Make inline
  fallback spacing fit without relying on media queries; add a regression
  guard. Real Gmail/Outlook rendering remains NOT RUN.
