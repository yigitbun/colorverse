# STUDIO-VISUAL-01 — purpose-designed product master

Status: v1's generic package rejected by the owner; v3 approved as the starting
Studio design. Local renderer integration complete, not public or a corpus record.
Codex owns art direction and the generated candidate. Claude's renderer call
hit its quota without edits; a separately scoped Codex worker delivered the
implementation. Lead reviewed/integrated it; see SERUM-RENDERER-01A / 01B.

## Design direction

Owner revision: the first bottle looks like a generic empty drugstore
container. Aim for a distinct premium French-boutique skincare character,
without copying an existing brand or claiming French manufacture/origin.
The revised design uses a broad flattened-oval glass bottle with substantial
clear base, a lower micro-fluted cap, a slender colored collar and a smaller
precisely typeset label. Keep the same five Citrus Muse example colors, so
the improvement comes from shape, proportions, materials and hierarchy.

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

## Owner-requested premium redesign — v2 / selected v3

Built-in imagegen edits only; no CLI/API fallback or manual bitmap editing.
v2 redesigned the geometry and label. Visual inspection found a pebbly,
plastic-like body and overly dominant closure/collar; it was not selected.
v3 is the selected design-review output:
`docs/assets/katre-product-design-proof-v3.png` (1254 × 1254, opaque).
It has smoother glass highlights and clear weighted base, lower cap,
narrower ochre collar, intact five-color mapping and readable KATRE / SERUM /
50 ml text. Those words describe a fictional packaging concept, not product
efficacy, certification or geographical provenance. No new palette record.

Owner approved this revised form with "Bununla başlayalım". It began as a finished
illustrative photo; a scoped local surface renderer is now integrated and browser
checked (SERUM-RENDERER-01A / SERUM-STUDIO-01B), not publicly published. No
transparent master or other product variant is approved. Materials and perspective need to be
preserved in later surface-mask work; do not flat-tint transparent glass or
promise pixel-exact/physical color reproduction. Existing assets are retained.

### Exact submitted prompt — v2 geometry redesign

Use case: precise-object-edit.
Asset type: a revised ColorVerse Studio skincare packaging art-direction proof, not a final interactive renderer asset.
Input image: the existing KATRE five-color product proof is an EDIT TARGET. Preserve only its exact five-color design palette, KATRE brand identity, single-product composition and quiet independent warm-neutral studio setting. Completely redesign the actual container geometry and packaging; the old large plastic cap, tall rounded rectangle and huge generic sticker are explicitly NOT invariants.
Primary request: replace the generic empty drugstore-style container with an original, impeccably art-directed high-end French boutique skincare package, photographed with genuine luxury beauty-editorial material realism. Do not copy any existing brand's logo or exact signature packaging.
Subject / industrial design: ONE compact 50 ml serum bottle made from thick satin-frosted tinted glass. A distinctive broad flattened-oval section, softly sculpted sloping shoulders, subtle precisely defined flat front facet, narrow neck, and a convincingly heavy glass base. Body width approximately 70% of body height: substantial and architectural, not an elongated plastic tube, soap dispenser, flask, perfume bottle or stock amber dropper. The cap is a LOW refined circular/oval machined-aluminum overcap, approximately 15% of the total package height, deliberately narrower than the widest glass shoulder, with a fine vertical micro-fluting around its edge and a precise lower seam. No visible dropper bulb or dispenser pump.
Design / palette: preserve the five existing Citrus Muse colors as recognizable designed surface colors, acknowledging real photographic lighting. Coral #E9947B on the satin-frosted glass body with believable glass depth at the edges and shoulders; soft lavender #BBA2D1 on the low satin-finished metal cap; pale sage #C8D8A7 on a compact exquisitely aligned uncoated-paper front label, roughly half the front width and half the body height, leaving ample beautiful glass visible; ochre #EAC843 as a very slender neck collar and one small restrained graphic rule on the label; very dark green #253B25 as the printed typography. All five belong to the product, never only to the backdrop. No extra brand palette, gold foil, marble, gems or decorative luxury cliches.
Label / typography: an actual finished brand composition with precise hierarchy, considered margins and convincing small ink printing. Brand text EXACTLY "KATRE" in a refined modern high-contrast serif, not the large widely spaced generic sans-serif of the old design. Below it, smaller quiet clean sans-serif EXACTLY "SERUM"; at the bottom EXACTLY "50 ml". No other letters, numbers, botanical or clinical claims, provenance claims or symbols. No logo from any existing brand. Text centered, sharp, dark green and readable. Label edges crisp and physically flush, not inflated, ragged or embossed.
Photography / composition: exceptionally photorealistic French skincare campaign product photography, 85 mm studio lens look. One full product only, upright, slight 8-degree three-quarter view to reveal the flattened oval form and heavy glass base while keeping the label readable. Product occupies approximately 66% of the square frame height, generous clean negative space. Opaque quiet warm-neutral seamless backdrop #F1F0EA and a subtle physically correct contact shadow. Large diffuse neutral softbox with controlled narrow side highlights that reveal glass rather than generic pebbly plastic. Refined smooth materials, no metallic glitter, noise, fake rough pores, toy CGI or blown highlights. Full cap/base visible, clean silhouette, no halo or color spill, no rocks, leaves, flowers, pedestals, boxes, extra bottles, props, watermark, swatch blocks, title or comparison layout.
Constraints: a single finished product photograph, not a collage or specification sheet; palette order and values are unchanged, and no new corpus palette is being generated. Do not preserve the old generic bottle silhouette. Output the whole image opaque.

### Exact submitted prompt — v3 material/closure refinement

Use case: precise-object-edit.
Input image: the latest KATRE SERUM broad flattened-oval coral glass bottle is the edit target.
Primary request: one targeted PREMIUM MATERIAL AND CLOSURE REFINEMENT pass. Preserve the new broad glass bottle silhouette, front label dimensions and exact layout/text, all five existing applied palette colors, camera, quiet warm-neutral studio backdrop, composition and lighting direction. Do not revert to the old tall generic plastic package.
Change only finishing and closure proportions: remove the pervasive rough orange-peel/pebbly grain from the coral bottle and replace it with exquisite smooth satin-lacquered thick glass, with continuous subtle controlled vertical studio reflections and convincing translucent optical depth at the shoulder, side edges and heavy base. The heavy glass base must look polished and optically coherent, not bubbly, noisy or gelatinous. It must read as expensive photographed GLASS, not molded plastic or an AI clay render.
Reduce the lavender cap height by about one third while preserving its existing width and top silhouette. Refine the cap's coarse vertical ridges into very fine, shallow and precisely machined micro-fluting in satin-coated aluminum, not a plastic screw lid. Reduce the ochre neck collar to a slim precisely fitted 2–3 mm jewelry-like colored detail, not a broad yellow stripe. Keep ochre #EAC843 recognizably on that narrow collar and on the fine label rule; no metallic gold color added.
The pale sage paper label should have a subtle finely milled matte paper texture, not coarse sponge fibers. Keep its aligned edges and exact dark-green typography "KATRE", "SERUM", "50 ml" unchanged, with no invented text or claims. Retain coral #E9947B body, lavender #BBA2D1 cap, sage #C8D8A7 label, ochre #EAC843 collar/rule, dark-green #253B25 print; photographic reflections are okay, no repainting into a new palette.
Aim for convincingly real, quietly exceptional French boutique cosmetics product photography, not decorative luxury theatrics. Full product visible; independent opaque #F1F0EA backdrop and subtle contact shadow retained. No added props, packaging, alternate product, comparison layout, swatches, halo, color spill, metallic glitter, heavy film grain or watermark. This is still an illustrative design candidate, not a physical color proof.

## Exact submitted prompt — finished design proof

Use case: product-mockup. Use the attached neutral bottle only as the geometry and material reference. Make a FINISHED, exceptionally art-directed premium Katre skincare packaging photograph, not a blank mockup. Keep the same single bottle's shape, camera view and real matte material. Give it a clean, fully opaque warm-neutral seamless studio backdrop (#F1F0EA) with a believable subtle contact shadow, generous considered negative space, no rocks or plants or props. Product occupies about 65% of image height; square composition, full cap/base in frame. Apply this existing ColorVerse Citrus Muse example palette as a cohesive ONE-product design system: coral #E9947B on the main bottle body (dominant product surface); pale sage #C8D8A7 on the large front paper label; soft lavender #BBA2D1 on the cap; restrained ochre-gold #EAC843 on the narrow base trim and one thin graphic rule; very dark green #253B25 for sharply printed label typography. All five colors should be visible on the product, not relegated only to a background; retain truthful physical shading, texture and controlled highlights instead of flat flood fill. The label is restrained editorial graphic design, impeccably aligned and legible, with only the exact word "KATRE" centered in clean modern uppercase with generous tracking, and one small thin rule. No other letters/numbers/copy/logo. Minimal refined Scandinavian industrial-design editorial product photography, 85 mm studio lens, diffuse neutral softbox light, sophisticated matte finish, no metallic glitter or blown highlights, no toy-like plastic/glossy rendering. No color spill outside physical surfaces, halos or white ragged edges. This is an illustrative art-direction proof using existing colors, not a new corpus palette or an exact physical color proof. Output the whole image opaque, no transparent backdrop.
