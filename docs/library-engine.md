# Editorial Library engine — 2026-09-26

## Running locally

`dist/library-engine.js` indexes only valid five-color entries whose stable ID
is in `dist/curation.js`'s `approvedPaletteIds`. That manifest is still empty.
The review table is not the Library, and the 100 archived records remain usable
through old Studio links. No record was newly approved by this implementation.

Search uses normalized names, former names/aliases, tags, use cases, category
and descriptions. Words combine as AND; exact names rank first. HEX input or
“Match current palette” ranks results by perceptual Oklab distance. Palette
matching minimizes a one-to-one assignment of up to five colors, so one target
color cannot satisfy several requested colors. This measures color proximity,
not taste, popularity, accessibility, or brand suitability. Editorial order is
the stable tie-breaker. No learned model or invented popularity score is used.

## Database foundation, not deployed

`supabase/drafts/editorial_library.sql` is a **review draft**, deliberately
outside the deployable migration chain. It has not been applied to the hosted
project or executed against PostgreSQL. It prepares:

- A separate draft/review/approved/archived catalog; anonymous readers see only
  approved entries. Browser roles cannot write approvals or reserve names.
- ASCII short editorial names, case-folded reservations retained across renames,
  and old labels retained as search aliases. IDs and member-authored names stay
  independent. Reservations must not be deleted by editorial publishing scripts.
- Five-color snapshots, provenance type, credit/source/license links, and
  explicit owner/rights review timestamps before approval.
- GIN full-text/tag indexes and bounded, RLS-respecting search pagination.

It does not rewrite `palettes.is_published`: existing private snapshot RPCs use
that field to validate historical references. Compatibility catalog access is
not editorial approval. The draft does not insert any of the seven proposals;
it marks old anchors archived in the **new** relation only.

Before applying: run a clean local database migration/RLS/rollback test, validate
constraints with approved and rejected examples, and test old project saves.
Then migrate discovery readers and generate the static approved manifest from
one database publication export, including provenance and name reservations.
Do not maintain two separately editable approval authorities. Until this cutover,
the local manifest remains authoritative and the hosted compatibility catalog is
not consumed for discovery. Source-image rights must be reviewed per asset; an
URL and a timestamp alone do not prove legal permission.

At larger scale, add versioned Oklab vectors and bounded candidate retrieval,
then rerank with the same assignment metric. Defer ML until curated data and
consented relevance feedback justify it.
