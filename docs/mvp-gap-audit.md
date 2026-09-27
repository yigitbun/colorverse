# ColorVerse MVP gap audit

Updated: 2026-09-27

Read [the handoff](handoff.md) and [open work](open-work.md) for the current
owner decisions, unfinished requests, rejected experiments and next-session
priorities. The evidence below distinguishes a fresh local check from historical
hosted checks; this session has not pushed or deployed.

## MVP verdict

The private palette-workbench implementation is close to release, but is not
yet declared production-ready. Local checks and hosted infrastructure checks
do not prove email delivery or authenticated save/resume. This hardening pass
has not published the new local changes. Community publishing remains outside MVP.

## Closed implementation items

- Account and Studio share passwordless email → eight-digit code access. Owner
  explicitly kept eight digits after considering six. Hosted token templates
  are saved; expiry, SMTP, PKCE and RLS remain unchanged.
- Failed requests never claim mail was sent; verification requires a session.
  Resend cooldown and concurrent-submission guards are covered by tests.
- Failed browser storage blocks custom-palette navigation with copy/export
  guidance. The current palette remains on the page rather than being lost.
- Failed account SDK/session restoration reports a visible local-draft error.
  Studio sign-out failure no longer claims success.
- Eight core tool routes have useful static no-JavaScript notices. This is a
  fallback, not a claim that interactive tools work without JavaScript.
- At the owner's request, Explore now displays four supplied AI product
  concepts with explicit indicators. Their colors/names are provisional, not
  approved Library entries. Seven external photos and source records are backed
  up outside `dist/`; old Studio URLs retain their colors without those photos.
  The eight-study experiment registry retains all five related Katre applications;
  only Room is shown on Explore, alongside Piera, Lorien pens and Lorien care.
- A separate unpassworded, browser-local Sandbox and the supplied HTML motion
  reference are available. RoomKit and the homepage globe controls are unchanged.
- Newly unnamed drafts get editable short name suggestions; existing names are
  preserved. No email-derived name or database identity changes are introduced.
- Consent-gated funnel events use fixed enums; emails, codes, colors, uploaded
  images and project names never enter their payloads. Review trends after launch.
- Fresh 2026-09-27 handoff check: `npm run check:release` validated 101 static
  files and passed 101/101 tests, with zero failures or skips on this machine.
  These are static/unit/mocked checks, not 101 real user journeys. The optional
  ignored local-photo backup check is separate from deployable-asset checks.
- Fresh 2026-09-27 `npm audit --audit-level=high`: zero known vulnerabilities.
- Fresh Git-only reconstruction of checkpoint `c949372`: 101 static files
  validated, 100 tests passed, zero failures, one optional local-photo-backup
  test skipped because ignored private material was not included. No dependency
  install, live mail, authenticated journey or browser smoke was performed by
  this reconstruction. Local commits are recorded in [the handoff](handoff.md).
- Earlier infrastructure evidence, **not rerun in the handoff session**:
  `npm run test:live` public routes/security headers, Analytics setup,
  100 legacy catalog rows / 500 color rows, and anonymous private read/write
  rejection passed. This is not a new release or content approval.

## Remaining release gates

### P0 — must be verified before calling it production-ready

- Complete one real account journey with the owner's inbox: create account,
  sign in, save a 2–24-color palette, open it in Studio, save a project, sign
  out and sign back in with private work intact. Any test-data deletion requires
  explicit approval; never erase an existing workspace merely to run a test.
- Complete the shared code-entry journey from Studio: request a code, verify it
  inside `/studio/`, save a version, and confirm the
  session is not presented as anonymous.
- Verify incorrect/expired codes and resend using a real inbox. Automated tests
  did not send mail, create users or consume live codes.
- Owner content decision: `approvedPaletteIds` is still empty. Individually
  approve the first images/palettes with source/rights records, or explicitly
  choose a limited launch with an empty curated collection. The eight AI concept
  studies and 100 legacy records are not automatically approved Library content.
- Owner/legal review: Account information is a factual preview notice, not
  final legally reviewed membership terms. Review launch notices before release.
- After owner publishing direction and Cloudflare deployment, run
  `npm run test:live:release`. Baseline infrastructure checks may pass an older
  hosted release; the candidate command requires the current code-entry and UI.

### P1 — should be closed during the MVP hardening pass

- Narrow viewport: Explore → Studio at 390 px preserved the selected color and
  four supporting colors. Extract → Studio preserved all five colors including
  a manual sample-point edit. Both journeys had no horizontal overflow.
- Studio Projects at 390 px opened a usable signed-out code-entry form with a
  disabled Continue until valid email input; browser warning/error logs empty.
- Direct `reef-current` palette URL → Studio restored its five original colors
  at 390 px. Studio → Account opened the unified entry; valid email enabled OK
  and clearing it disabled OK. The information dialog opened with readable
  content, and Account had no horizontal overflow. No code was requested.
- Static no-JavaScript notices and storage/SDK failures are tested, not a fully
  automated no-JavaScript browser journey. Repeat the narrow-screen smoke check
  on the hosted release after deployment.
- Conduct a small funnel review after the first real users: palette started,
  palette applied in Studio, export copied, sign-in started, project saved,
  and project resumed. Do not record uploaded images, project names, or user
  palette values.

## Explicitly not MVP blockers

- Public Community submission, voting, comments, image publishing, and
  moderation. The product decisions require accounts, durable storage,
  reporting, provenance, and takedown before these are opened.
- AI scene/material recoloring. RoomKit remains a labeled browser-local Lab
  experiment until semantic surface mapping is real.
- Payments, waitlists, cross-device image storage, and a second deployment
  environment.
- Database-backed editorial cutover remains a review draft: test migration,
  RLS and rollback before applying it. The local Library engine already exists.

## Definition of done

ColorVerse can be called MVP when the P0 journeys pass in the hosted
environment, the P1 narrow-screen smoke pass has no blocking issue, and the
public UI continues to describe Community and Lab prototypes honestly. Keep
the manual owner/inbox gates open until evidence exists; do not equate passing
tests or preparing a release with publishing it.
