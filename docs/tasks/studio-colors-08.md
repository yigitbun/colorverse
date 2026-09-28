# STUDIO-COLORS-08 — preserve every incoming palette color

Owner/writer: Claude Code; coordination, exact-revision review and integration:
Codex. Prepared from clean main `c36b19f`; implementation base is the subsequent
assignment-only commit. Branch `codex/claude-studio-colors`, separate worktree
`.local/worktrees/claude-studio-colors`. Do not write the shared main checkout.
Status: prepared, not yet started. Codex will record the actual session/start.

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
