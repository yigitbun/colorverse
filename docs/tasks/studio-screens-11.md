# STUDIO-SCREENS-11 — calm report surface and entry motion

Owner/writer: Claude Code Opus 5.5; Codex reviews/integrates. Prepared from
clean main `1245cb7`; implementation base is this assignment's docs commit.
Branch `codex/claude-studio-screens`, worktree
`.local/worktrees/claude-studio-screens`. Status: prepared, not started.

The owner supplied `/Users/bunyaminyigit/Downloads/ChatGPT Image Sep 28, 2026,
10_03_12 PM.png` as a visual direction: a light, spacious, professional sales
dashboard. It is *not* an instruction to copy the graphic or data. The owner
says its density is a little overkill for the Studio preview. Current native
report is in `dist/report-preview.js` / `dist/report-preview.css`. The current
canvas takes `--p-bg`, which can become saturated orange or black; the report
must take responsibility for a consistently readable neutral canvas while
still showing selected palette colors as deliberate accents and honest swatches.

Implement the smallest responsive refinement of this report only: neutral
surface, legible typography/cards/charts across light/dark/vivid palettes,
without treating a random palette member as the whole page background. Add
short, one-shot chart entry motion when the Screens markup mounts (SVG line
draw and bar growth are options); no endless loop, no motion on palette edits
unless it remounts, and honor `prefers-reduced-motion`. Existing illustrative
figures/labels must remain internally consistent and clearly not live data.
The owner-supplied `dist/sandbox/one-shape/` is read-only motion inspiration,
not a dependency or code source. Keep four KPIs and the two current charts;
do not reproduce every panel in the reference image or add remote assets.

Writable files: `dist/report-preview.css`, `dist/report-preview.js` only if
necessary, and directly affected existing `scripts/test-context-kits.mjs`.
No `app.js`, Studio HTML/cache-pin, shared CSS, data, dependencies, auth,
corpus or deployment. Codex will handle the stylesheet pin after integration.
Ask for scope expansion if unavoidable. This is independent of
STUDIO-SHADES-10; never edit its files.

Acceptance: report canvas stays calm for very dark, saturated and very pale
five-color palettes; text and chart labels remain readable; palette influence
remains visible but does not hijack the surface. Narrow layout does not
overflow. Animation fires on report entrance, stops, and respects reduced
motion. Add focused checks; run targeted tests and `npm run check:release`,
`git diff --check`; make one local task commit and report exact revision,
PASS/FAIL/NOT RUN evidence. Browser QA can be performed by Codex on isolated
origin. Stop for review; do not push or publish.
