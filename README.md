# ColorVerse

An interactive color atlas and palette studio, redesigned from [colorverse.byigit.dev](https://colorverse.byigit.dev/).

## Development

Run `npm run dev` for a real local development server at
`http://127.0.0.1:4174`. Vite serves `dist/` as the authored application root
and refreshes the browser as HTML, CSS, and JavaScript files change. Use
`npm run dev:network` only when the local preview needs to be opened from
another device on the same network.

The shared development host is `dev.colorverse.byigit.dev`, deployed from the
`dev` branch to a separate Cloudflare Pages project. The public
`colorverse.byigit.dev` site continues to deploy from `main`.

## Features

- A continuous geodesic color globe with 630 hexagonal cells, 12 topologically necessary pentagons, bevels, directional lighting, pointer rotation, keyboard selection, zoom, and pause.
- A searchable library of 100 five-color directions, with a restrained set of credited Unsplash references cached as local assets.
- Product, Interface, and analytical Report previews that respond to the chosen palette.
- CSS, SCSS, Tailwind, JSON, and hex-list export. Working clipboard actions and measured text/background contrast.
- Client-side image extraction using weighted k-means, with file validation and transparent/monochrome-image handling. Images are not uploaded.
- Dark/light theme, keyboard-operable tabs and carousel, reduced-motion support, and independently addressable `/explore/`, `/extract/`, `/studio/`, `/about/`, and `/worlds/` pages.
- A focused MVP flow: the home page starts discovery, `/explore/` is the palette library, `/extract/` reads an image three ways, `/studio/` is the preview/export workspace with opt-in private projects, and `/about/` contains product and privacy context. There is no payment or waitlist flow.
- Signed-in Studio users can keep private projects, reusable templates, palette collections, and a Color Tray; the Prototype bench locks Prototype 1 and stores Prototype 2 as a separate alternative. Private workspace data can be removed from the account surface. Community writes remain closed until moderation and takedown are ready.

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
