# Editorial palette naming contract

## Current addition — 2026-09-27

New unnamed drafts use `palette-names.js`: a curated ASCII vocabulary selected
from the strongest chromatic hue and a deterministic hash of the HEX values.
Near-neutrals have a separate Stone/Oat/Paper/Dune bank. This is a convenience,
not a scientific quality score or uniqueness guarantee. Alternative suggestions
are explicit; changing colors never silently renames an existing member palette.
Names are editable, not database keys. No mandatory username/email prefix is used.

`palette-name-library.js` retains retired labels and joins eight AI study names
by stable concept ID. Family, palette name and identifier are distinct fields.
Related Katre applications are not unrelated independent brands. Names remain
proposals; the original seven-photo naming contract below is historical.


These are **proposed names for local review**, not owner-approved titles. The
source of truth for the seven review labels is `dist/palette-name-library.js`.
The photo, category, tags, palette colors, credit, and name are separate data.

## The short-name rule

- One or two English words, at most 18 characters, `A-Z` letters and one space
  only. Avoid punctuation, accents, color lists, and category words such as
  “room”, “cafe”, or “chairs” in the canonical label.
- Evoke a distinctive visual/material cue; do not claim the photographer,
  architect, or pictured brand named the palette.
- Reserve names across the editorial catalog, including retired names. Compare
  case-folded keys and check near-duplicates by hand. Trademark clearance is a
  separate gate before public promotion, not something this registry proves.
- This ASCII rule applies **only** to ColorVerse editorial names. Member-created
  palette names and people/source credits keep their original scripts.

| Stable palette ID | Proposed label | Former descriptive label |
| --- | --- | --- |
| `space-meeting-room-01` | Mosswood | Oak & Green Meeting Room |
| `space-orange-pink-seating-02` | Orchid Ember | Orange & Pink Seating |
| `space-modern-lobby-03` | Sunlit Grove | Light-Filled Lobby |
| `hospitality-pink-yellow-cafe-04` | Rose Brick | Pink & Yellow Café |
| `retail-orange-green-purple-05` | Citrus Voltage | Orange, Green & Violet |
| `product-mustard-coral-chairs-06` | Saffron Pair | Mustard & Coral Chairs |
| `product-colorful-chair-hall-07` | Spectrum Row | Colorful Chair Hall |

## Data model and migration boundary

`palette_id` is the immutable identity and URL key. The displayed name is an
attribute, never a join key. Do not change IDs or rewrite saved project names
when an editorial title changes. Former titles are aliases for future search,
not alternative current labels. A category like `Space · Hospitality` is a
filter dimension, not part of the palette's name. A photographer's name is
provenance, not palette authorship.

The review set is local and does not exist in the hosted `public.palettes`
table. Do **not** insert these proposals into that table or make a production
migration yet. When an image, palette and name are individually approved:

1. Create the palette row under its existing ID, then assign its approved
   editorial name in one transaction. Maintain one current name per palette and
   a globally unique, case-folded `name_key` in the editorial namespace.
2. Retain previous labels in a separate alias/history relation with timestamps;
   never recycle a retired name. Keep `public.palettes.name` as a compatibility
   projection until its readers are migrated, not a second editable authority.
3. Keep member palette names in `saved_palette_items` independent. A member can
   rename their own copy without changing the editorial registry.

For future discovery, index canonical name, aliases, category, use case, tags,
and HEX separately. A color list or a photo filename should not be generated
into the title. Search for a former name should resolve to the same stable ID.

## Review signal

Names are editorial hypotheses. Ask people to recall or find a palette after a
delay; compare correct retrieval and confusion between names, not just clicks.
Aggregate only consented measurement and avoid claiming a “popular” name from
tiny samples. The owner approves the canonical label before public use.
