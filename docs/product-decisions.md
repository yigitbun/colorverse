# ColorVerse product decisions

Unapproved tool ideas and the Adobe Color / Coolors review live in
[`color-tools-opportunities.md`](color-tools-opportunities.md); they are not implementation commitments.
The project/template direction and proposed review-analysis method live in
[`project-workspace-and-review-research.md`](project-workspace-and-review-research.md).

## Image rights and community sharing

- Uploading an image for palette extraction does not publish it. Extraction stays private and browser-local by default.
- Private image tools validate binary signatures, MIME type, byte size, and
  pixel dimensions before decoding. The current safety limits are 20 MB,
  25 megapixels, and 12,000 pixels per edge; rejected files never become a
  preview. These technical checks reduce malformed-file risk but are not a
  substitute for moderation if image publishing is introduced later.
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
- Studio shade editing keeps the right-side light-to-deep library for deliberate exploration, but the primary interaction is now a compact inline shade curtain on the selected left-hand role. It overlays the role row without changing its dimensions, opens from right to left, and closes with the reverse motion after a tone is chosen. Shade exploration does not open a separate window.
- Random generation is a first-class starting point.
- Image extraction separates dominant colors, visual focus, and design-ready roles. Future work should expose small but meaningful accent colors and direct image sampling.
- Community should support both contextual palette ideas and applied work, with clear labels distinguishing concepts from completed projects. Saves, remixes, creator attribution, and discovery should connect contributions to Studio.
- Community contribution should support a palette-first path as well as an image-first path. Confirm the palette, title, and intended use before an explicit sharing action; attach a reference image optionally. Accounts can add drafts, versions, and deeper attribution later.
- Until durable accounts, moderation, reporting, and backend writes exist, the
  Community route presents clearly labeled ColorVerse editorial prototypes.
  Do not show invented creator identities, vote totals, popularity sorting, or a
  “share” action that only modifies the current DOM.
- Color worlds are navigational moods, not separate products. The default world includes the full spectrum; focused worlds provide three intentional starter palettes and a subtle site-wide atmosphere using CSS variables rather than heavy media.
- The world rail uses six entries in a quiet reverse-crescent composition. One entry may rotate as a time-specific editorial edition without making the product dependent on weekly trends.
- The public homepage is itself the primary Explore surface. The globe remains the distinctive creation entry, followed immediately by a visual feed of contextual palette examples. `/explore/` remains the complete searchable/filterable palette library rather than a duplicate landing page.
- Global navigation names the homepage `Explore`, the complete `/explore/` archive `Library`, and the in-house `/inspiration/` shelf `Inspiration`. This keeps user/community discovery, the searchable palette archive, and ColorVerse-owned fictional studies distinct. Studio is the persistent top-right action and is not duplicated inside the primary menu. On desktop, the primary menu begins directly beneath the ColorVerse wordmark.
- World starter palettes are editorial starting points, not “best” or “popular” rankings. Until save/open data is reliable, prefer the strongest coherent systems already in the library and avoid unearned popularity claims.

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
  product surface. The public Studio now exposes three focused contexts:
  Product, Interface, and Report. Product has Footwear, Skincare, and Object
  directions; Interface is the former web-app preview under a clearer name;
  Report keeps the KPI-led analytical preview. Campaign, Packaging, and
  Materials are not primary tabs. RoomKit remains a separate Lab experiment,
  and named project templates remain the next structural layer.
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
- Keep direct color editing on the left: each role has a compact visible swatch
  that opens the native color picker directly. Do not duplicate the color as an
  expanded “Edit color”, “Change color”, or HEX editor inside the role list.
  Selecting or changing a role updates the right-side shade panel. The first
  role starts selected.
- The right panel presents a wider vertical shade strip, 12 nearby alternatives,
  and a separate Contrast section. Contrast suggestions show the resulting ratio
  against Text when editing Background, and against Background for other roles.
  They concern that pair only, not whole-design accessibility.
- Preserve Add to color tray. Every saved color has its own visible trash button;
  deleting it removes only that saved color, never the active palette role.
  Tray storage remains browser-local, deduplicated, and capped at 18 colors.
- Keep two-role swapping. Editing a shade, an exact color, or swapping roles must
  survive a reload, including when starting from a library palette URL.

## Studio Color Globe — 2026-09-18

- The owner approved continuing in order, starting with Color Globe. The compact
  left-hand swatch now opens this picker instead of the native color input.
  Selecting the role label still drives the inline Shades panel.
- Reuse the homepage's beveled, rotatable globe. The picker uses hue around the
  globe, HSL lightness from pole to pole, and independent intensity (saturation).
  Faces display their actual HEX colors; lighting remains on the beveled edges.
- Show the selected color with a ring and provide “Find color” to bring it back
  to the front. Hue, intensity, lightness, and validated HEX entry allow precise
  selection beyond the globe's 642 discrete samples, including black and white.
- Draft changes preview the selected role and the five-color palette. Apply
  changes only that role and persists through the existing Studio session.
  Cancel, Escape, the close button, and a backdrop click discard the draft.
  Restore original is available inside the picker. Opening it alone must not
  replace a color with its nearest globe sample.
- Desktop uses a compact dialog; mobile uses a bottom sheet with a scrollable
  body and visible footer actions. Drag, touch, keyboard rotation/selection,
  reduced motion, focus return, and light/dark themes are supported.
- The next structural priority remains project save/resume, then named templates
  and A/B versions. Color Globe does not introduce accounts, cross-device
  persistence, or changes to the Community/Lab backend.

## Homepage discovery revision — 2026-09-15

- Treat `/` as Explore, not as a conventional marketing homepage. The complete
  library remains at `/explore/`, but is entered from the Explore surface rather
  than repeated as a second global-navigation item.
- Keep the interactive globe first because it is ColorVerse's distinctive way
  to create a direction. Immediately below it, show a dense, image-led feed of
  selected palettes so visitors can discover value without choosing a tool first.
- The homepage feed may filter by practical context such as brand, digital,
  spaces, and editorial. Every card must show its five colors and lead directly
  to Studio; the complete search and filtering experience belongs to All palettes.
- Homepage examples should read as calm project presentations or design case
  studies, close to the Community art direction. Avoid visually loud source
  photography that competes with the palette. Keep the set small and curated,
  make the five-color strip more prominent than decorative imagery, and use one
  coherent photographic language across the feed.
- Keep homepage calls to action minimal. “Browse inspiration” is the primary
  hero action; image upload and random palette entry points belong in the
  relevant tool/library surfaces, not beside the hero CTA.
- As real community work becomes durable, the feed can mix curated palettes and
  credited community projects. Until then, do not label static editorial examples
  as live or popular community activity.

## Interface density revision — 2026-09-15

- Studio is a working surface, so it should not open with a large marketing-style
  introduction. Use a compact title/status row and place the editor immediately
  beneath it on desktop and mobile.
- All palettes is the focused color archive, while the homepage owns image-led
  project discovery. The archive uses a calm, type-led grid with flat five-color
  strips, readable descriptions, small use-case labels, and one clear Studio
  action. Avoid horizontal carousels, overlapping/floating swatch shapes,
  perspective effects, and text constrained inside decorative geometry.

## Community priority — 2026-09-14

- The owner identifies community contribution as a central product priority. Reconsider the earlier tool-first roadmap with this priority in mind.
- The owner also emphasizes durable projects, named reusable templates, and personal/brand defaults, illustrated by starting Power BI reports from an existing template. Treat these as a core direction alongside community; increased retention is a hypothesis to measure, not an established result.
- The owner's example, “Dining room of a canteen or cafeteria,” demonstrates the value of a palette attached to a concrete use case. Discovery should accommodate what someone is designing, alongside color, style, or mood.
- Proposed next scope, not yet approved for implementation: lightweight idea submission (palette + title + use case), optional reference image, save to a project collection, and remix in Studio with creator/source attribution.
- Proposed contextual roles: interiors can describe wall/floor/furniture/accent uses; digital projects can use background/surface/text roles. Do not silently replace Studio's existing role model.
- Current implementation remains a curated prototype. Public submission and
  voting UI is deliberately withheld until shared persistence, accounts,
  moderation, reporting, and review are implemented.

## Visual quality bar

- Every editorial image needs a job: demonstrate a palette in use, establish a material or cultural context, or explain a color principle.
- Imagery in the same collection follows one art direction, consistent light, crop logic, finish, and level of realism. Decorative filler is avoided.
- Palette colors must be visibly traceable in the associated image. Captions and names describe the actual work rather than generic mood words.
- High-resolution originals are optimized into project-bound web assets with explicit dimensions. Quality must not create a performance tax.

## Private project MVP — 2026-09-19

- Studio now offers opt-in passwordless sign-in and private, versioned projects.
  The first save is a baseline; later saves append versions instead of overwriting
  the previous state. Resume restores the five colors, roles, and preview context.
- Project persistence uses Supabase with explicit table grants and owner-only RLS.
  Community writing remains closed. Saving a project never uploads an Extract or
  RoomKit source image, and project/user values are excluded from analytics.
- Named reusable templates and the A/B workbench remain the next project-layer
  increments; the database schema reserves those concepts without presenting
  unfinished controls in the public interface.

## Private templates — 2026-09-21

- Studio now exposes a first private reusable-template flow inside the signed-in
  Projects workspace. A template stores the five colors, role assignments,
  preview context, and product direction as a starting point; it does not
  publish a project or source image.
- Template writes use a validated Supabase RPC and the source project, when
  present, must belong to the signed-in user. Anonymous visitors cannot read
  templates or call the write function.
- Using a template creates a local draft rather than silently attaching future
  saves to the source project. The next increment is authenticated Color Tray
  synchronization, followed by explicit rename/delete controls.

## Account-backed Color Tray — 2026-09-21

- A signed-in user's Color Tray is synchronized to a private
  `color_tray_items` table through a narrow RPC. It stores at most 18 normalized
  six-digit HEX values and their order; uploaded images and project names never
  enter this table.
- Local tray colors are merged into the account on sign-in, so the first
  account connection does not silently discard work. Anonymous visitors keep
  the existing browser-local tray.
- Anonymous reads and writes are rejected by grants and row-level security.
- Template rename and delete actions also use owner-checked RPCs; direct
  browser mutation of the template table remains revoked.
- If account sync is temporarily unavailable, Studio keeps the local tray and
  tells the user that the account copy needs another attempt; it never presents
  a failed cloud write as a successful save.

## Library and context systems — 2026-09-19

- The public palette archive contains 100 five-color directions. Twenty-five
  established palettes remain intact; seventy-five additional directions are
  grouped into fifteen practical families such as digital product, reporting,
  packaging, hospitality, editorial, wellness, and architecture.
- The expanded archive reuses a deliberately small set of credited, real-world
  Unsplash references stored locally. The archive itself remains color-first;
  imagery is supporting provenance, not a decorative card requirement.
- Studio context previews now demonstrate three focused applied systems: a
  Product direction with real ColorVerse product-study imagery, an Interface
  dashboard, and an analytical Report with KPI cards above the chart. The
  product direction can switch between Footwear, Skincare, and Object without
  leaving the working surface. This keeps the palette attached to a thing being
  designed instead of making the user choose a long list of generic mockups.
- Edition palettes may replace a generic context with their own named applied
  system. `Soft Structure`, for example, carries its five-product `CV / SS`
  packaging family into Studio instead of reverting to an unrelated mock brand.
  This keeps the inspiration-to-edit journey coherent while remaining an
  explicitly labeled visual study rather than a claim about a real client.

## Professional reference model — Vitra, CMF, and applied systems — 2026-09-19

- The strongest professional reference is not a gallery of isolated five-color
  strips. Vitra's Inspirations structure starts with real homes, offices,
  public spaces, client projects, and use cases; color and material libraries
  support those stories instead of replacing them. ColorVerse should likewise
  lead from the thing being designed and reveal the palette as one layer of the
  finished system.
- Treat color as a chain of decisions: project character and constraints,
  environment, light, material, finish, production, then the smallest useful
  set of colors. The five HEX values are a portable output, not the whole work.
- A future reference card should identify the designed object or space, designer
  or studio when known, use case, constraints, palette roles, material/finish
  cues, lighting context, and why the system works. Prefer real applied design
  products—hospitality, mobility, devices, furniture, packaging, digital
  products, and public spaces—over art or generic moodboards.
- Vitra's bridge-colour principle is a particularly strong Studio direction: a
  base color may connect several objects while appearing differently on woven
  fabric, matte plastic, wood, paper, or metal. ColorVerse should eventually let
  a user test one role across a small set of material and lighting conditions,
  while clearly labeling the result as a visual simulation rather than a
  production-accurate sample.
- The first deliberately limited version now lives in Studio as Material Study.
  It compares the selected palette role across mineral paint, woven textile,
  uncoated paper, matte polymer, and brushed metal. It is explicitly labeled as
  a screen comparison and never claims to replace physical production samples.
- Professional inspiration should be organized first by context—home, work,
  hospitality, public space, product, mobility, digital—and second by material
  or design problem. Mood and hue can remain secondary discovery filters.
- The product bar is “decision tool used during a project,” not a decorative
  palette feed. Every reference should lead to a useful action: open its system
  in Studio, extract a role structure, compare a bridge color, or save it into a
  project collection with attribution and provenance.

## Mobile atlas interaction — 2026-09-19

- On narrow screens, color worlds use one compact native selector above the
  globe. Do not return to a horizontal row of world cards over the artwork.
- The globe owns touch gestures only inside its visible circular ring. Dragging
  there rotates the globe without moving the page; touching outside that circle
  preserves normal page scrolling.
- Keep zoom and pause controls outside the sphere so no world or utility control
  obscures the color field.

## ColorVerse Editions — 2026-09-20

- ColorVerse Editions is the editorial umbrella for original, applied design
  studies. It is not a fictional conglomerate and should not pretend that
  ColorVerse manufactures the products shown. Each edition begins with a
  concrete brief and demonstrates how a five-color system behaves across a
  product family, material, finish, hierarchy, and environment.
- Product naming follows a house architecture: `ColorVerse` is the master
  brand, `ColorVerse Editions` is the owned-study umbrella, and each applied
  product family receives its own series name and mark. The first series is
  `Soft Structure` (`CV / SS`), with five products named `Cleanse`, `Veil`,
  `Polish`, `Mask`, and `Night`. The stable internal route remains
  `skincare-system-01` so links and saved projects do not break when the
  editorial name evolves.
- The first study uses five tubes with one shared structure. Color distinguishes
  the formulas while typography, cap geometry, finish, and the deep anchor
  color preserve family recognition. Its five colors open directly in Studio as
  editable functional roles.
- The next applied study is an independent fictional footwear label rather than
  another ColorVerse product: `DRIFT / Field 01`. `DRIFT` is the product brand
  and `Field 01` is its first series. Do not use `CV` as the visible shoe mark;
  ColorVerse remains the editorial publisher and makes the study's provenance
  explicit.
- The first visual direction for `DRIFT / Field 01` is a retro-tech lifestyle
  runner: rounded mesh/suede upper, visible everyday comfort, and three
  wearable colorways (Stone, Meadow, Graphite). Inspiration presents the
  family as a capsule, not as a single isolated render, so palette roles remain
  connected to silhouette, material, and context.
- Every Edition must be clearly labeled as an original fictional design study,
  not a real client project or purchasable product. Synthetic visualization is
  acceptable only when it is project-specific, deliberately art-directed, and
  disclosed; do not imitate another brand's wordmark, trade dress, packaging
  silhouette, or signature presentation.
- The intended journey is: discover the applied system, understand the brief
  and CMF decisions, open the same palette in Studio, adapt it, and save it as a
  private project. Editions should gradually cover packaging, hospitality,
  mobility, devices, interiors, and digital products rather than repeating
  cosmetic still lifes.
