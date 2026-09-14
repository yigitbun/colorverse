# ColorVerse product decisions

Unapproved tool ideas and the Adobe Color / Coolors review live in
[`color-tools-opportunities.md`](color-tools-opportunities.md); they are not implementation commitments.

## Image rights and community sharing

- Uploading an image for palette extraction does not publish it. Extraction stays private and browser-local by default.
- Community sharing must be a separate, explicit action.
- The safest default is “share palette only.” Sharing the source image requires the user to confirm that they own it or have permission to publish it.
- Public images keep visible creator credit and provenance. Remix lineage should be preserved.
- Default image reuse is “all rights reserved.” Remix or broader reuse is opt-in.
- A reporting and takedown route is required before community publishing becomes persistent.

## Palette provenance

- Similar colors alone are not treated as theft.
- Community value comes from attribution, project context, and visible remix lineage.
- A palette can be remixed, but names, images, layouts, and project presentation should not be copied without permission.

## Product direction

- Every primary route should end in a usable five-color palette and a clear path into Studio.
- The globe supports one-to-five explicit color choices; missing roles are generated around those choices.
- Studio preserves the chosen five colors. Reordering changes their functional roles and updates every preview and export live; it does not replace the palette with an unrelated one.
- Studio shade editing uses a focused comparison dialog: Pure, Soft, and Rich families offer 21 light-to-deep samples each, plus continuous lightness/intensity controls. Neutral colors use one neutral family. The original hue stays fixed, browsing previews a draft, and Apply changes only the selected role. Cancel discards the draft; applied changes survive reloads from a library link.
- Random generation is a first-class starting point.
- Image extraction separates dominant colors, visual focus, and design-ready roles. Future work should expose small but meaningful accent colors and direct image sampling.
- Community should show palettes in applied work, not as isolated strips, and should eventually support votes, saves, remixes, creator attribution, and weekly discovery loops.
- Community upload is a staged action: choose an image, attach a known palette or review an extracted suggestion, confirm the five colors and naming, then explicitly share. Guest mode stays lightweight; accounts can add drafts, versions, and deeper attribution later.
- Color worlds are navigational moods, not separate products. The default world includes the full spectrum; focused worlds provide three intentional starter palettes and a subtle site-wide atmosphere using CSS variables rather than heavy media.
- The world rail uses six entries in a quiet reverse-crescent composition. One entry may rotate as a time-specific editorial edition without making the product dependent on weekly trends.

## Visual quality bar

- Every editorial image needs a job: demonstrate a palette in use, establish a material or cultural context, or explain a color principle.
- Imagery in the same collection follows one art direction, consistent light, crop logic, finish, and level of realism. Decorative filler is avoided.
- Palette colors must be visibly traceable in the associated image. Captions and names describe the actual work rather than generic mood words.
- High-resolution originals are optimized into project-bound web assets with explicit dimensions. Quality must not create a performance tax.
