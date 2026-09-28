# CORPUS-RESEARCH-01A — primary sources and traceable source colors

Owner: Claude research; Codex scope/integration review; product owner final
editorial approval. Status: prepared, not started.
Worktree: `.local/worktrees/claude-corpus-research`;
branch: `codex/claude-corpus-research`. Start from the local checkpoint
containing this brief; Codex supplies exact base SHA before dispatch.

## Responsibility change

The owner's latest instruction assigns Color Corpus research and collection
to Claude, superseding the earlier external-team-only research restriction.
Codex does not independently curate or generate corpus palettes. Research
candidates are NOT approved product records. The integration assessment and
its proposed contract remain proposals; no runtime import or DB work here.

## Small first delivery

1. Verify up to six primary sources: roughly three academic/methodology sources
   and three original historical/reference collections with explicit rights
   statements. Prefer useful, well-documented sources, not a target count.
2. For each, record title, author/institution, publication/access dates, direct
   evidence URL, why useful, applicable limitations, exact rights-statement
   URL and whether rights are verified, restricted or unresolved. Distinguish
   permission for the text, plates/images, data and derived interpretations.
3. Collect at most one small source-color candidate (3–8 colors) only if a
   primary source actually supplies authoritative numeric color values and
   an appropriate reuse basis. Record original values/space/conditions,
   source locator and any conversion explicitly. Do not pretend a scan's RGB
   pixels are the historical original or invent HEX values to fill the slot.
   If no eligible numeric set exists, deliver an honest empty candidate list.

Allowed output files only:
- `docs/research/corpus-source-audit-01.md`
- `data/research/corpus/source-candidates-01.json`

Use a lightweight research manifest, not the final interchange schema. Keep
source-original colors separate from future ColorVerse modifications/added
colors. Include `editorialStatus: research-candidate`, never approved.

## Boundaries and delivery

Read AGENTS, coordination, current handoff/product decisions and the existing
corpus integration assessment first. Use official research papers, authors,
museums, libraries or publishers, not palette aggregators/blog assertions.
Short source summaries and direct citations only; no whole copyrighted plates
or books. Do not scrape Adobe Color or other palette platforms, bulk-ingest
Wada, generate new palettes or application visuals, invent harmony scores,
scientific-optimality claims, or change app/schema/approved IDs.

One read-only helper may independently verify source/rights claims if useful;
it has no file ownership. Primary Claude remains the single report writer.
No private AI projects, inboxes, user data, paid services, hosted mutations,
installation, deployment or pushes. Local task commits are allowed.

Finish this first small source audit, commit only allowed outputs and return
base/final SHA, direct evidence links, actual checks, unresolved rights and
the next smallest collection task. Then STOP for review. An honest lack of
numeric data or clear rights is a result, not permission to fabricate content.
