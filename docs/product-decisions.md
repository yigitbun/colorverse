# ColorVerse product decisions

Unapproved tool ideas and the Adobe Color / Coolors review live in
[`color-tools-opportunities.md`](color-tools-opportunities.md); they are not implementation commitments.
The project/template direction and proposed review-analysis method live in
[`project-workspace-and-review-research.md`](project-workspace-and-review-research.md).

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
- Studio shade editing starts with a vertical light-to-deep strip in the right panel, driven by the selected left-hand role (Background by default). Clicking a tone changes only that role and keeps the strip's source stable. An optional Full library dialog retains Pure, Soft, and Rich families with 21 samples each, continuous controls, and explicit Apply/Cancel. Applied changes survive reloads from a library link.
- Random generation is a first-class starting point.
- Image extraction separates dominant colors, visual focus, and design-ready roles. Future work should expose small but meaningful accent colors and direct image sampling.
- Community should support both contextual palette ideas and applied work, with clear labels distinguishing concepts from completed projects. Saves, remixes, creator attribution, and discovery should connect contributions to Studio.
- Community contribution should support a palette-first path as well as an image-first path. Confirm the palette, title, and intended use before an explicit sharing action; attach a reference image optionally. Accounts can add drafts, versions, and deeper attribution later.
- Color worlds are navigational moods, not separate products. The default world includes the full spectrum; focused worlds provide three intentional starter palettes and a subtle site-wide atmosphere using CSS variables rather than heavy media.
- The world rail uses six entries in a quiet reverse-crescent composition. One entry may rotate as a time-specific editorial edition without making the product dependent on weekly trends.

## Working directions — 2026-09-14

- The three directions that currently have the owner's strongest pull are: (1)
  durable projects, named templates, and personal/brand defaults; (2) a Lab where
  experimental features are explicitly tested with user feedback; and (3)
  RoomKit / Living Spaces, where a palette is previewed in a real or sample room.
- RoomKit should remain broader than a dining-room example. “Dining room of a
  canteen or cafeteria” is a community/use-case reference, not the product name.
  Preferred language: “RoomKit / Living Spaces”, “See your palette in a space”,
  and “Try in your space”.
- A palette-on-photo preview is useful when it preserves texture and light and
  applies colors to broad semantic surfaces such as wall, floor, furniture,
  textile, and accent. A flat full-image tint without role mapping is a gimmick;
  surface selection, before/after comparison, and saving the result make it a
  decision tool.
- The first RoomKit experiment may use a curated sample room plus a private,
  browser-local room-photo preview. User uploads should not be public by default.
  Public photo sharing requires a separate publish action, image rights
  confirmation, safety/relevance checks, provenance, reporting, and takedown.
  An uploaded image that is not an interior can be redirected with guidance;
  disallowed images must never enter a public Lab feed.
- The Lab is a product-research surface, not a “coming soon” gallery. Each
  experiment should have one clear feedback action (for example, “I would use
  this”), an optional contextual comment, and measurable steps from open to try
  to save/share. Prototype-local feedback must not be presented as community
  data until a durable backend is connected.
- The Studio's three leading near-term product candidates from the owner's
  feedback are: project/template memory, Lab + Community validation, and
  RoomKit / Living Spaces. Within the existing tool ideas, the immediate small
  implementation was Mini Harmony Wheel (rejected and removed on 2026-09-15); A/B prototype workbench is the next
  structural step, followed by collection baskets, contrast cues, and a lighter
  shade entry.
- The A/B workbench should be a project-level comparison, not a second unrelated
  palette. Prototype 1 is the saved baseline and becomes immutable when locked;
  Prototype 2 starts as a clone of Prototype 1 and records only its changes.
  The default comparison should preserve four of five colors when one variable
  is being tested, while still allowing an explicit “change more” action. Both
  prototypes need names, side-by-side context previews, independent undo, and a
  clear “make this the active version” action. Saving a version should never
  overwrite the baseline.
- The current generic Studio contexts (website, slides, social, shop) are a weak
  product surface. The direction is stronger contextual prototypes: named
  project templates, living-space/RoomKit scenes, and other task-specific kits.
  Keep the generic contexts as fallback examples until replacement kits exist.
- Shades should not force every user into a large modal. The preferred direction
  is a compact inline quick-shade strip for common neighboring tones, with the
  sophisticated full shade library available as an advanced expansion. A
  contrast cue should sit beside the selected role: show the affected foreground/
  background pair, AA/AAA status, and one or two nearby safer alternatives. A
  contrast suggestion is guidance for the current pair, not a guarantee that an
  entire design is accessible.

## Studio editing revision — 2026-09-15

- The owner rejected the Mini Harmony Wheel. Remove its UI, code, and Lab teaser;
  do not reintroduce it without a new request.
- Keep direct color editing on the left: each role visibly says “Edit color”
  with a pencil, and the selected role exposes a color picker and HEX field.
  Remove the right-side “Tune background” editor. The first role starts selected.
- The right panel presents a wider vertical shade strip, 12 nearby alternatives,
  and a separate Contrast section. Contrast suggestions show the resulting ratio
  against Text when editing Background, and against Background for other roles.
  They concern that pair only, not whole-design accessibility.
- Preserve Add to color tray. Every saved color has its own visible trash button;
  deleting it removes only that saved color, never the active palette role.
  Tray storage remains browser-local, deduplicated, and capped at 18 colors.
- Keep two-role swapping. Editing a shade, an exact color, or swapping roles must
  survive a reload, including when starting from a library palette URL.

## Community priority — 2026-09-14

- The owner identifies community contribution as a central product priority. Reconsider the earlier tool-first roadmap with this priority in mind.
- The owner also emphasizes durable projects, named reusable templates, and personal/brand defaults, illustrated by starting Power BI reports from an existing template. Treat these as a core direction alongside community; increased retention is a hypothesis to measure, not an established result.
- The owner's example, “Dining room of a canteen or cafeteria,” demonstrates the value of a palette attached to a concrete use case. Discovery should accommodate what someone is designing, alongside color, style, or mood.
- Proposed next scope, not yet approved for implementation: lightweight idea submission (palette + title + use case), optional reference image, save to a project collection, and remix in Studio with creator/source attribution.
- Proposed contextual roles: interiors can describe wall/floor/furniture/accent uses; digital projects can use background/surface/text roles. Do not silently replace Studio's existing role model.
- Current implementation remains a prototype: community cards and initial vote counts are static; votes are browser-local; new submissions are appended to the current page without a backend write or durable submission storage. The UI's “saved on this device” and “review pending” wording does not establish an actual storage or review workflow. Real shared persistence must be implemented before presenting these as community activity.

## Visual quality bar

- Every editorial image needs a job: demonstrate a palette in use, establish a material or cultural context, or explain a color principle.
- Imagery in the same collection follows one art direction, consistent light, crop logic, finish, and level of realism. Decorative filler is avoided.
- Palette colors must be visibly traceable in the associated image. Captions and names describe the actual work rather than generic mood words.
- High-resolution originals are optimized into project-bound web assets with explicit dimensions. Quality must not create a performance tax.
