# Corpus source audit 01 — CORPUS-RESEARCH-01A

Task: [`docs/tasks/corpus-research-01a.md`](../tasks/corpus-research-01a.md).
Base commit: `21c10e723da5488574f29b021291b570a45fc2d5`. Research only; no
application code, schema, DB, generators or approved IDs touched. Nothing in
this document or in `data/research/corpus/source-candidates-01.json` is an
approved product record — see `editorialStatus: research-candidate` in that
file. Final editorial approval, runtime import and publication remain
separate, owner-directed steps per
[the integration assessment](../color-corpus-integration-assessment.md).

**Revision note (CORPUS-RESEARCH-01B):** this revision corrects the Wada
rights claim, the CIE rights label, the Munsell/NBS numeric-eligibility
reasoning, an unsupported secondary claim, a non-paraphrased quote, and the
tool-count reporting in the original 01A delivery (base `f6693f8`), per
Codex review and the official source at
https://www.bunka.go.jp/seisaku/chosakuken/hokaisei/kantaiheiyo_chosakuken/1411890.html.
The correction adds the official transition-rule citation; it does not add
a new corpus-source candidate. No numeric values were collected or converted.
Codex's final review also removes residual blanket rights claims and
unverified source/tool-count wording. This remains research, not legal clearance.

## Method

Live WebSearch/WebFetch prioritized primary sources: a standards body
(CIE), a U.S. federal science agency (NIST/NBS), a university laboratory
(RIT Munsell Color Science Laboratory), and national/institutional
libraries (Smithsonian Libraries, Internet Archive as their hosting mirror,
Biodiversity Heritage Library, Japan's National Diet Library / NDL Search).
No palette-aggregator sites, blog color-picker posts, or Adobe Color/Coolors
pages were used as evidence, per the task brief. A Wikipedia author page
was also opened for discovery; it is not primary evidence or rights clearance.
Several fetches failed
(HTTP 403/404, or exceeded the fetch tool's size limit) and were retried
against a working official URL where possible; the exact list is in "Checks
actually run" below rather than summarized here, to avoid restating an
approximate count. No files outside the two allowed outputs were created;
no build, install, or network write occurred.

Three academic/methodology sources and three original historical/reference
collections were identified, matching the brief's suggested shape. Evidence
and unresolved access/rights limits are recorded per entry. This is a
first, deliberately small pass — not a target count for later collection
tasks.

---

## A. Academic / methodology sources

### A1. Munsell Renotation Data — Munsell Color Science Laboratory, RIT

- **Author/institution:** Munsell Color Science Laboratory, Rochester
  Institute of Technology (RIT); renotation methodology originates from
  Newhall, Nickerson & Judd, "Final Report of the O.S.A. Subcommittee on the
  Spacing of the Munsell Colors," *Journal of the Optical Society of
  America* 33(7), 1943 (not itself fetched here; cited for provenance only).
- **Publication/access dates:** Renotation methodology 1943; RIT's hosted
  data page accessed 2026-09-28.
- **Direct evidence URL:**
  https://www.rit.edu/science/munsell-color-science-lab-educational-resources
  — lists downloadable renotation tables (`real.dat`, `all.dat`, `1929.dat`)
  giving Munsell hue/value/chroma tied to CIE `x, y, Y` under the
  illuminant/observer conditions used for the 1943 renotation.
- **Why useful:** This is the closest thing color science has to an
  authoritative numeric bridge between the historically dominant Munsell
  notation and CIE colorimetry — real measured/interpolated `xyY` per
  notation, not a subjective RGB guess.
- **Limitations:** The data is `xyY`, not sRGB/HEX; any HEX derived from it
  requires a disclosed illuminant-adaptation and RGB-encoding pipeline (see
  "Numeric candidate assessment" below). The dataset is chips under studio
  measurement conditions, not a specific historical object or artifact.
- **Rights-statement URL:** none found on the hosting page. In substance
  (paraphrased, not quoted), the page offers the files for download "as is"
  and says RIT has tried to keep them accurate, without granting any
  explicit public-domain, open-data or Creative Commons license for the
  data itself.
- **Rights status:** **unresolved**. Text describing the resource is RIT's;
  the underlying numeric data's reuse license is not stated. Direct fetch of
  the data-file host (`rit-mcsl.org`) returned HTTP 403 during this audit, so
  only the RIT listing/description page was read — the raw `real.dat` /
  `all.dat` / `1929.dat` tables themselves were **not** fetched or read in
  this pass, so no specific numeric value from them has been verified.

### A2. NBS Special Publication 440 — *Color: Universal Language and Dictionary of Names*

- **Author/institution:** Kenneth L. Kelly and Deane B. Judd, U.S. National
  Bureau of Standards (now NIST).
- **Publication/access dates:** Published 1976; accessed 2026-09-28.
- **Direct evidence URL:** https://www.nist.gov/publications/color-universal-language-and-dictionary-names
  (official NIST record; DOI `https://doi.org/10.6028/NBS.SP.440`), full text
  at https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nbsspecialpublication440.pdf.
- **Why useful:** Defines the ISCC–NBS color-naming system: 267 named color
  blocks specified as Munsell notation ranges/centroids, with an explicit
  methodology chapter. This is the standard academic bridge between color
  *names* and a defined notation, independent of any single manufacturer.
- **Limitations:** Centroids are given as Munsell notations, not HEX; the
  brief does not require converting them, but the actual centroid table
  inside the PDF was **not** read/transcribed in this pass (the large scanned
  PDF exceeded this session's fetch size limit — see "Checks actually run"),
  so no specific centroid value has been verified yet. The document also
  reproduces some figures/color-chart material whose own copyright history is
  not independently confirmed here — only the U.S.-government-authored *text*
  is addressed by the rights determination below, not every embedded figure.
- **Rights-statement URL:** https://www.nist.gov/open/license — quotes
  17 U.S.C. §105: "works of NIST employees are not subject to copyright
  protection in the United States," with a stated exception for separately
  copyrighted Standard Reference Data (SRD) products, which SP440 is not.
- **Rights status:** **verified public domain** for the U.S. government
  authored text, in the United States. Confirmed directly against the NIST
  policy page.

### A3. CIE 015:2018, *Colorimetry* (4th edition)

- **Author/institution:** International Commission on Illumination (CIE)
  Central Bureau.
- **Publication/access dates:** Published 2018; accessed 2026-09-28.
- **Direct evidence URL:** https://cie.co.at/publications/colorimetry-4th-edition
  — the CIE's own product page lists webshop/National Committee availability
  and a member discount, indicating a paid publication.
- **Why useful:** Defines the standard illuminants, standard observers, and
  tristimulus/chromaticity calculation conventions that any Munsell-to-sRGB
  or historical-plate colorimetric conversion would need to cite by the
  book, rather than an ad hoc assumption.
- **Limitations:** Exact reuse terms were not read. Repository policy for
  this pass is reference-only: do not copy or bundle the publication.
- **Rights-statement URL:** none published inline on the CIE product page;
  purchase is handled by the CIE Webshop (`store.accuristech.com`) and
  National Committees. No public-domain or open-access grant is shown.
- **Rights status:** **commercial, exact terms unverified**. The CIE's own
  page confirms this is a paid publication, not a freely available one — but
  that only establishes that it is sold, not what its actual license or
  redistribution terms say, since the license/EULA text itself was not
  fetched or read in this pass. Treat as reference-only pending exact terms;
  do not treat "commercial" as itself a fully verified redistribution
  restriction, and do not quote or bundle its content regardless.

---

## B. Original historical / reference collections

### B1. Robert Ridgway, *Color Standards and Color Nomenclature* (1912)

- **Author/institution:** Robert Ridgway (Smithsonian Institution
  ornithologist), self-published, Washington D.C., 1912; digitized copy held
  by Smithsonian Libraries and Archives.
- **Publication/access dates:** Published 1912; accessed 2026-09-28.
- **Direct evidence URL:** https://library.si.edu/digital-library/book/colorstandardsc00ridg
  (Smithsonian Libraries digital record); mirrored at
  https://archive.org/details/colorstandardsc00ridg and indexed at
  https://www.biodiversitylibrary.org/bibliography/144788 (BHL item page
  returned HTTP 403 to direct fetch during this audit; the Smithsonian and
  Internet Archive copies were fetched successfully instead).
- **Why useful:** 53 hand-produced color plates with 1,115 named colors,
  useful as documented provenance for naming conventions, not for extracted
  pixel color. (A secondary source surfaced in search results claims this
  work influenced later commercial color-naming systems; that claim was not
  independently verified against primary evidence and is deliberately
  excluded here rather than repeated as fact.)
- **Limitations:** The plates are printed pigment samples reproduced by an
  early-20th-century printing process; scanning introduces its own color
  drift from lighting, printer ink and monitor calibration. No colorimetric
  measurement data accompanies the plates. Per the task brief, a scan's RGB
  pixels must not be treated as the historical original.
- **Rights-statement URL:** https://library.si.edu/digital-library/book/colorstandardsc00ridg
  shows an explicit "CC0 — Creative Commons (CC0 1.0)" mark and "No
  Copyright - United States," with general terms at
  https://www.si.edu/termsofuse. The Internet Archive/BHL copy separately
  states: "Public domain. The Library considers that this work is no longer
  under copyright protection."
- **Rights status:** **verified public domain** (text and plates alike, per
  Smithsonian Libraries' own CC0 mark).

### B2. *Werner's Nomenclature of Colours*, 1821 edition (Werner / Syme)

- **Author/institution:** Color system by Abraham Gottlob Werner; this
  edition arranged by Patrick Syme, Edinburgh, 1821. Digitized copy held by
  Smithsonian Libraries and Archives, hosted on Internet Archive.
- **Publication/access dates:** Published 1821 (this edition; the edition
  used by Charles Darwin aboard HMS Beagle); accessed 2026-09-28.
- **Direct evidence URL:** https://archive.org/details/wernersnomencla00wern.
- **Why useful:** An early systematic attempt to attach fixed names to
  hand-painted color swatches, cross-referenced to specific animal,
  vegetable and mineral examples — useful as documented naming/provenance
  history, distinct from any modern reinterpretation.
- **Limitations:** Same plate/scan caveat as B1: hand-painted watercolor
  swatches, no colorimetric data, subject to pigment fading and scan
  variance over two centuries. Popular modern reinterpretations (e.g. design
  sites that redraw the 100 colors, and Smithsonian Books' 2021 print
  reissue) are separate secondary works with their own rights and are not
  this primary 1821 source; they were not used as evidence here.
- **Rights-statement URL:** shown directly on the Internet Archive item
  page: "Public domain. The Library considers that this work is no longer
  under copyright protection."
- **Rights status:** **verified public domain**.

### B3. Sanzo Wada, *A Dictionary of Color Combinations* / *Haishoku Sōkan* (配色総鑑), 1933–1934

- **Author/institution:** Sanzo Wada (和田三造, 1883–1967), published by
  Hakubisha (博美社), Tokyo, February 1934 (six volumes plus an explanatory
  section, issued from 1933).
- **Publication/access dates:** Published 1933–1934; accessed 2026-09-28.
- **Direct evidence URL:** https://ndlsearch.ndl.go.jp/books/R100000039-I1191847
  (National Diet Library Search bibliographic record for a volume of the
  original work); the authority identifier
  https://id.ndl.go.jp/auth/ndlna/00089958 is a follow-up locator for author
  life dates, not a directly fetched verification in this audit.
- **Why useful:** A historically significant Japanese color-combination
  reference distinct from Western color-naming traditions; explicitly named
  in the task brief as a source to identify but not bulk-ingest.
- **Limitations:** No colorimetric measurement data; a name-and-swatch
  reference from letterpress-era printing, same scan/reproduction caveat as
  B1/B2. Modern commercial reprints (e.g. Seigensha's 2011 edition) are
  separate editions whose added material may carry its own rights. Their
  existence settles neither the original's rights nor permission to reuse
  a particular edition.
- **Rights-statement URL:** none published by NDL granting reuse. The
  applicable rule is more complex than "life plus 70 years" applied
  mechanically to Wada's 1967 death:
  https://www.bunka.go.jp/seisaku/chosakuken/hokaisei/kantaiheiyo_chosakuken/1411890.html
  (Japan Agency for Cultural Affairs, official Q&A on the TPP11-related 2018
  term-extension reform) states that the extension does not revive a
  copyright that had already expired before the reform took effect on
  2018-12-30: works whose term had already lapsed by 2018-12-29 stay in the
  public domain; only works still protected on that date received the
  extended 70-year term. Japan's pre-reform individual-author term was life
  plus 50 years; that makes the non-revival rule relevant rather than
  permitting today's term to be applied mechanically. This audit does not
  determine the expiry date or legal treatment of this particular work.
  Edition-specific material and territory-specific reuse outside Japan
  remain separate questions requiring verification.
- **Rights status:** **unresolved**. Do not treat this as either "protected
  through 2037" (the original 01A claim, which applied today's term
  retroactively without accounting for the no-revival rule) or as a
  universal free-to-use public-domain work. Edition- and territory-specific
  clearance is required before any reuse. The task brief's separate product
  rule against bulk-ingesting Wada remains in force regardless of this
  unresolved rights question.

---

## Numeric source-color candidate assessment

Per the brief: a numeric candidate is only collected if a primary source
"actually supplies authoritative numeric color values and an appropriate
reuse basis," and an honest empty list is a valid result.

| Source | Has numeric color data? | Reuse basis | Raw values actually read this pass? | Eligible this pass? |
| --- | --- | --- | --- | --- |
| A1 Munsell Renotation Data | Yes — measured/interpolated `xyY` (per its listing page) | Unresolved (no stated license) | No | No |
| A2 NBS SP440 | Yes — Munsell-notation centroids (per its abstract/description) | Verified public domain (text) | No | No |
| A3 CIE 015:2018 | Standards/formulas, not a color list | Commercial, exact terms unverified | No | No |
| B1 Ridgway 1912 | No — printed pigment plates only | Verified public domain | n/a | No (no numeric data) |
| B2 Werner's 1821 | No — hand-painted plates only | Verified public domain | n/a | No (no numeric data) |
| B3 Wada 1933–34 | No colorimetric data found | Unresolved, territory/edition-specific | n/a | No |

Result: **no numeric source-color candidate is included in
`source-candidates-01.json` this pass; the candidate array is empty.**

The brief accepts an original numeric value in its own original space (for
example a Munsell notation or CIE `xyY` triplet) and never requires
converting it to HEX. So the reason the candidate list is empty is **not**
"conversion to HEX would be required and wasn't attempted." The actual
reason is simpler and more honest: this pass only confirmed that A1 and A2
*describe* numeric color data (via their listing/abstract pages) — it did
not actually fetch and read the raw tables themselves. The `rit-mcsl.org`
data-file host returned HTTP 403, and the NBS SP440 PDF exceeded this
session's fetch size limit, so no specific Munsell/`xyY` value from either
source has been verified against the primary document. Transcribing any
value without having read it would itself be a form of invented content, so
none was transcribed. A future pass that actually reads and verifies a
handful of values from A1 or A2 — recording them in their original Munsell/
`xyY` space, with source locator and conditions, and with A1's reuse-license
question resolved first — could produce a legitimate small numeric
candidate without any HEX conversion at all.

## Unresolved rights and follow-up questions

1. **Munsell Renotation Data reuse license (A1).** RIT's Munsell Color
   Science Laboratory should be asked directly whether the renotation
   tables carry an explicit reuse license (their page states only "as is,"
   with no grant). This blocks using A1 as a numeric candidate even before
   anyone reads the raw table values.
2. **A1/A2 raw values unread.** Neither the Munsell renotation `.dat` files
   nor the SP440 centroid table were actually fetched and read in this
   pass (403 and fetch-size-limit respectively). A future task should read
   them directly and transcribe a small number of values verbatim, in their
   original Munsell/`xyY` space — no conversion required — rather than
   describing them secondhand.
3. **SP440 embedded figures (A2).** The public-domain determination here
   covers Kelly & Judd's U.S.-government-authored text and Munsell-notation
   tables. It does not independently confirm the rights status of every
   reproduced chart/figure inside the document; none were extracted or used
   here, so this is a note for any future page that would reproduce a figure
   image rather than a transcribed value.
4. **CIE 015:2018 exact terms (A3).** Confirmed as commercial/paid, but the
   actual license/EULA text was not read, so no specific redistribution
   clause can be cited. Treat as reference-only pending someone actually
   reading the purchased document's terms.
5. **Wada's actual Japan-domestic status (B3).** This pass located the
   correct official rule (no revival of already-expired terms) but did not
   independently confirm the exact expiry date computation, any
   collective-work treatment, or territory-specific status outside Japan.
   That determination, plus any modern-edition rights, needs dedicated
   legal-facing verification before this source is treated as usable in any
   way, even descriptively beyond what is recorded here.

## Checks actually run

The activity list below was reported by Claude for both passes. Codex
reviewed the delivered files and the official transition-rule source, but
did not independently re-open every source or certify exact tool counts.

- **WebSearch:** Munsell, NBS SP440, Ridgway, Werner's, Wada, CIE pricing,
  NIST copyright policy, NDL bibliography, and the Bunka-chō reform Q&A.
- **WebFetch, successful (returned usable content):**
  `rit.edu/science/munsell-color-science-lab-educational-resources`,
  `nist.gov/publications/color-universal-language-and-dictionary-names`,
  `archive.org/details/wernersnomencla00wern`,
  `en.wikipedia.org/wiki/Sanzo_Wada`,
  `archive.org/details/colorstandardsc00ridg`,
  `library.si.edu/digital-library/book/colorstandardsc00ridg`,
  `cie.co.at/publications/colorimetry-4th-edition`,
  `nist.gov/copyrights-disclaimers` (200, but its content did not cover
  publications, only software — not relied on for the PD claim),
  `nist.gov/open/license`,
  and (01B) `bunka.go.jp/seisaku/chosakuken/hokaisei/kantaiheiyo_chosakuken/1411890.html`.
- **WebFetch, failed with an HTTP error (not relied on for any claim):**
  `biodiversitylibrary.org/item/126819` (403),
  `biodiversitylibrary.org/bibliography/144788` (403),
  `nist.gov/nist-information-quality-standards/...` (404, wrong URL — replaced
  by the working `nist.gov/open/license` above),
  `rit-mcsl.org/MunsellRenotation/` (403).
- **WebFetch, attempted but incomplete:** `nvlpubs.nist.gov/.../nbsspecialpublication440.pdf`
  — request exceeded the tool's content-size limit, so the PDF's actual
  centroid table was never read; only its existence and bibliographic
  metadata (via the NIST publication record page) are used as evidence.
- No `npm` command, build, test, database query, or network write was run in
  either pass. Only these two files were created/modified; no other
  repository path was touched.

## Next smallest task

Do not expand this into a bulk collection pass. The smallest useful next
step is one of: (a) a short, separate rights-clarification note once RIT
MCSL responds about the Munsell renotation data's license; (b) actually
fetching and reading a small number of raw values from A1's `.dat` files or
A2's centroid table and transcribing them, unconverted, in their original
Munsell/`xyY` space, once A1's license question is resolved; or (c) a
dedicated legal-facing verification of Wada's actual Japan-domestic and
territory-specific status, kept separate from any reuse decision. None of
these require a HEX conversion methodology; that earlier framing was itself
part of what this correction pass fixed. Any of the above should stay
scoped to research/rights output only, with no schema, runtime, or
approved-ID change.
