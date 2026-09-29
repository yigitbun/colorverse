# ColorVerse

An interactive color atlas and palette studio, redesigned from [colorverse.byigit.dev](https://colorverse.byigit.dev/).

## Development

Run `npm run dev` for a real local development server at
`http://127.0.0.1:4174`. Vite serves `dist/` as the authored application root
and refreshes the browser as HTML, CSS, and JavaScript files change. Use
`npm run dev:network` only when the local preview needs to be opened from
another device on the same network.

There is no separate online development address. Work locally with hot reload,
then publish reviewed changes through `main` to `colorverse.byigit.dev`. This
is currently the public working site, so visitors can see each release.

## Features

- A continuous geodesic color globe with 630 hexagonal cells, 12 topologically necessary pentagons, bevels, directional lighting, pointer rotation, keyboard selection, zoom, and pause.
- A compact homepage Mini Studio with a five-color working palette and optional world starters. The owner's approved world-menu design remains intact.
- An approval-gated Library engine with text, alias, context, and Oklab similarity matching. The approved collection is currently empty; 100 legacy color records and seven retired review palettes remain for existing Studio/project references. Explore displays four handpicked owner-supplied product visuals with explicit AI concept indicators; all eight AI studies remain in the experiment registry and their palette interpretations remain provisional. Third-party photos and source metadata are archived outside `dist/`.
- An unpassworded `/sandbox/` with its own local draft: product surface mapping, tone controls, frozen comparison, editable name suggestions, segmented controls, motion feedback, undo and a searchable command menu. `/sandbox/one-shape/` adapts the owner-supplied HTML animation with play/pause and scrubbing. RoomKit is unchanged.
- Short ASCII name suggestions for new unnamed palettes. Existing member names, including non-ASCII names, remain unchanged; names are not database identifiers.
- Objects, Screens, and Campaigns previews that respond to the chosen palette. ColorwayKit maps body, cap, label, carton and backdrop independently, compares a frozen baseline, and exports a PNG. Older Report projects retain their legacy preview.
- CSS, SCSS, Tailwind, JSON, and hex-list export. Working clipboard actions and measured text/background contrast.
- Client-side image extraction using weighted k-means, with file validation, draggable sample points, preserved image proportions and original-resolution manual sampling. Images are not uploaded or stored in project snapshots.
- Dark/light theme, keyboard-operable tabs and carousel, reduced-motion support, and independently addressable `/explore/`, `/extract/`, `/studio/`, `/about/`, and `/worlds/` pages.
- A focused MVP flow: the home page creates a direction, `/explore/` is the approval-gated library, `/extract/` reads an image three ways, and `/studio/` is the preview/export workspace with opt-in private projects. There is no payment or waitlist flow.
- Signed-in Studio users can keep private projects, reusable templates, palette collections, and a Color Tray; the Prototype bench locks Prototype 1 and stores Prototype 2 as a separate alternative. Private workspace data can be removed from the account surface. Community writes remain closed until moderation and takedown are ready.

## Source

`dist/` is both the authored static application and the deployable directory;
the build validates it rather than compiling a second copy. Each route has its
own HTML entrypoint. The main modules are:

- Runtime: `app.js` orchestrates interactions; `geometry.js`, `globe.js`, and
  `color.js` provide sphere geometry, rendering and color/extraction/export math.
- Account/private work: `account-client.js`, `account-navigation.js`,
  `email-access.js`, and `email-code-flow.js` share account/session and code-entry
  behavior; `project-store.js` and `member-palette.js` manage private persistence.
- Content: `palettes.js` preserves legacy records; `curation.js`, `ai-studies.js`,
  and `retired-review-palettes.js` separate approved, proposed and retired content.
  `library-engine.js` handles local search/filter/similarity; `palette-names.js`
  and `palette-name-library.js` supply editable names. `palette-handoff.js`
  validates browser-local transport into Studio.
- Image extraction: `image-file.js` checks uploads, `image-sampling.js` reads
  original pixels, and `extract-workspace.css` defines the image/points workspace.
- Experiments: `colorway-kit.js` provides code-native product mapping;
  `community-feed.js` is the local feed prototype; `sandbox/` has independent
  experiment state and the supplied One Shape player. `home-test/` still contains
  duplicated trial modules; it is not the canonical homepage.
- Styles: `styles.css` contains shared components; `design-system.css` defines
  the quiet theme. Page-specific CSS refines the compact cards and workspaces.
  Nunito Sans is self-hosted with its OFL license.
- Validation: `scripts/validate-static-site.mjs` checks references, imports,
  syntax and inline-script/handler restrictions; `scripts/test-*.mjs` cover
  static contracts and unit/mocked behavior, not complete browser journeys.

The earlier React component integration under `components/ui/` is retained and is independent of this static application. The v10 prototype is preserved in `docs/prototype-v10.html`.

Production is deployed from GitHub `main` to Cloudflare Pages at
[`colorverse.byigit.dev`](https://colorverse.byigit.dev). `.openai/hosting.json`
configures a separate private Sites preview and must not claim the public
domain. Agents should start with [`AGENTS.md`](AGENTS.md); the full domain and
release runbook is in [`docs/operations.md`](docs/operations.md).

## Backend infrastructure

The workspace is linked through the Supabase CLI to **ColorVerse Studio** (Free
plan, Frankfurt). Accounts use a shared passwordless email → eight-digit code
flow for new and returning members; private Studio
projects and saved palettes are protected by owner-only RLS. See
[Supabase setup](docs/supabase-setup.md) for the schema, security model,
credential rules, and remaining backend work.

For the current MVP verdict and release gates, see
[the MVP gap audit](docs/mvp-gap-audit.md).

To continue in a fresh chat, start with [AGENTS.md](AGENTS.md) and the short
[session bridge](docs/session-bridge.md), then follow the task-based reading
order. [The session handoff](docs/handoff.md) is historical context;
[open work](docs/open-work.md) is the canonical task queue. The current-state
block in [product decisions](docs/product-decisions.md) overrides superseded
history.
Private transcripts, external-photo backups, the old local workspace and the
founder playbook are deliberately excluded from this public repository.

`npm run check:release` validates static references and runs the local regression
suite. `npm run test:live` checks the currently hosted infrastructure and anonymous
access boundaries without sending mail or creating users. After a reviewed release,
`npm run test:live:release` additionally checks the new product/code-entry assets.
Neither command proves real inbox delivery or authenticated save/resume.
