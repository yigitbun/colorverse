# SERUM-RENDERER-01A — one approved Katre bottle profile

Owner: Claude implementation; Codex review/integration.
Base: record the actual worktree HEAD before edits.
Branch/worktree: `codex/claude-serum`, `.local/worktrees/claude-serum`.
Status: prepared, not evidence of execution.

The owner approved starting with `docs/assets/katre-product-design-proof-v3.png`.
Codex copies the exact opaque 1254 × 1254 image, unmodified, to
`dist/assets/studies/katre-serum-v3.png`. This is not a new corpus palette.

## Only this delivery

Add an OPTIONAL serum profile to the existing photo-colorway engine and its
mounted preview; do not touch app/controller/UI/persistence in this task.
Keep the legacy Katre body photo and existing API/tests working by default.
An additive profile data module is fine; do not fork the full renderer lifecycle.

Allowed write files only:
- `dist/photo-colorway.js`
- `dist/katre-serum.js` (new profile module)
- `scripts/test-photo-colorway.mjs`
- `scripts/test-katre-serum.mjs` (new targeted test)

Read image and existing renderer before editing. Suggested additive entry point:
`mountPhotoColorway(host, { profile: KATRE_SERUM_PROFILE, colorway, baseline })`.
Actual API may differ if small and clear; report it exactly for the next task.

Five hand-annotated regions: body, label paper, cap, ochre collar + label rule,
and printed glyphs. Original Citrus Muse array order remains
`#C8D8A7 #BBA2D1 #E9947B #EAC843 #253B25`.
Use legacy surface assignment names for compatibility where useful:
`tube` = label (default role 0), `bottle` = body (2), `jar` = accent (3),
`cap` = cap (1), additive `ink` = print (4). No new palette roles.
The later UI keeps old saved careAssignment fields and freezes comparisons.

Do not use old ivory/dark material gates for this colored glass photograph.
Avoid flooding the whole scene. Keep all background/contact shadow/clear base
pixels unchanged. Preserve highlights/glass depth; mask edges must be inside
the silhouette, not cast colored halos. Label paper must not overwrite ink;
glyph recolor must not tint the whole label. Use explicit geometric/primary
pixel separation, not new external AI/segmentation calls. The profile must
report truthful surface bounds/note. Exact source-palette targets should retain
the approved photo (identity or at most RGB roundtrip rounding).

Checks: legacy test still passes; targeted synthetic tests for all five regions,
unmasked pixel invariance, independent print vs paper, deterministic
current/baseline, validation/immutability, optional-profile mount lifecycle,
and polygon bounds/dimensions. Test the new profile against the actual image
if feasible without installing packages; report browser proof as NOT RUN if
not performed. No fake visual acceptance from static tests.

No package/schema/DB/approval list, network/private data/auth/mail, image editing,
generation, other agent or deployment. Use only scoped tools. Preserve other
changes. Commit only the four allowed files on this branch, return task ID,
base/final commit, changed files, checks and actual API, then STOP.
