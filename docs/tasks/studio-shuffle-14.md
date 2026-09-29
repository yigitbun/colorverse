# STU-14 — visible Studio palette Shuffle

Owner: Claude implementation; Codex review/integration. Status: assigned.
Branch `codex/claude-studio-shuffle-14`, reuse clean worktree
`.local/worktrees/claude-studio-card-globe-13`; base is Codex's assignment
commit. This branch must start from the current local `main`.

## Outcome and placement

The owner wants **Shuffle** above Color 1, clearly visible. It rearranges the
existing palette members; it does not generate/replace colors. Put a labelled
button in the expanded left inspector after the palette title/count and before
the member rail, visually distinct from the add-color plus below the rail.
Give it a recognizable shuffle icon and concise explanatory text/tooltip such
as “Mix order · keep colors”. On 390px it remains visible and easy to tap.
Collapsed rail may show an accessible icon button or reveal expanded rail on
activation; never show a squeezed/ambiguous label. No decorative hidden-only
control. Do not add a Generate action in this task; Codex will decide its
distinct place and semantics with the owner.

## Behavior

- Use a sound Fisher–Yates permutation with `crypto.getRandomValues` where
  available and a safe fallback, retrying/adjusting if it yields the original
  order. Palette size is 2–24; one click must visibly change order. No HEX is
  created/deleted and no palette is applied to live external data.
- Preserve workspace validity, role mapping, shade anchors, save/reload and
  preview. For exactly five members the five preview slots follow reordered
  positions, as existing member drag does; with 2–4 or 6–24 members, preserve
  role-to-color identity across permutation as existing drag does for >5.
  Choose active/focused color identity sensibly and announce new order in the
  existing live region. Keep card click/Globe and grip drag behavior intact.
- No page reload. Explicit action only. If implementable cleanly, give a
  one-step Undo affordance after shuffle; otherwise report the tradeoff to
  Codex, do not build a global history system.

## Allowed files

- `dist/app.js` Studio shuffle flow only; main's unrelated dirty homepage zoom
  must not be copied or altered.
- `dist/studio/index.html` Studio rail markup/cache pin only.
- `dist/studio-editor.css` shuffle control/responsive styling only.
- Focused Studio tests under `scripts/`; this brief for factual delivery notes.

No shared docs, main checkout, Supabase, deployment, package manifest or
unrelated features. Use isolated local browser, blocking off-origin requests.
Run build, focused tests, drag/add/card-globe/smoke browser checks and release
check if feasible. Report exact PASS/FAIL/NOT RUN, base/final SHA and changed
files. Commit only assigned files; no push.
