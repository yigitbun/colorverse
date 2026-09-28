# STUDIO-FOCUS-07 — obvious editing, result-first Studio

Owner/writer: Codex lead only. Base `3147a12`; main initially clean.
Status: delivered locally; owner visual acceptance pending. Claude capacity
remains reserved; no agent calls.

Owner explicitly requests: colorful direct Studio startup; remove the product's
Apply palette colors panel; move shades entirely to the visible right tools;
narrow collapsible left palette rail, showing only swatches when collapsed;
obvious one-click right-side adjustments rather than hidden interactions.
This supersedes UX-05A's left-inline-shades decision.

Allowed: app controller, Studio HTML/CSS, photo CSS, existing color-alternatives
helper/tests, affected regression tests/cache pins and status documentation.
Preserve saved/resumable palettes, all members/role mappings, careAssignment,
baseline, source image and export contracts. A colorful default applies only to
a new Studio draft, not existing sessions or the homepage. Larger palettes keep
explicit assignment through selected-color tools; no truncation or auto remap.

Acceptance: actual fresh/direct opening, select a color without editing, visible
shade and quick adjustment, explicit Globe/cancel, collapse/expand preserving
state, 5/10 members, comparison/restore and narrow-screen overflow checks.
Run release checks. Isolated preview origin; do not operate owner 4202 drafts.
No new image/corpus, hosted auth/data, Claude calls, push or deployment.

## Delivery

- Fresh Studio-only draft uses the existing serum source colors / Citrus Muse;
  URL-requested and resumable drafts keep precedence. Homepage neutral fallback
  remains unchanged. No existing draft is migrated or overwritten.
- Product's Apply palette colors panel and its event listener are removed.
  Saved surface mapping, fifth-slot Print, baseline and export remain intact.
  Comparison/export share the compact product header. Photo size is bounded
  by viewport height (up to 420px), keeping the actual bottle visible.
- Left rail: 184px expanded / 64px collapsed on desktop; only swatches and
  expand control remain when collapsed. Mobile uses a horizontal, internally
  scrollable strip. Larger lists scroll within the rail, not lengthen the page.
  Collapse/selection are presentation-only and emit no project edits.
- Right tools: always-visible 21 anchored shades, Click to apply, Lighter /
  Darker / Softer / Richer, explicit Color Globe and named next-color swap.
  Neutral no-op intensity controls are disabled; selecting the same shade or
  preview position does not create an edit. Alternatives/contrast/tray remain.
- Extra palette members keep one-click explicit Use in preview choices on the
  right. Editing an unassigned member doesn't alter the five preview colors.

## Checks actually run

- `npm run check:release`: 111 static files; 189 PASS / 0 FAIL / 0 skipped.
  `git diff --check` PASS. App v103, Studio CSS v16, photo CSS v6,
  color-alternatives v3. No package/dependency/storage-schema changes.
- Isolated 4203 actual browser: fresh no-query colorful startup; select-only
  color operation leaves export unchanged; collapse/expand and retained
  selection; visible shade, retained original shade anchor, quick darker;
  Globe/cancel; baseline restore; named swap and exact five-HEX restore.
- Local Extract using unchanged repo v3 PNG → 10 members; unassigned edit
  preserves preview; explicit placement replaces Body's member, all ten values
  retained; full JSON export and role map identical after reload. Temporary
  sampling is QA, not an approved palette/corpus record.
- 320px five-member expanded/collapsed views and ten-member selection checked;
  document width/scrollWidth both 320, internal rail scroll only. On desktop
  ten-member list is bounded (360px at 720px viewport). Console warn/error empty.
- Final deliverable `http://127.0.0.1:4203/studio/?p=custom-concept-piera`:
  original five colors restored, temporary comparison cleared, rail collapsed.
  Temporary Extract QA tab closed; viewport reset. Owner 4202 tab/draft was
  not operated on. Real inbox/private save/device PNG remain NOT RUN.
