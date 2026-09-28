# STUDIO-UX-02 — focused Studio editing pass

Owner: one Codex-launched Claude Code session; three read-only subagents.
Codex reviews and integrates. Separate branch/worktree; launch supplies base.
No commit, push, deploy, hosted setting/schema/data changes or live emails.
Read AGENTS.md, coordination and current product decisions first.

## Implement now, in priority order

1. Widen the Studio page modestly without global layout changes. Remove the
   full-width Skincare / Footwear / Object bar outside the preview. Move those
   controls INTO the middle preview box, at its far left, beside the baseline /
   current-colorway preview region, NOT into Your palette. Keep a compact rail
   on desktop and a compact wrap on mobile, no redundant full-width spacer bar.
   Product controls must survive rerender, preserve selected state and keyboard
   tab navigation. Rename the Objects context tab to Products; internal context
   keys and saved contexts stay backward compatible.
2. Enlarge the left role rows slightly and make all non-control row padding/gaps
   a reliable shade-toggle target. The color square still opens Color Globe;
   drag handle and swap still work. The inline shade strip fills the whole row
   vertically and horizontally, no tiny precise targets or dead gaps. Clicking
   outside the open strip/row closes it without changing colors; Escape also
   closes and restores appropriate focus. Selecting a shade remains optional.
   Respect reduced motion and do not break existing drags/dialog/swap actions.
3. Replace visible CV / Care and CV / SS branding inside Studio and PNG export
   with Katre (established repository spelling). Do not rename palette IDs,
   rewrite member names or claim any real commercial product.
4. Screens: replace the generic Northstar task dashboard with one clean,
   minimalist Power-BI-style report preview: clear title/filter context, 3–4 KPI
   cards, a restrained trend and one comparison chart with readable labels.
   Use native HTML/SVG/CSS so current palette updates it live; no bitmap, remote
   scripts/fonts/images or actual Power BI integration. Explicit illustrative
   data disclosure. Keep text/axis contrast intentional. Reference direction:
   Bas Dohmen / How to Power BI's clean hierarchy, not a copied exact design.
5. Make Alternatives scope explicit: it edits the selected color only, not the
   full palette. Avoid the current surprising hue/saturation jumps on neutral
   colors: preserve near-neutral chroma and lightness in deterministic nearby
   alternatives. Do not invent harmony/quality scores or auto-curate corpus.
   No new whole-palette recommendation engine in this task.

## Read-only parallel audits

- `studio-interaction-audit`: trace role/shade hitboxes, outside close, drag,
  keyboard, dynamic product-picker bindings. Give the primary engineer checks.
- `studio-layout-audit`: middle-left picker placement, compact width/height,
  responsive layout and native live report integration. No redesign elsewhere.
- `studio-persistence-audit`: outline a smallest later 8–10-color Studio model
  that preserves ALL member colors but retains five explicit preview roles and
  current five-color project RPCs. Also outline Extract + color insertion.
  Report only, no writes. Do not implement variable count in this first pass.

Primary launches all three concurrently, alone writes allowed files, and checks
their results before delivery. No extra subagents or unrelated history/secrets.

## Writable scope

- dist/app.js, dist/studio/index.html, dist/studio-editor.css,
  dist/context-kits.css, dist/colorway-kit.js
- optional new dist/report-preview.js and dist/report-preview.css
- optional dist/color-alternatives.js
- scripts/test-context-kits.mjs, scripts/test-design-refresh.mjs,
  scripts/test-color-globe.mjs, new scripts/test-studio-ux.mjs,
  new scripts/test-color-alternatives.mjs, package.json (test registration only)

No other files without reporting scope need first. Cache-bust changed Studio
imports. Preserve all unrelated app paths and the current auth work. Existing
tests may be updated for owner-requested display changes, not weakened/deleted.
Use apply_patch for edits when available; otherwise the built-in Edit/Write
tools are the authorized file editing surface, never shell writes.

## Acceptance and delivery

Run npm run check:release once after edits, git diff --check, and relevant
targeted tests during development. Browser tests belong to Codex on an isolated
origin; Claude must not touch the owner's active localhost drafts/session.
Return base, exact changed files, actual PASS/FAIL/NOT RUN, and compact notes
for the later 8–10/Extract work. Leave files uncommitted for Codex review.

## Explicit later items, not discarded or silently implemented

- 8–10-color compact palette workspace with lossless saved/member handoff.
- Extract/Image to palette + insert color; numbered controls clarification.
- Existing supplied AI images in Inspiration/Library with honest study status;
  corpus import/editorial approval remains separately gated.
- Realistic live recoloring of an existing Katre product image needs a masked
  surface prototype, not whole-image tint or a false photo-recolor claim.
- Campaigns currently demonstrates poster/story/ticket uses. Owner requested
  explanation before keep/delete; leave it intact pending that decision.
