# STUDY-GALLERY-01 — fill existing Library/Inspiration with supplied AI studies

Owner: separate Claude engineer, isolated branch/worktree, launch supplies base.
Read AGENTS.md/coordination. User explicitly asked these two surfaces to use the
existing supplied AI pictures and remove CV / SS-style empty placeholders.
This is display work, NOT external corpus production or editorial corpus approval.

## Sole writable files

- dist/study-gallery.js
- dist/inspiration/index.html, dist/inspiration.css
- dist/explore/index.html, dist/palette-library.css
- scripts/test-study-gallery.mjs

Another active Claude owns app.js, Studio assets, context-kits.css, package.json
and existing context tests. Do not edit those or existing source records/assets.
No new palette, names, photos, images, scrape, source/license claims, generation,
schema/hosted changes, auth, secrets, commits, push or deployment.

## Implementation

- Inspiration: replace CV/SS and other empty visual placeholders with the eight
  existing aiStudies records/photos, preserving IDs, colors, names and family.
  Consistent palette-first cards, image, short title/family/context, Studio link.
  Group or label related Katre family accurately; don't present these as eight
  unrelated brands or manufacturer products. Visible AI concept disclosure.
  Keep Lab/RoomKit as a compact separate tool link, not a fake image card.
- Library: add a clearly labelled supplied AI concept-study shelf using the four
  existing homeStudies (current owner-selected display set). Keep it separate
  from approved corpus records; approvedPaletteIds stays untouched/empty.
  Existing empty approved Library is not proof the concept shelf is empty.
- New study-gallery.js owns only this added shelf/route content. Do not race or
  replace app.js's approved palette rail. Reuse library-engine for matching and
  the same filters where practical, with a display eligibility list from current
  homeStudies, NOT invented corpus approval. If shared filter counters conflict,
  use separate clear study results metadata and report integration needs.
- Images same-origin dist/assets/studies/*.jpg, meaningful existing alt text,
  lazy/decode async, responsive palette-first presentation and safe escaped copy.
- Labels must say provisional AI concepts / supplied studies. Never call these
  approved corpus or genuine ColorVerse Originals. No researched license claims.
- Studio links use existing ?p=<stable ID> path; no owner draft/session writes.
- Avoid long descriptions/curated-by sections, redesigns or huge color strips.
- Keep page navigation/consent/CSP intact and cache-bust changed own route assets.

## Delivery

Run new targeted node test, node --check on new JS and git diff --check.
Full-suite old Inspiration contract expectations need owner engineer updates,
so don't edit another writer's test or repeat full suite. Return API/hooks and
exact changed files, actual checks and integration considerations. Uncommitted.
