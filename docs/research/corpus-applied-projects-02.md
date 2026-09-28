# Applied-project candidates 02 — CORPUS-APPLIED-02

Task: [`docs/tasks/corpus-applied-projects-02.md`](../tasks/corpus-applied-projects-02.md).
Base commit: `42cfd6f`, branch `codex/claude-corpus-applied`. Research only.
No palette, HEX derivation, curation ID, schema, image, app or DB change.
Nothing here is editorially approved; every entry is a **research candidate**
for Codex review and owner decision. Sources were read on 2026-09-28.

## Method and labels

Only primary sources were used: the project owner's own website, published
standards documents, the original design report, and official licence or
brand-use pages. No palette aggregator, Adobe Color, Coolors or colour-name
site was used as evidence. Some search results pointed to such sites; they
were ignored.

Each statement uses one of these labels:

- **[Doc]** — a value or rule printed in a primary source. It is transcribed
  here exactly and not converted.
- **[Obs]** — something I saw in a primary-source page or scan. This is visual
  judgment, not a specification.
- **[Interp]** — something ColorVerse would have to decide or derive itself.
- **Rights** — only what a direct rights source says. If no licence is stated,
  the status is *unresolved*, not *cleared*.

"Without copying images" means the story could run on ColorVerse's own
typography and swatches, using transcribed **[Doc]** values, paraphrase and
short attributed quotations. It would not reproduce photographs, scans,
logos or roundels.

---

## C1. Golden Gate Bridge — International Orange (1935 decision, current maintenance)

- **Project and owner:** The Golden Gate Bridge, San Francisco. It is owned
  and maintained by the Golden Gate Bridge, Highway and Transportation District.
  The colour was specified by Consulting Architect Irving F. Morrow of
  Morrow & Morrow.
- **Direct project URLs:**
  - Colour and Art Deco page:
    https://www.goldengate.org/bridge/history-research/bridge-features/color-art-deco-styling/
  - Painting the bridge:
    https://www.goldengate.org/bridge/bridge-maintenance/painting-the-bridge/
  - Morrow's original report, hosted by the District as a scanned fax:
    https://www.goldengate.org/assets/1/6/reportcolorlighting.pdf
- **What is visibly applied:**
  - **[Obs]** One warm orange-red covers the towers, cables and deck
    structure.
  - I did not verify whether the whole structure uses a single tone today,
    and I make no claim about it.
- **Documented colour specifications [Doc]:** Both District pages state the
  same values.
  - **CMYK formula:** "C= Cyan: 0%, M =Magenta: 69%, Y =Yellow: 100%,
    K = Black: 6%".
  - **Pantone:** They list "closest" matches, which are approximations, not
    the specification: PMS 173 (0, 80, 94, 1), PMS 174 (8, 85, 100, 34) and
    Pantone 180 (19.4, 77.9, 79.6, 3.6).
  - **Paint:** "Currently, the paint is supplied by Sherwin Williams and is
    made to match the … International Orange color formula". The closest
    off-the-shelf paint is "Fireweed" (SW 6328).
  - **Unpublished:** The actual paint formula (pigments and gloss) is not
    published on either page.
- **Documented design decision [Doc]:** From Morrow's report dated April 6,
  1935, pages 1–8 of 29 read. It is the strongest decision record in this
  pass.
  - **Choosing to be conspicuous:** Morrow asks whether the bridge should be
    emphasised or made as inconspicuous as possible, and chooses to make it
    "count to the fullest possible degree".
  - **Climate:** He reasons from local conditions. Fog and water make the
    ambient colours cool, so the structure "must appear in contrasting or
    warm colors".
  - **Recommended colour:** He recommends the colour of the shop red-lead
    primer that observers had admired on the rising towers.
  - **Graded tones:** He proposes several "closely related tones" instead of
    one uniform coat:
    - (a) orange vermillion, the colour of shop red-lead paint, for the
      towers;
    - (b) orange vermillion slightly tinged with burnt sienna, for bracing
      and trusses;
    - (c) burnt sienna leaning toward orange vermillion, for the approach
      viaducts and cables;
    - (d) burnt sienna, for the hand rail;
    - (e) neutral gray, to "paint out" minor details.
  - **Rejected alternatives:** He rejects black and aluminum and ranks warm
    gray "a distant second".
  - **Testing on site:** No sample should be approved "until seen applied
    over a fairly large area on the structure itself".
- **What ColorVerse would have to interpret [Interp]:**
  - Any screen value, because CMYK is a print formula and not a paint or
    display specification.
  - Every one of Morrow's tones (b)–(e). These are verbal descriptions only,
    with no values.
  - Whether the graded scheme was ever carried out. The pages read do not
    establish it.
  - So only one documented colour exists. A five-colour palette would be a
    ColorVerse interpretation, not a source palette.
- **Provenance:** This is the owner's own current specification plus the
  designer's original 1935 report, both hosted by the owner. The scan is a
  2007 fax copy of a typescript and is legible. The rest of the report, pages
  9–29, including the lighting section and the letters in Enclosures A–H, was
  not read.
- **Rights:**
  - Both web pages say "© Copyright 2026 Golden Gate Bridge, Highway and
    Transportation District. All rights reserved."
  - The PDF of the report has no licence statement.
  - **Unresolved** for reusing the page text, photographs and the report scan.
  - Whether a transcribed CMYK value or a paraphrase of the 1935 reasoning
    needs permission is a legal question I have not answered. It is
    unresolved, not cleared.
- **Inspiration story without images:** **Yes, strong.** The narrative runs
  from an ambient constraint (cool fog and sea), through a policy decision
  (be conspicuous), a rejected-alternatives list, a graded tone hierarchy and
  on-site sampling, to a documented maintenance formula. It maps directly onto
  the decision chain in `docs/product-decisions.md` (constraints → environment
  → light → material → production). One caveat: this is **one documented colour
  plus a documented reasoning structure**. It is not an ingest-ready palette.

## C2. GOV.UK Design System — functional colour roles (2025 brand refresh)

- **Project and owner:** GOV.UK and the GOV.UK Design System, from the
  Government Digital Service (UK government). This is a live, finished
  digital product used across government services.
- **Direct project URLs:**
  - Colour styles: https://design-system.service.gov.uk/styles/colour/
  - Brand colour page: https://brand.design-system.service.gov.uk/colour/govuk-blue/
  - Refresh announcement: https://www.gov.uk/guidance/changes-to-govuk
  - Code repository: https://github.com/alphagov/govuk-frontend
- **What is visibly applied:** **[Obs]** Near-black text on white and pale
  blue-white surfaces, blue links and header, and a yellow focus ring.
- **Documented colour specifications [Doc]:** The colour page publishes
  HEX values by functional role, with usage rules:
  - **Text and links:** `text #0b0c0c`, `secondary-text #484949`,
    `link #1a65a6`, `link-hover #0f385c`, `link-visited #54319f`.
  - **Brand, backgrounds and focus:** `brand #1d70b8`,
    `template-background #f4f8fb`, `body-background #ffffff`,
    `focus #ffdd00`, with the rule "Only use this colour to indicate which
    element is focused on".
  - **Status and surfaces:** `error #ca3535`, `success #0f7a52`,
    `border #cecece`, `surface-border #8eb8dc`, and others.
  - **Brand page:** Primary Blue RGB 29 112 184 / `#1D70B8`, and an Accent
    Teal RGB 0 255 224 / `#00FFE0`.
  - **Refresh date and stated rationale:** GOV.UK dates the refresh
    "Published 25 June 2025". The brand page gives this reason for blue: "We're
    building on the Primary blue already in place to support recognition and
    trust."
- **What ColorVerse would have to interpret [Interp]:**
  - Very little for the values. They are declared screen HEX and need no
    conversion.
  - Choosing five of the roughly 20 roles, and mapping them onto Studio's
    Background/Surface/Primary/Accent/Text roles. This is a curatorial choice.
  - Versioning. The values are version-specific and were read on 2026-09-28;
    earlier releases may differ. Any record should cite the page and the date
    it was read.
- **Provenance:** This is the project owner's own live documentation, and
  the values also exist in versioned open-source code. It has the clearest
  provenance of the four candidates.
- **Rights:**
  - **Documentation licence:** The documentation footer says "All content
    is available under the Open Government Licence v3.0, except where
    otherwise stated".
  - **Code licence:** The repository README says the codebase is "released
    under the MIT License" and the documentation is "© Crown copyright and
    available under the terms of the Open Government 3.0 licence."
  - **Brand-use limit:** The Generic header page says a non-GOV.UK service
    must not "use the GOV.UK brand colours", "use the GDS Transport
    typeface" or "use the crown or GOV.UK logotype".
  - **Net:** This is the only candidate with an explicit open licence for
    the documentation. However, the OGL exclusions (for example logos and
    crest) were **not read in full** in this pass. The brand-use limit also
    means offering these colours as a ready-to-use brand palette in Studio
    may conflict with GDS's stated intent, even if the text is reusable.
    **Partially resolved.** The owner or Codex must decide whether an
    editorial reference is acceptable and a "use this palette" action is
    not.
- **Inspiration story without images:** **Yes.** This is the only candidate
  whose documented system already *is* a set of roles with written rules.
  Examples are "focus is for focus only" and separate link states. The
  "result" can be shown with ColorVerse's own UI rendering, labelled as a
  reconstruction and not a GOV.UK screenshot. **[Obs, judgment]** Its visual
  appeal is utilitarian. Whether it meets the owner's "beautiful" bar is an
  editorial question, not a research finding.

## C3. Elizabeth line — Design Idiom core palette and ratio of use

- **Project and owner:** The Elizabeth line, a London rail line with stations
  and trains, owned by Transport for London (TfL).
- **Direct project URLs:**
  - Design Idiom: https://content.tfl.gov.uk/elizabeth-line-design-idiom.pdf
    (Issue 3; the issue date was not shown on the pages read).
  - TfL Colour standard: https://content.tfl.gov.uk/tfl-colour-standard.pdf
    (Issue 11, "August 2026").
- **What is visibly applied:** **[Obs]** Purple and TfL blue roundels, purple
  line identity, and white. The Idiom's scope is "from rolling stock through
  to station refurbishment". Station materials are not specified by value in
  the pages read.
- **Documented colour specifications [Doc]:** From Design Idiom page 06,
  "Core Palette":
  - **Elizabeth line Purple:** Pantone 266c, CMYK 70,80,0,0,
    RGB 105,80,161, LaB 40,25,-41, HEX 6950a1.
  - **TfL Blue:** Pantone 072c, CMYK 100,88,0,5, RGB 28,63,148,
    LaB 28,14,-52, HEX 1c3f94.
  - **White.**
  - **Rationale:** Each colour is justified. Purple is the "primary way of
    quickly identifying the Elizabeth line". Blue "provides the reassurance
    and integration with the rest of" TfL. White "adds balance and order,
    avoiding overuse of the other brand colours".
  - **Ratio of use (page 07):** "Elizabeth line Purple – Pantone 266 – 40%",
    "TfL Blue – Pantone 072 – 25%", "White – 35%". The Idiom says this
    replicates the roundel and should be followed "as closely as possible".
  - **Secondary palette (page 10):** Pantone references only, for customer
    information, wayfinding, accessibility and event signage. It includes
    Legible London Blue 2767, Legible London Yellow 1235, Accessibility 300
    and Magenta.
- **Conflict between TfL's own documents [Doc]:**
  - **Colour standard Issue 11:** Gives the Elizabeth line as PMS 266, CMYK
    67 83 0 0, R96 G57 B158, NCS "N/A". TfL/London Underground blue is
    PMS 072, CMYK 100 90 0 7, R0 G25 B168.
  - **Design Idiom:** These RGB and CMYK values differ from the Idiom's.
  - **Inside Issue 11:** It also differs from itself. Corporate Yellow is
    R255 G205 B0 on page 5 and R255 G200 B10 on page 7. Corporate Red is
    R225 G37 B27 on page 5 and R220 G36 B31 on page 7.
  - The Pantone references are consistent. The screen values are not.
- **What ColorVerse would have to interpret [Interp]:**
  - Which document's RGB/HEX is authoritative. I would lean to the
    later-dated colour standard, but that is not established.
  - The remaining two colours of any five-colour set. The documented core is
    three colours and a ratio.
  - Any link to the physical station finishes. The Idiom lists materials
    principles only ("simple and self-finished materials"), with no finish
    codes.
- **Provenance:** Both are the project owner's own published standards. They
  are strong on values but internally inconsistent, as above.
- **Rights:**
  - The colour standard says "© Transport for London".
  - TfL's brand-IP page (https://tfl.gov.uk/info-for/suppliers-and-contractors/using-tfl-brand-ip)
    requires permission for "modal roundels or other corporate logos", Tube
    maps and fonts, with contact copyright@tfl.gov.uk.
  - Neither source I read says whether the colour values or colour
    combinations themselves are protected.
  - **Unresolved.** Showing the roundel in any form is clearly
    permission-gated.
- **Inspiration story without images:** **Yes**, and the documented
  **40 / 25 / 35 ratio** is unusually useful. It tells a "how much of each"
  story that plain five-swatch strips cannot. The story must not draw the
  roundel.

## C4. NASA "worm" identity — 1976 Graphics Standards Manual

- **Project and owner:** The NASA logotype and graphics system, owned by
  NASA. NASA credits the design to the firm of Danne & Blackburn: "officially
  introduced in 1975", retired in 1992 and brought back in 2020.
- **Direct project URLs:**
  - The manual: https://www.nasa.gov/wp-content/uploads/2015/01/nasa_graphics_manual_nhb_1430-2_jan_1976.pdf
    (NHB 1430.2, January 1976).
  - History page: https://www.nasa.gov/general/the-worm-is-back/
  - Usage guidelines: https://www.nasa.gov/nasa-brand-center/images-and-media/
- **What is visibly applied:** **[Obs]** A red logotype on white; black
  and white versions; a warm gray. The manual's contents cover stationery,
  publications, signage, vehicles and "Air & Space Vehicles".
- **Documented colour specifications [Doc]:** From manual pages 1.3–1.5.
  - **Defined by swatch:** NASA red and NASA warm gray are defined by
    physical swatches: "The swatches shown below are to be used in achieving
    a visual match for NASA red and NASA warm gray in any medium of
    reproduction."
  - **Process formula:** "In 4/color process printing, the formula for
    NASA red is solid red plus solid yellow."
  - **Usage rules:** Red is for use "only on white or a light value neutral
    color background". It is not to be used with "other bright saturated
    colors, or medium and dark value colors". It must never appear in red on
    a medium-value background.
  - **No numbers:** I found no PMS number or numeric value on the pages read.
    Section 2.14, "NASA Red: Color Swatches", was not read.
- **What ColorVerse would have to interpret [Interp]:** All numeric values.
  Sampling a scanned swatch would be a guess about a scan, not a
  specification.
- **Provenance:** This is the owner's own official document, hosted by the
  owner. The design credit comes from NASA's own page. Reissue publishers
  appeared in search results but were not used as evidence.
- **Rights:**
  - NASA says its material is "generally … not subject to copyright in the
    United States".
  - It also says "The NASA Insignia, Logotype, identifiers, and imagery are
    not in the public domain. The use of the Insignia, Logotype and NASA
    identifiers is protected by law."
  - **Net:** The usage rules can probably be quoted descriptively, but that
    is not established for colour-as-identity. Any depiction of the worm is
    restricted. **Unresolved** for anything beyond a text description.
- **Inspiration story without images:** **Only weakly.** The rules are a
  good "restraint" story (one active colour, light neutral grounds only).
  But with no documented value it is a **visual reference, not an
  ingest-ready palette**.

---

## Ranking for editorial review

The ranking uses evidence only. There is no harmony score and no claim that
any palette is optimal.

1. **C1 Golden Gate Bridge.** It has the best decision record: a designer's
   own reasoning, rejected alternatives, a tone hierarchy and a site-sampling
   rule, all from the owner. Its one documented value is current and
   maintained. Weak points: one colour only, and rights are unresolved
   ("All rights reserved").
2. **C2 GOV.UK Design System.** It has the best source clarity and the only
   explicit open licence. It also has the only documented *role* structure
   with usage rules, which is closest to Studio's model. Weak points: a GDS
   brand-use limit on non-GOV.UK services, and the owner still has to judge
   its visual appeal.
3. **C3 Elizabeth line.** It has fully specified core values in several
   colour systems plus a documented ratio of use, which is rare. Weak points:
   TfL's own RGB/HEX values conflict, the core is only three colours, and
   rights are unresolved.
4. **C4 NASA worm.** It has an exemplary usage-rule story and a strong
   provenance. But it has no numeric value in the pages read, and the
   logotype is legally protected. It is a visual reference only.

No candidate is an ingest-ready five-colour palette as published. C2 comes
closest. C1 and C3 would need ColorVerse to interpret, and label, the
colours the sources do not document.

## Corpus gaps

- **Sector skew.** All four candidates are public-sector or infrastructure.
  They publish their specifications; commercial hospitality, furniture,
  product and packaging projects usually do not. This pass found no candidate
  in the contexts `product-decisions.md` prefers (hospitality, devices,
  furniture, packaging) with primary-source colour values.
- **Screen vs material.** Only C2 is natively on-screen. C1 is a paint
  colour with a print CMYK formula, C3 is print/paint/screen with conflicting
  RGB, and C4 is defined by physical swatch. The corpus has no disclosed
  method for choosing between a source's own screen value and its physical
  specification.
- **Five colours is rarely documented.** Real systems document 1, 3 or
  about 20 colours. They rarely document five. Filling to five is ColorVerse
  interpretation and must be labelled as such, per the Interpretation vs
  Original distinction in the integration assessment.
- **Rights.** No candidate has a clear permission for a "use this palette in
  Studio" action. C2 has an open text licence with a brand-use limit; C1, C3
  and C4 are unresolved.

## One next research step

A short rights-scoping note for **C2 only**. It would read the OGL v3.0
text in full, including its exclusions and attribution statement, and GDS's
"Using GOV.UK Frontend without GOV.UK branding" guidance. From those it
would state whether ColorVerse may (a) describe and cite the GOV.UK colour
roles editorially and (b) offer them as an editable Studio starting point.
No values would change and no content would be drafted. If the answer is
yes for (a) only, C2 becomes a text-only Inspiration pilot. Any outreach to
the Golden Gate District or TfL would be outward-facing and needs Codex or
owner direction first.

## Checks actually run

- **Repository context read:**
  - `AGENTS.md`
  - `docs/agent-coordination.md` (first section only; the rest was shown
    truncated in tool output)
  - `docs/research/corpus-source-audit-01.md`
  - the first part of `docs/color-corpus-integration-assessment.md`
  - the Inspiration/professional-reference sections of
    `docs/product-decisions.md`
- **WebSearch:**
  - NASA manual
  - TfL colour standard
  - TfL brand IP
  - Golden Gate International Orange (general, then restricted to
    goldengate.org)
  - GOV.UK brand usage
  - NASA worm history
  - GOV.UK brand refresh
- **WebFetch, successful:**
  - `design-system.service.gov.uk/styles/colour/`
  - `design-system.service.gov.uk/components/generic-header/`
  - `brand.design-system.service.gov.uk/colour/govuk-blue/`
  - `gov.uk/guidance/changes-to-govuk`
  - `github.com/alphagov/govuk-frontend`
  - `goldengate.org/.../color-art-deco-styling/`
  - `goldengate.org/.../painting-the-bridge/`
  - `tfl.gov.uk/.../using-tfl-brand-ip`
  - `nasa.gov/nasa-brand-center/images-and-media/`
  - `nasa.gov/general/the-worm-is-back/`
- **WebFetch returned binary PDFs:** Each was saved to the session's
  tool-results folder outside the repository and read as page images with
  the Read tool.
  - TfL colour standard: pages 1–8 and 11–12, the last page.
  - Elizabeth line Design Idiom: pages 1–11. Only 11 pages were returned,
    and the issue date was not seen.
  - NASA manual: pages 1–9 of the PDF, covering manual pages i–iii and
    1.1–1.5.
  - Morrow report: pages 1–10 of 29.
- **Failed:** two guessed goldengate.org URLs returned HTTP 404. They were
  replaced by the working URLs found through search.
- **Not read:**
  - TfL colour standard pages 9–10
  - NASA manual §2.14 (the swatch page) and the rest of the manual
  - Morrow report pages 11–29
  - OGL v3.0 full text
  - NASA's current brand-guidelines colour page
- **Not done:** no file was downloaded into the repository, no image asset
  was created, and no npm command, build, DB query or network write was
  run. `git diff --check` was run before the commit; see the delivery report.
