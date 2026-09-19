# ColorVerse

An interactive color atlas and palette studio, redesigned from [colorverse.byigit.dev](https://colorverse.byigit.dev/).

## Preview

Serve the authored static output with `python3 -m http.server 4186 --directory dist`.

## Features

- A continuous geodesic color globe with 630 hexagonal cells, 12 topologically necessary pentagons, bevels, directional lighting, pointer rotation, keyboard selection, zoom, and pause.
- Compact, horizontal, touch-friendly gallery containing the 10 original palettes and the 5 additional studio studies. All palettes retain five colors and inspiration images.
- Website, presentation, social, and shop previews that respond to the chosen palette.
- CSS, SCSS, Tailwind, JSON, and hex-list export. Working clipboard actions and measured text/background contrast.
- Client-side image extraction using weighted k-means, with file validation and transparent/monochrome-image handling. Images are not uploaded.
- Dark/light theme, keyboard-operable tabs and carousel, reduced-motion support, and independently addressable `/explore/`, `/extract/`, `/studio/`, `/about/`, and `/worlds/` pages.
- A focused MVP flow: the home page starts discovery, `/explore/` is the palette library, `/extract/` reads an image three ways, `/studio/` is the preview/export workspace with opt-in private projects, and `/about/` contains product and privacy context. There is no payment or waitlist flow.

## Source

`dist/index.html` is the focused home page; each route entrypoint has one job for simple static hosting. `styles.css` contains the base components and miniature preview layouts. `design-system.css`, loaded after it, defines the current quiet product theme: Nunito Sans, neutral light/dark surfaces, restrained red accents, compact horizontal cards, and responsive controls. Nunito Sans is self-hosted with its OFL license. `app.js` connects the product interactions and `project-store.js` provides private Supabase project/version persistence. `geometry.js` builds the dual icosphere; `globe.js` renders it. `color.js` contains color math, extraction, and export. `palettes.js` preserves the current palette data.

The earlier React component integration under `components/ui/` is retained and is independent of this static application. The v10 prototype is preserved in `docs/prototype-v10.html`.

Production is deployed from GitHub `main` to Cloudflare Pages at
[`colorverse.byigit.dev`](https://colorverse.byigit.dev). `.openai/hosting.json`
configures a separate private Sites preview and must not claim the public
domain. Agents should start with [`AGENTS.md`](AGENTS.md); the full domain and
release runbook is in [`docs/operations.md`](docs/operations.md).

## Backend infrastructure

The workspace is linked through the Supabase CLI to **ColorVerse Studio** (Free
plan, Frankfurt). Studio uses passwordless authentication and owner-only RLS for
private, versioned projects. See [Supabase setup](docs/supabase-setup.md) for the
schema, security model, credential rules, and remaining backend work.
