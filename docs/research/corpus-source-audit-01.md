# Corpus source audit 01 — CORPUS-RESEARCH-01A

Task: [`docs/tasks/corpus-research-01a.md`](../tasks/corpus-research-01a.md).
Base commit: `21c10e723da5488574f29b021291b570a45fc2d5`. Research only; no
application code, schema, DB, generators or approved IDs touched. Nothing in
this document or in `data/research/corpus/source-candidates-01.json` is an
approved product record — see `editorialStatus: research-candidate` in that
file. Final editorial approval, runtime import and publication remain
separate, owner-directed steps per
[the integration assessment](../color-corpus-integration-assessment.md).

## Method

Live WebSearch/WebFetch against official sources only: a standards body
(CIE), a U.S. federal science agency (NIST/NBS) and its accredited lab
partner (RIT Munsell Color Science Laboratory), and national/institutional
libraries (Smithsonian Libraries, Internet Archive as their hosting mirror,
Biodiversity Heritage Library, Japan's National Diet Library / NDL Search).
No palette-aggregator sites, blog color-picker posts, or Adobe Color/Coolors
pages were used as evidence, per the task brief. Two fetches returned HTTP
403 (`biodiversitylibrary.org/item/126819`, `rit-mcsl.org/MunsellRenotation/`)
and one returned HTTP 404 (an earlier, wrong NIST copyright-page guess);
each was retried against a working official URL, recorded below as "checks
actually run." No files outside the two allowed outputs were created; no
build, install, or network write occurred.

Three academic/methodology sources and three original historical/reference
collections were verified, matching the brief's suggested shape. This is a
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
- **Rights-statement URL:** none found on the hosting page. The page's only
  reuse language is: "These files are available for download. All come 'as
  is.' We have found them useful, and done our best to ensure their
  accuracy." No explicit public-domain, open-data or Creative Commons grant
  is stated for the data itself.
- **Rights status:** **unresolved**. Text describing the resource is RIT's;
  the underlying numeric data's reuse license is not stated. Direct fetch of
  the data-file host (`rit-mcsl.org`) returned HTTP 403 during this audit, so
  only the RIT listing page (not the raw files) was directly verified.

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
- **Limitations:** Centroids are Munsell notations, not HEX; the same
  conversion caveat as A1 applies. The document also reproduces some
  figures/color-chart material whose own copyright history is not
  independently confirmed here — only the U.S.-government-authored *text* is
  addressed by the rights determination below, not every embedded figure.
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
  — the CIE's own product page, confirming it is "readily available from the
  CIE Webshop or from the National Committees of the CIE" with a stated
  "Members receive a 66,7% discount," i.e. a paid document.
- **Why useful:** Defines the standard illuminants, standard observers, and
  tristimulus/chromaticity calculation conventions that any Munsell-to-sRGB
  or historical-plate colorimetric conversion would need to cite by the
  book, rather than an ad hoc assumption.
- **Limitations:** Not freely redistributable; cannot be quoted or bundled
  into this repository. Useful only as a cited methodology reference.
- **Rights-statement URL:** none published inline; purchase terms are
  handled by the CIE Webshop (`store.accuristech.com`) and National
  Committees. No public-domain or open-access grant exists.
- **Rights status:** **verified restricted** (commercial standard;
  redistribution not permitted without purchase/license).

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
  widely cited as a historical precursor to modern color-naming systems
  (including Pantone, per secondary sources); useful as documented
  provenance for naming conventions, not for extracted pixel color.
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
  original work); author life dates independently confirmed at
  https://id.ndl.go.jp/auth/ndlna/00089958 (Web NDL Authorities, "1883-1967").
- **Why useful:** A historically significant Japanese color-combination
  reference distinct from Western color-naming traditions; explicitly named
  in the task brief as a source to identify but not bulk-ingest.
- **Limitations:** No colorimetric measurement data; a name-and-swatch
  reference from letterpress-era printing, same scan/reproduction caveat as
  B1/B2. Modern commercial reprints (e.g. Seigensha's 2011 edition) are
  separate, independently copyrighted derivative publications layered on
  top of an already-restricted original — they do not clear rights for the
  original.
- **Rights-statement URL:** none published by NDL granting reuse; Japanese
  copyright term is the author's life plus 70 years (Copyright Act of Japan,
  Art. 51), and Wada died in 1967, so the original work remains under
  copyright protection through the end of 2037.
- **Rights status:** **verified restricted**. This matches, and gives the
  documented legal basis for, the task brief's explicit rule against
  bulk-ingesting Wada.

---

## Numeric source-color candidate assessment

Per the brief: a numeric candidate is only collected if a primary source
"actually supplies authoritative numeric color values and an appropriate
reuse basis," and an honest empty list is a valid result.

| Source | Has numeric color data? | Reuse basis | Eligible this pass? |
| --- | --- | --- | --- |
| A1 Munsell Renotation Data | Yes — measured/interpolated `xyY` | Unresolved (no stated license) | No |
| A2 NBS SP440 | Yes — Munsell-notation centroids, not HEX | Verified public domain (text) | No (see below) |
| A3 CIE 015:2018 | Standards/formulas, not a color list | Verified restricted | No |
| B1 Ridgway 1912 | No — printed pigment plates only | Verified public domain | No (no numeric data) |
| B2 Werner's 1821 | No — hand-painted plates only | Verified public domain | No (no numeric data) |
| B3 Wada 1933–34 | No colorimetric data found | Verified restricted | No |

Result: **no numeric source-color candidate is included in
`source-candidates-01.json` this pass; the candidate array is empty.**

Two sources (A1, A2) do carry genuine numeric color specifications, but both
express color as **Munsell notation** (hue/value/chroma or `xyY`), not as
sRGB/HEX. Converting either to HEX requires a disclosed, defensible pipeline
— illuminant (Munsell renotation uses Illuminant C / CIE 1931 2° observer),
chromatic adaptation to a display's white point (typically D65 for sRGB),
and the sRGB primaries/gamma encoding — each a real methodological choice
that changes the resulting HEX. Producing that conversion by hand inside
this small first delivery, without a separately reviewed and verified
methodology note, risks presenting a computed approximation as if it were
the authoritative original value. That is exactly the failure mode the
brief warns against ("do not... invent HEX values to fill the slot"), even
though this would be a computed transform rather than an outright
invention. A2's rights are clean (public domain); A1's are not yet resolved.
Neither is used to fill the candidate slot in this pass.

## Unresolved rights and follow-up questions

1. **Munsell Renotation Data reuse license (A1).** RIT's Munsell Color
   Science Laboratory should be asked directly whether the renotation
   tables carry an explicit reuse license (their page states only "as is,"
   with no grant). This blocks using A1 as a numeric candidate regardless of
   conversion-methodology work.
2. **SP440 embedded figures (A2).** The public-domain determination here
   covers Kelly & Judd's U.S.-government-authored text and Munsell-notation
   tables. It does not independently confirm the rights status of every
   reproduced chart/figure inside the document; none were extracted or used
   here, so this is a note for any future page that would reproduce a figure
   image rather than a transcribed value.
3. **Munsell → sRGB conversion methodology.** No conversion was performed in
   this pass. Before any future numeric candidate is built from A1 or A2, a
   dedicated methodology note (illuminant/observer, adaptation transform,
   target RGB primaries, and worked example) should be written and reviewed
   on its own, separate from a source-color candidate delivery.
4. **B3 modern reprint rights** were not investigated in detail (out of
   scope: not proposed for ingestion). If a future task ever needed even a
   single Wada-derived color, it would need explicit rights clearance
   separate from, and in addition to, the underlying 1933–34 work's own
   restricted status.

## Checks actually run

- WebSearch: five queries covering each of the six sources plus CIE pricing
  and NDL/Wada copyright-term confirmation.
- WebFetch, successful: `rit.edu/science/munsell-color-science-lab-educational-resources`,
  `nist.gov/publications/color-universal-language-and-dictionary-names`,
  `nist.gov/open/license`, `cie.co.at/publications/colorimetry-4th-edition`,
  `archive.org/details/wernersnomencla00wern`, `archive.org/details/colorstandardsc00ridg`,
  `library.si.edu/digital-library/book/colorstandardsc00ridg`,
  `en.wikipedia.org/wiki/Sanzo_Wada`.
- WebFetch, failed and not relied on for any claim: `biodiversitylibrary.org/item/126819`
  (HTTP 403), `rit-mcsl.org/MunsellRenotation/` (HTTP 403),
  `nist.gov/nist-information-quality-standards/...` (HTTP 404, wrong URL —
  replaced by the working `nist.gov/open/license` above),
  `nvlpubs.nist.gov/.../nbsspecialpublication440.pdf` (fetched but exceeded
  the tool's content-size limit; existence and metadata were instead
  confirmed via the NIST publication record page).
- No `npm` command, build, test, database query, or network write was run.
  Only these two files were created; no other repository path was touched.

## Next smallest task

Do not expand this into a bulk collection pass. The smallest useful next
step is either (a) a short, separate rights-clarification note once RIT
MCSL responds about the Munsell renotation data's license, or (b) a
dedicated, independently reviewed Munsell-to-sRGB conversion methodology
document (illuminant/observer/adaptation/primaries, with a small worked
example and its own sanity checks) — written and reviewed on its own before
any numeric candidate is attempted from A1 or A2. Either should stay scoped
to research/rights output only, with no schema, runtime, or approved-ID
change.
