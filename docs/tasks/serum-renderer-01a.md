# SERUM-RENDERER-01A — one approved Katre bottle profile

Owner: Codex fallback worker implementation; Codex lead review/integration.
Base: `06f78e4`.
Branch/worktree: `codex/claude-serum`, `.local/worktrees/claude-serum`.
Status: Claude call `678a9c81-9fff-4f46-82c0-842f87ac4b86` stopped at 100%
five-hour quota with no edits. Write ownership transferred to the Codex worker
`01a0e7c0-5314-70f2-b2e4-831c2749a939`; delivery `f4eff775` reviewed in full and
cherry-picked locally as `903f9ea`. This is not a Claude delivery. Worker stopped;
Codex lead owns the reviewed implementation and subsequent integration changes.

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

## Delivery and lead review

The four scoped files implement the optional profile above, reusing the original
mount/update/baseline/destroy lifecycle and Oklab helpers. Print always follows
preview role 4 (Text); it does not introduce a fifth persisted assignment key.
Eight hand-bounded polygons separate five surfaces. Label occludes body; glyph
masks do not tint the whole label. Clear base (y ≥ 1014) and unmasked source
pixels are invariant. Source colors/defaults return the exact approved bytes.

Worker: 19 targeted tests, build and diff-check PASS. Actual PNG is decoded
read-only with built-in zlib for region/identity/invariance tests; no bitmap edit.
Lead: full implementation/test review, integration and browser comparison on
isolated local origin 4201. Lavender/dark-green/pale body, ochre label, coral cap
and pale print edits were visibly checked; no whole-scene spill observed.
This is an approximate digital preview, not physical/material color proof.
Lead shortened the visible disclosure after browser review. Full release
checks: 185 PASS. Device PNG file, mobile browser, live auth and public deployment
were NOT RUN in this delivery.
