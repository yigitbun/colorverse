# EXTRACT-READINGS-15A — Three honest image readings

Owner: Claude Opus 5.5; Codex reviews/integrates. Read AGENTS.md,
docs/agent-coordination.md, and this brief. Writable: `dist/color.js` and
focused existing extraction/color tests only. Do not edit `dist/app.js`, HTML,
CSS, image files, corpus, Supabase or deployment.

## Problem seen by the owner

On a supplied white/navy sales-dashboard illustration, Adobe finds a coherent
navy/blue/green/light/coral palette. ColorVerse's Observed reading is dominated
by near-white and grey shades, so the meaningful accents are lost. The owner
wants the existing three readings used intelligently, but in our own style;
do not clone Adobe values or UI. The source dashboard is available read-only at
`/Users/bunyaminyigit/Downloads/ChatGPT Image Sep 28, 2026, 10_03_12 PM.png`.
Do not commit/copy that image. Use small deterministic synthetic image-pixel
fixtures in tests so the behavior is reproducible.

## Scope and acceptance

- Inspect `extractPaletteVariants()`; preserve the public return contract and
  deterministic local-only operation. Preserve exact user-picked point edits
  outside this function.
- Make Observed represent dominant image colors *without* filling all five
  slots with tiny variations of an enormous neutral background. Among eight
  sampled clusters, retain meaningful chromatic regions when truly present;
  keep a genuinely monochrome source honest (no invented accent).
- Make Focused prioritize distinct source accents and visual emphasis more
  strongly than Observed. Avoid derived colors masquerading as exact samples;
  if a tone is adjusted, the reading's metadata/description must say so.
- Make Applied a deliberate functional five-color interpretation: at least
  one quiet surface, a usable foreground/ink pair, and source-related accent
  when present. Derived colors are allowed here and clearly labeled.
- Avoid exact Adobe palette matching, scientific-optimality claims, corpus
  dependencies and arbitrary harmony scores. Test colorful dashboard-like,
  monochrome and transparent inputs; three readings should be meaningfully
  distinguishable for a multicolor image, never emit invalid/duplicate HEX,
  and not collapse into five greys when distinct accents are present.
- Test performance on the existing sampled 128×128 pipeline; no image upload
  or remote calls.

Run focused/full checks and `git diff --check`; commit locally if permitted,
report exact revision and any tradeoffs. No push/deploy.
