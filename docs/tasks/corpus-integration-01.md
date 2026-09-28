# CORPUS-INTEGRATION-01 — architecture assessment only

Owner: one Codex-launched Claude Code session with three read-only subagents.
Codex reviews the report and presents it to the product owner. Implementation
requires a new owner approval after that presentation; stop at the assessment.
Branch `codex/claude-corpus-assessment`, isolated worktree
`.local/worktrees/claude-corpus-assessment`. Launch prompt supplies exact base.
Sole permitted output file: `docs/color-corpus-integration-assessment.md`.
No source code, migrations, schema files, runtime data or other docs may change.

## User's responsibility split

The external corpus team owns research, sources, licenses, palette creation,
names, roles, structural/perceptual metadata, methodology, provenance,
application contexts/visuals and editorial approve/revise/reject decisions.
Codex/Claude handle only validation, import, persistence, product exposure
and correct rendering of externally supplied approved records.

Do not research or ingest Wada, scrape Adobe/other palette platforms, generate
palettes/visuals, create placeholder records, claim harmony/scientific scores,
build an autonomous generator, CMS, workflow engine or editorial platform.
Positioning is research-informed and editorially curated; never scientifically
optimal. No other Claude/ChatGPT project history needs to be read.

Keep source-based interpretations distinct from ColorVerse Originals. Preserve
source material, original source colors, license/attribution, interpretation,
added/modified colors, visual provenance and editorial state independently.
The incoming palette is a usable design system; example corpus roles are
Foundation, Primary, Secondary, Accent, Neutral. Inspect current Studio role
semantics before suggesting a mapping; do not silently equate the two sets.

## Parallel code inspection

Start these named read-only subagents in parallel:

- `corpus-model-audit`: current palette/color/role representations, static vs
  database/member differences and stable IDs. Cite paths and line numbers.
- `corpus-product-audit`: Library/Explore consumers, images/application visuals,
  search/matching, cards and Studio handoff. Trace actual entry points.
- `corpus-editorial-audit`: existing provenance/rights fields, approval gate,
  publication state, naming helpers, editorial SQL drafts and their deployment
  status. Do not treat a draft schema as active architecture.

Subagents have Read/Grep/Glob only, no writes or nested agents. Primary Claude
consolidates their evidence and alone writes the assessment. The repository is
readable; credentials, personal/ignored backups/transcripts and unrelated AI
projects are outside scope. No network, test runs, dependency installation,
database calls, live mail, commit/push/deploy or implementation.

## Deliver A–G, in Turkish

A. Current relevant architecture: palettes, colors/roles, Library/Explore data,
   images/visuals, provenance/source fields, editorial/publication states.
B. Already reusable components and gates.
C. Actual gaps required by the supplied corpus brief.
D. Smallest proposed model extensions; preserve existing member/private data.
E. One proposed import contract selected after code inspection (JSON/CSV are
   suggestions, not a final producer contract yet). Outline required fields,
   subtype-specific validation and invalid/duplicate/update behavior without
   generating sample palette content. Distinguish preservation from display.
F. Approved record → validation → import → persistence → Explore/Library,
   with explicit publication gate and existing Studio handoff compatibility.
G. Only implementation decisions that truly need product input; propose a
   reasonable default for reversible technical choices. Clarify product-role
   mapping and actual approved producer input if they remain missing.

Prefer existing architecture + small extensions + a plain import/validation
pipeline. No substantial implementation. No new scientific model. Preserve
deep provenance distinctions and reject unapproved publication. State which
statements are code evidence versus proposals. Address local-first static
storage versus new hosted machinery based on the existing application, not
assumptions. Include a short source map; aim for a focused, readable report
(roughly 1,000–1,500 words), not a new roadmap. Wait for every subagent result,
finish the report, return paths and constraints, then STOP for owner approval.
