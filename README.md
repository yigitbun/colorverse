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
- Dark/light theme, keyboard-operable tabs and carousel, reduced-motion support, and independently addressable `/explore/`, `/extract/`, and `/about/` pages.
- Original pricing intent (free + Pro coming soon), maker story, contact, and links to the existing site's privacy, terms, and Pro updates. There is no simulated account, payment, or waitlist backend.

## Source

`dist/index.html` is the shared page shell; the three route entrypoints mirror it for simple static hosting. `styles.css` controls the responsive design. `app.js` connects the product interactions. `geometry.js` builds the dual icosphere; `globe.js` renders it. `color.js` contains color math, extraction, and export. `palettes.js` preserves the original site's palette data. Two original photo URLs returned 404 (Tuscan Earth and Cyber Neon), so those use working landscape and abstract references from the existing studio collection.

The earlier React component integration under `components/ui/` is retained and is independent of this static application. The v10 prototype is preserved in `docs/prototype-v10.html`.

Hosting is configured by `.openai/hosting.json`. Private publication uses Sites; the original `colorverse.byigit.dev` deployment is not changed.
