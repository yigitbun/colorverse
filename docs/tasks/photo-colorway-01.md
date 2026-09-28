# PHOTO-COLORWAY-01 — existing Katre image, live masked prototype

Owner: a separate Codex-launched Claude Code engineering session. Separate
worktree/branch; exact base supplied at launch. No overlap with STUDIO-UX-02.

User explicitly wants realistic live color changes on an existing supplied AI
cosmetics image, not the current synthetic CSS bottle. This task builds a local
browser feature, not a new corpus palette or new generated application visual.
Read AGENTS.md and coordination. Inspect the actual approved in-repo source
image dist/assets/studies/katre-body.jpg using Read's image support. Keep that
file unchanged. Do not generate/edit a bitmap, scrape, call AI/image services,
read private files, change hosted state, commit, push or deploy.

## Sole writable files

- dist/photo-colorway.js
- dist/photo-colorway.css
- scripts/test-photo-colorway.mjs

Do not modify app.js, Studio HTML, context-kits.css, colorway-kit.js, package.json,
existing source images or any other agent's file. Primary Studio integration
will be separately assigned after delivery.

## Deliver a self-contained engineering prototype

- A mount/update/destroy API or deterministic canvas render API usable by the
  existing Studio middle preview. Module imports only existing color helpers.
- Use the actual Katre photo, with individually annotated surface masks for
  tube, bottle, jar and caps. Optional backdrop mask only if accurate; do not
  tint stone, branches or the entire photograph to pretend semantic recoloring.
- Source image aspect ratio, composition, printed KATRE lettering, material
  shading and outside-mask pixels must remain intact. Keep source luminance/
  texture when transferring hue/chroma. Protect printed text. Feather mask edges
  and avoid halos. Clearly label this a digital AI-concept color preview, NOT a
  physical color proof. Do not claim arbitrary image segmentation.
- Use existing five-color preview with explicit surface-to-index assignment;
  expose a small API for parent-controlled mappings. Do not silently generate
  colors or change the source palette. Initial assignment may use current role
  indexes, not invented new palette content.
- Immutable baseline comparison can call the same renderer with frozen source
  snapshot. No repeatedly resetting colors or leaking canvas/image instances.
- All assets same-origin local; no uploads, remote fetch, new dependency or
  private data. Robust decode failure and stale-update/destroy safeguards.
- If accurate source masks cannot be achieved, report the concrete limitation
  instead of delivering whole-image tint or false fidelity. Parent tests visual
  output on isolated origin; you may return mask bounds/known limitations.

## Verification

Add deterministic tests for valid/invalid snapshots, assignment bounds, frozen
baseline inputs, outside-mask invariance, text/shadow handling and lifecycle
where practical. Run node --test scripts/test-photo-colorway.mjs, node --check
dist/photo-colorway.js and git diff --check. No full-suite duplicate run; parent
integration will run it. Return exact files, API example (no new palette), PASS /
FAIL / NOT RUN and what requires visual inspection. Leave uncommitted.
