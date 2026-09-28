# STUDIO-COLORS-08 — preserve every incoming palette color

Owner/writer: Claude Code; coordination, exact-revision review and integration:
Codex. Prepared from clean main `c36b19f`; implementation base is the subsequent
assignment-only commit. Branch `codex/claude-studio-colors`, separate worktree
`.local/worktrees/claude-studio-colors`. Do not write the shared main checkout.
Status: delivered, reviewed and integrated locally; owner acceptance of the
original reported journey remains pending. Actual implementation base `e69731f`. Claude Code session
`1e38f465-63e3-45dd-b455-dc4e03d68b3b`, requested and reported model
`claude-opus-5-5`. Visible live conversation: `http://127.0.0.1:4205/`.
Claude delivered `2e8d179` and follow-up `6e3f334`; reviewed local main commits
`c2b63e1` and `f352b8d`. No active implementation writer; no push/deployment.

## Owner's current instructions

The owner reports palettes with more than five colors getting cut to five in
Studio. Every original color must arrive and remain selectable/editable. The
owner now explicitly requests Claude for engineering, superseding the previous
capacity reservation. Do not have Codex implement the task instead of Claude.

## Narrow assignment

Find the actual loss point, not just a five-role renderer slice. Inspect each
existing handoff (Extract, Account/member palettes, Library/Explore, direct or
resumed Studio, project/template) and distinguish the full member palette from
the five preview slots. Prior isolated Extract→Studio 10-member QA passed;
that does not disprove the owner's different path. Report reproduction and
which route has a demonstrated bug. Never operate the owner's 4202/4203 drafts.

Implement the smallest verified fix. Preserve every incoming HEX, order and
existing preview assignment; never silently slice, deduplicate, pad, or remap
the full palette. Existing five-slot product renderers may keep five selected
colors. All 5–24 members must survive navigation/reload/export/private editor
serialization and be reachable in the narrow/collapsed rail. A valid full
workspace must not be accidentally replaced by a five-color derivative. Do not
resurrect stale/invalid data by ignoring validation. Preserve old five-color
snapshots and the current neutral labels, right shades, comparison and photo.
If no source bug is demonstrated, report that honestly and the evidence needed;
do not invent a root cause or make speculative destructive persistence changes.

Allowed implementation files: `dist/app.js`, `dist/studio-members.js`,
`dist/palette-handoff.js`, `dist/studio-editor.css`, `dist/studio/index.html`,
`dist/member-palette.js`, `dist/account.js`, `dist/project-store.js`,
`dist/study-gallery.js`; directly affected existing `scripts/test-*.mjs`;
new narrow helper/test only if necessary (ask Codex for scope first).
Other route HTML files may change only existing app/helper/CSS cache pins.
Do not change auth, dependency manifests, SQL, generated visuals, corpus data,
main planning documents, hosting or public content. Return scope-expansion
requests instead of touching other files. Codex remains the only writer of
shared status documentation. One read-only Claude subagent may inspect handoff
or persistence in parallel; no additional implementation writer.

## Acceptance and delivery

- Add meaningful behavioral regression cases for 8/10 and bounded 24 members,
  preserving values/order/role map. Include the demonstrated failing handoff.
- Check five-member compatibility, selection/edit of an unassigned member,
  explicit preview placement, reload and full JSON export. DOM-only/static
  assertions do not substitute for a real journey. Codex can do isolated UI QA;
  do not claim browser execution if your tools cannot provide it.
- Run targeted tests, then `npm run check:release`, `git diff --check`. No live
  mail, account creation, hosted config/data, private-user drafts or deployments.
- Make a local task-branch commit of only allowed files. No push/merge/deploy.
  Return task ID, base/final hash, changed files, root cause and reproducible
  steps, PASS/FAIL/NOT RUN evidence, remaining limits. Wait for Codex review.

After this task, propose the next smallest already-authorized engineering task
from open-work; do not autonomously redesign the product or implement pending
owner decisions. Future engineering stays with Claude, sequential file ownership.

## First delivery and bounded follow-up, STUDIO-COLORS-08A

Claude delivered test-only `2e8d17983ff435cf95989a3fc145cdce06d51908` from
`e69731f`, adding 8/10/24-member helper/storage round trips and keeping the
stale-workspace validation guard. Codex inspected this exact diff. The first
delivery is an audit, not a fix for the reported user experience.

Codex actual isolated-origin browser observations (4204, no owner drafts):
- Extract unchanged repo serum PNG, insert five samples → 10 colors → Studio
  → normal home → header Studio: all ten original HEX values/order survive.
- Expanded rail at 720px viewport: 10 DOM buttons, container 360px high versus
  529px content; Color 7 partially clipped and Colors 8–10 below the visible
  container. There is no visible member-count/overflow explanation. Data is
  present, but the UI makes it look like a smaller palette.
- Same ten-member draft → `/home-test/` → Hue slider End → Apply color → Open
  Studio: exactly five colors remain. This independently confirms Claude's
  legacy-route finding, not proof that the owner used that route.

Follow-up base `2e8d179`; same Claude session/branch/worktree and sole writer.
Original writable scope remains, additionally permitting `dist/home-test/app.js`
for only the demonstrated handoff preservation bug, `dist/home-test/index.html`
for its cache pin, and necessary narrow behavioral regressions in existing
tests. Read this follow-up in the main checkout; do not edit main documents.

1. Make 8–10 colors apparent and directly selectable in a compact expanded rail
   without elongating the page: a small two-column arrangement is acceptable.
   Keep the skinny collapsed rail swatch-only and make additional colors clear;
   retain contained scrolling for up to 24 with an obvious count/scroll cue.
   Keep accessible targets and keyboard selection, neutral labels and no hidden
   editing. Avoid overflow at 320px; preserve the photo's main visual area.
2. Fix the demonstrated legacy writer so editing a five-slot projection updates
   the matching full workspace instead of persisting inconsistent data. Preserve
   unassigned members, member order and role map; new explicit palette choices
   remain new choices. Do not loosen Studio's validation or silently merge stale
   data there. Do not remove/archive/redirect/rewrite the legacy page: HQ-03's
   cleanup decision stays open. If this cannot be done narrowly, report why.
3. Test 5-member compatibility, 8/10 visibility, 24 scroll reachability, legacy
   edit/swap round trip, unassigned edit and explicit placement, full export and
   reload. Run release checks and submit one new local task-branch commit.
   Codex will perform actual UI QA of the exact revision. No push/deploy.

## Final delivery and evidence

- Claude Opus 5.5 implemented the changes; Codex did not write application
  fixes. Exact submitted revisions above were inspected and integrated;
  `git diff codex/claude-studio-colors -- dist scripts` is empty after integration.
- 6–24-member expanded rail uses two compact columns with a visible total.
  At 720px height, eight members occupy 248px and ten 309px: every swatch visible.
  Collapsed rail remains 64px and swatch-only, with a numeric count; scroll/fade
  indicates extra items. Keyboard Up/Down follows rows; End reaches the last
  member. On mobile the existing internal horizontal strip gains a swipe cue.
- Legacy `/home-test/` explicitly syncs five-slot edits back into their mapped
  members and swaps role assignments; unassigned values/order survive. Studio
  validation remains strict. No legacy removal/redirection or HQ-03 decision.
- Cache pins: app v104, Studio CSS v17, workspace helper v4, legacy app v83.
- Codex actual isolated 4206 browser on immutable `6e3f334`: ten-member Extract
  handoff, all ten visible, keyboard row selection, unassigned quick edit
  leaves preview unchanged, explicit placement, identical full JSON/map after
  reload, collapsed End→Color 10, 320px collapsed/expanded with document width
  and scrollWidth both 320. Legacy Hue End→Apply→Open Studio now keeps ten,
  exact role map and all unassigned values. Eight-member all-visible check and
  explicit existing five-color Citrus Muse compatibility also PASS. Console
  warn/error empty; viewport reset. Owner 4202/4203 drafts were not operated.
- Earlier 4204 developed while the worker changed cache pins before CSS; its
  cached partial stylesheet was not accepted as final evidence. Final tests used
  a fresh 4206 origin after delivery. No public cache/hosting changes were made.
- Claude worktree release: 111 static / 192 PASS / 1 private-backup SKIP;
  integrated main: 111 static / 193 PASS / 0 FAIL / 0 skipped. Diff check PASS.
- 24-member helper/handoff/persistence/export cases PASS; actual 24-member UI,
  authenticated save/resume, inbox and device PNG NOT RUN. The owner's original
  route was not supplied; do not attribute that report to home-test as fact.
- Visible Claude conversation stays at `http://127.0.0.1:4205/`. The separate
  4206 ten-member view is a temporary QA draft, not approved corpus content.
  Remaining product decisions and release gates stay open.
