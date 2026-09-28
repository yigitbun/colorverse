# STUDIO-VISUAL-01 — purpose-designed product master

Status: new visual candidate, not a live replacement or approved corpus record.
Codex owns art direction and the generated candidate. Claude owns separately
assigned renderer implementation after asset review; no renderer task started.

## Design direction

Begin with one hero product, not five differently colored copies. The same
product may gain a secondary identical copy later only if it clarifies the
design; no multicolor lineup merely to tick off swatches. Show hierarchy through
surface area, material, lettering and one restrained accent.

Use a genuinely transparent neutral product master so the backdrop is separately
composited. Do not bake rocks, leaves, typography, a brand palette or a dominant
colored environment into it. Mask the body, label, cap and thin accent band
independently; draw brand typography sharply in the renderer rather than
recoloring fixed dark AI lettering.

Keep the user's original ordered HEX list unchanged. Background choices and any
derived display backdrop must be explicit presentation state, never overwrite
palette data. A quiet adapted backdrop can support object/background separation,
but must not be the only place a palette color appears. An exact applied color
must remain visibly traceable on a product surface or its lettering. Do not claim
that all palettes will look attractive or physically accurate on one material.

The mapping and exact-background/derived-background interaction are still a
design proposal, not an automatic migration of saved Studio roles.

## First asset acceptance

- One physically coherent product, believable matte finish and fine highlights.
- Full silhouette with clean alpha edges; no flat painted spill or baked halo.
- Separate, sufficiently large body / label / cap / accent-band regions.
- No distorted or generated text; a clean label area for renderer typography.
- No decorations or environment that competes with selected palette colors.
- Test varied light/dark and low-chroma palettes before replacing the live photo.

## Built-in imagegen prompt — neutral master

Use case: product-mockup
Asset type: high-quality neutral master asset for an interactive skincare color
application preview, not a finished ad or a palette record.
Primary request: create an original, exceptionally refined photorealistic studio
product photograph of ONE premium 50 ml refillable skincare bottle, completely
isolated on a genuinely transparent background with real alpha.
Subject: a slender rounded-rectangular bottle with softly radiused edges, a broad
flat front, a matching removable cap with a precise physical seam, a blank smooth
paper label centered on the front, and a very thin separate trim band around the
bottom. These four surfaces must be cleanly separable and uncluttered.
Style/medium: luxury industrial-design product photography with real material
behavior, not a toy-like CGI mockup. Matte warm-white body, subtly different
neutral-white paper label, restrained light-gray cap and pale-gray trim. No
chromatic palette is assigned; this is an editable lighting/material master.
Composition/framing: square frame, full upright product, front view with only
slight visible side depth, bottle occupies about 76 percent of frame height,
balanced breathing space, no cropping. Label is a broad mostly planar area for
later sharp vector typography. Product is precisely made but not plastic-perfect.
Lighting: large softbox key, gentle controlled side fill, neutral illumination,
delicate material texture and continuous realistic shading. No clipped white
highlights, metallic glitter or dark dramatic shadows. A restrained contact
shadow may have translucent alpha; all other surroundings are fully transparent.
Constraints: no letters, words, numbers, logos, symbols, watermarks, pedestal,
rocks, plants, hands, second bottle or props. No background scene, no printed
checkerboard, no white rectangle masquerading as transparency. Preserve a sharp,
clean complete silhouette and realistic cap/body proportions. Prioritize
photographic credibility and mask-ready geometry over decorative styling.

Execution: built-in imagegen, no CLI/API fallback. Save the inspected candidate
and generated alpha intact to a new versioned workspace path; do not overwrite
`dist/assets/studies/katre-body.jpg`. Final saved path is recorded after generation.

## Follow-up prompts and quality review

Alpha cleanup (built-in edit, identical geometry/materials): remove isolated
white fringe/flecks and low-opacity background noise; fully opaque product
interior, zero-alpha empty backdrop, antialiasing only at the true silhouette,
restrained translucent contact shadow. No redesign, text or colored palette.
The generated cleanup still shows ragged edge specks; the neutral master is
NOT accepted for a live renderer. No Python or manual bitmap editing was used.

Finished illustrative proof (built-in edit using the neutral form as reference):
one Katre bottle on an opaque quiet warm-neutral seamless backdrop `#F1F0EA`.
Use the EXISTING Citrus Muse example, not a new corpus palette: coral `#E9947B`
body, pale sage `#C8D8A7` front paper label, lavender `#BBA2D1` cap, restrained
ochre `#EAC843` thin base trim/rule, dark green `#253B25` sharp KATRE typography.
All five colors visibly belong to the product; lighting, matte material and
soft contact shadow must be physically coherent. Full product at 65% frame
height with considered negative space; square, no rocks/props, halos, spilled
color, generated extra copy or metallic glitter. Only exact text KATRE, clean
uppercase with tracking and one small rule. An art-direction candidate, not
a live recolor implementation, new corpus palette or physical color proof.

Workspace outputs (built-in imagegen, no CLI fallback):
- `docs/assets/katre-product-master-candidate-v1.png`: inspected neutral master;
  alpha exists, but edge specks/near-opaque interior need work; not renderer-ready.
- `docs/assets/katre-product-design-proof-v1.png`: inspected opaque illustrative
  design proof; all five existing example colors visibly belong to one product.
  Readable KATRE text, no palette color dependent only on the backdrop, no
  obvious color spill. Still an AI design candidate, not editorial/live approval.

The alpha-cleanup attempt remains at the built-in generated-images location;
it did not resolve the edge defect and was not selected as the workspace master.
Original outputs are retained. Existing source Katre photo is unchanged.

## Exact submitted prompt — finished design proof

Use case: product-mockup. Use the attached neutral bottle only as the geometry and material reference. Make a FINISHED, exceptionally art-directed premium Katre skincare packaging photograph, not a blank mockup. Keep the same single bottle's shape, camera view and real matte material. Give it a clean, fully opaque warm-neutral seamless studio backdrop (#F1F0EA) with a believable subtle contact shadow, generous considered negative space, no rocks or plants or props. Product occupies about 65% of image height; square composition, full cap/base in frame. Apply this existing ColorVerse Citrus Muse example palette as a cohesive ONE-product design system: coral #E9947B on the main bottle body (dominant product surface); pale sage #C8D8A7 on the large front paper label; soft lavender #BBA2D1 on the cap; restrained ochre-gold #EAC843 on the narrow base trim and one thin graphic rule; very dark green #253B25 for sharply printed label typography. All five colors should be visible on the product, not relegated only to a background; retain truthful physical shading, texture and controlled highlights instead of flat flood fill. The label is restrained editorial graphic design, impeccably aligned and legible, with only the exact word "KATRE" centered in clean modern uppercase with generous tracking, and one small thin rule. No other letters/numbers/copy/logo. Minimal refined Scandinavian industrial-design editorial product photography, 85 mm studio lens, diffuse neutral softbox light, sophisticated matte finish, no metallic glitter or blown highlights, no toy-like plastic/glossy rendering. No color spill outside physical surfaces, halos or white ragged edges. This is an illustrative art-direction proof using existing colors, not a new corpus palette or an exact physical color proof. Output the whole image opaque, no transparent backdrop.
