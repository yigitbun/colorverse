# AUTH-EMAIL-01 — ColorVerse sign-in email

Owner: Claude. Integration and hosted changes: Codex.
Status: assigned; execution status is maintained in `docs/open-work.md`.

## Working boundary

Work only in the isolated `codex/claude-auth-email` branch/worktree allocated
by Codex. The launch prompt supplies the exact base commit and path. Read
`CLAUDE.md`, `AGENTS.md`, and `docs/agent-coordination.md` first.

Allowed edits (exclusive to this task):

- `supabase/email-templates/sign-in-code.html`
- `supabase/email-templates/sign-in-code.txt` (optional plain-text companion)
- `scripts/test-auth-email-template.mjs` (small, dependency-free checks)

Codex owns all account/Studio UI, controllers, shared documents, package files,
and hosted settings. Do not edit them. No merge, push, deployment, real email,
user creation/deletion, external service changes, or credential access.
Leave your changes uncommitted for Codex to inspect and integrate. Use the
native Edit/Write tools for files; do not create files through shell commands.

## Outcome

Replace the current bare HTML paragraphs with a finished transactional email
for both new and returning members. One email/code path, no password or magic
sign-in link. The reference supplied by the owner has a white canvas, large
centered brand wordmark, short code label, large spaced code, one brief expiry
sentence, and a quiet footer. Use that hierarchy with ColorVerse's own identity.
Do not copy the reference brand, its actual code, legal text, or artwork.

Existing product decisions: eight digits, one-hour expiry, English product UI.
Preserve the literal dynamic `{{ .Token }}` placeholder. The token must remain
one contiguous selectable string; visual spacing belongs in CSS. Mention that
it is one-time, expires in one hour, and can be ignored if not requested.
Use a brief subject recommendation without embedding the code in the subject.

Design: calm typography, ample but mobile-appropriate white space, near-black
ColorVerse wordmark, restrained purple accent if useful. Reference existing
design tokens in `dist/design-system.css`. The code is the clear focal point.
Do not add promotional copy, hero illustrations, buttons, gradients, or cards
inside cards. Footer may link to the real `https://colorverse.byigit.dev/privacy/`;
do not invent a terms/support destination or claim legally approved terms.

## Email compatibility and verification

Use email-safe presentation tables, inline critical styles, system font
fallbacks, a responsive width around 560 px, and readable layout at 320 px.
No JavaScript, forms, external fonts, tracking pixels, image dependencies,
remote resources, or `ConfirmationURL`/`TokenHash` authentication links.
The core layout must survive clients that strip the head stylesheet.

Add minimal meaningful Node tests for the dynamic OTP contract and absence of
sign-in links/remote dependencies. No new packages. Codex will wire the test
into the main suite and render the email for final visual review. Run only:

    node --test scripts/test-auth-email-template.mjs
    git diff --check

## Delivery to Codex

Implement now; do not stop at a proposal. Return the base revision, edited
paths, design decisions, checks run and results, subject recommendation, and
any remaining limitation. Mark inbox/client rendering as NOT RUN unless you
actually tested it. Supabase must use this template for both signup
confirmation and magic-link/OTP emails; Codex will apply that after review.
