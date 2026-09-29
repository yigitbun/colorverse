# STU-12 — richer Sales performance preview

Owner: Claude implementation; Codex review/integration. Status: integrated locally; not published.
Branch `codex/claude-studio-report-12`, worktree
`.local/worktrees/claude-studio-report-12`; base is Codex's assignment commit.

## Direction

The owner says the animated Screens sales report is too basic and wants more
from the supplied visual reference (read-only):
`/Users/bunyaminyigit/Downloads/ChatGPT Image Sep 28, 2026, 10_03_12 PM.png`.
It has a clean title/filter hierarchy, four KPIs, trend, channel mix, regional
and category breakdowns, and concise takeaways. Translate that information
architecture into our own compact Studio preview; do not clone the graphic,
its brand, exact figures, layout, or all its panels. No image generation.

## Scope / acceptance

- Preserve four KPIs, the existing trend and region comparison, neutral canvas,
  palette-driven accents/swatches, and one-shot entry motion with reduced-motion
  support. Enrich the preview with at least channel distribution, category
  breakdown, and 2–3 evidence-backed takeaways. Date/filter context can become
  clearer but must not imply live interactive filters or a real data connection.
- Keep a legible hierarchy at Studio widths, including 390px. Responsive cards
  must not create page overflow or microscopic labels. The result should feel
  meaningfully richer but not cram the entire reference dashboard into Studio.
- All illustrative numbers and labels must agree with each other; totals and
  percentages must reconcile at the shown precision. Insights must be derivable
  from the displayed data. Add tests for integrity and markup. The footer must
  remain explicit that this is illustrative, not live Power BI/data.
- Existing saved legacy Report presentation stays unchanged. No network/data
  fetches, external assets, permissions, chart package, or domain changes.

## Allowed files

- `dist/report-preview.js`, `dist/report-preview.css`.
- Focused tests for the report, especially `scripts/test-context-kits.mjs`.
- This brief for factual delivery evidence.

No `dist/app.js`, Studio HTML, shared CSS, main checkout, package manifest,
Supabase or deployment. Codex will handle stylesheet cache version and pin
after integration. Use isolated local browser for QA if possible, blocking
external account/analytics. No push or publication.

Run `npm run build`, focused tests, and `npm run check:release` if feasible.
Report exact PASS/FAIL/NOT RUN, base/final SHA, changed files and limitations.

## Delivery (Claude, 2026-09-29)

Status: delivered on the task branch for Codex review.

- Added channel mix (palette-toned ring + legend), category breakdown (share and
  change vs PY) and three takeaways; kept four KPIs, trend, region vs target,
  neutral canvas, swatches and one-shot entry motion. Scope is a labelled,
  fixed chip row with no controls; footer keeps the illustrative disclaimer.
- KPI strings, shares and takeaways are derived from base figures. Channels,
  regions and categories each total €4.82M; shares total 100% (largest
  remainder). Prior-data inconsistency fixed: AOV now reads ▲2.4% (revenue
  +6.4% over orders +3.9%), replacing ▼0.8%.
- Panels are size containers; trend axis labels step up as a panel narrows.
  New slices, category bars and takeaways animate once and stop under reduced
  motion. Trend month labels are now Feb…Dec (even spacing, no clash at 390px).
- Local QA: isolated headless Chromium, temporary profile, all off-origin
  requests blocked (none attempted). Studio Screens at 1440/1024/800/390px:
  no document or report overflow, smallest visible text ≥9px apart from the
  existing decorative 8px ▲, no page errors.
- `dist/app.js` still imports `report-preview.js?v=2`; Codex should bump that
  JS pin with the stylesheet pin at integration.

## Codex integration (2026-09-29)

Reviewed Claude `7fe1d51854e7e0064d46ef19436e01e6bd6b8ecf` and integrated
as `1bd6f95`; cache pins updated in `0fbddea`. Main `npm run check:release`
passed 234/234. Isolated local browser at 1280/390px after declining optional
analytics showed no page/report horizontal overflow; both views visually
reviewed. Public deployment and owner acceptance remain open.
