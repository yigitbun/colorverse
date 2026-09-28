# CORPUS-RESEARCH-01B — correct evidence and original-value handling

Owner: Claude research; Codex independent scope/evidence review.
Worktree/branch: `.local/worktrees/claude-corpus-research` /
`codex/claude-corpus-research`; base `f6693f8221e39a350eaeb3f78db5d394bb1bc403`.
Same session `06598d4e-d8c5-4af5-add9-0acfa91db048`, now no MCP access.
Allowed files remain only the source-audit Markdown and source-candidates JSON.

Correct the first delivery before integration; do not expand source count:

1. Wada cannot be declared protected until 2037 just by applying today's life+70
   term. Official Japan Agency for Cultural Affairs Q4 says the 2018 extension
   does not revive already-expired copyright. Read
   https://www.bunka.go.jp/seisaku/chosakuken/hokaisei/kantaiheiyo_chosakuken/1411890.html
   and remove the unsupported verified-restricted/2037 claim in BOTH outputs.
   Use unresolved, edition/territory-specific clearance required. Do not replace
   it with a universal free-to-use claim. Modern editions have separate rights.
2. The brief accepts original numeric values in their original space; it never
   requires HEX. Original Munsell/xyY may be collected without converting it.
   Correct the NBS eligibility reasoning and global empty-list explanation:
   numeric tables were not actually read/verified yet, so no candidate was
   transcribed in this first pass. Do not invent raw values or perform a new
   conversion. Preserve source-original versus derived display values.
3. An item being sold does not itself verify its full reuse license. Label CIE
   as commercial/reference-only pending exact terms, not independently cleared
   for redistribution. Keep source-level rights evidence and unknowns separate.
4. Remove unsupported secondary claims (e.g. Pantone lineage). Distinguish
   secondary discovery from final primary evidence. Do not claim exact tool
   counts or page fetches that were not verified. Paraphrase the RIT wording;
   keep verbatim quotations from a non-public-domain source under 25 words.

These are evidence corrections, not corpus editorial approval. No new palettes,
images, external messages, data imports or application/schema changes. Check
JSON validity with node (not Python), diff-check, commit only the two files,
return exact SHA/corrections/open questions and STOP. Keep this a short task;
the supplied official source plus existing evidence is sufficient.
