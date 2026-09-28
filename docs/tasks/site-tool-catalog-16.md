# SITE-TOOL-CATALOG-16 — Shared bottom-of-page product shelf

Owner: Claude Opus 5.5; Codex reviews/integrates. Read AGENTS.md,
docs/agent-coordination.md and this brief. The owner points to Adobe Color's
bottom “Do more with color” tool catalog as an interaction reference, not a
design to copy. Our shelf should feel unmistakably ColorVerse.

## Deliverable

On all primary public pages, add one shared, responsive five-card tool shelf
immediately before the footer. Five real destinations: Explore globe (`/`),
Image to palette (`/extract/`), Palette Studio (`/studio/`), Inspiration
(`/inspiration/`), Library (`/explore/`). Each card needs one clear action,
a restrained code-native visual thumbnail and a short outcome-focused label;
no invented products, images or popularity. On the current page, either
de-emphasize its own card or point to a useful route-specific action; avoid
a visually dead self-link. Mobile must not become a tiny five-column strip.

Use a tiny standalone shared module and stylesheet, or an equivalently simple
reuse mechanism. Do not duplicate the five-card markup across every page.
Include at least the main homepage, Studio, Extract, Explore/Library,
Inspiration, Community, Lab, About, Account and Privacy routes. Keep the
Account/Privacy shelf visually quieter so it does not compete with auth/legal
content. Do not alter existing navigation, auth, analytics, app.js, data,
corpus or deployment. Existing source images and generated screenshot artwork
need not be reused; implement visuals with CSS/HTML.

Writable: new `dist/tool-catalog.js`, `dist/tool-catalog.css`, relevant primary
route `index.html` files, and focused tests. Do not edit `dist/app.js`,
`dist/color.js`, `dist/studio-editor.css`, or their tests (other active writers).
Run build/test and diff-check; commit locally, report exact revision and any
route not manually checked. No push/deploy.
