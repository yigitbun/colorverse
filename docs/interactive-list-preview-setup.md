# InteractiveListPreview setup

Historical integration note; this React demo is not loaded by the current
ColorVerse application. The repository now has a package manifest and Vite
development server, but its deployable runtime remains plain static HTML/CSS/JS
under `dist/`, without a React/Tailwind/shadcn build. The retained demo files are:

- `components/ui/interactive-list-preview.tsx`
- `components/ui/interactive-list-preview-demo.tsx`

Only if a separate React/shadcn integration is explicitly requested, create or
migrate that app and install its runtime. These commands are not current
ColorVerse setup instructions:

```bash
npx shadcn@latest init
npm install gsap
```

The component expects the standard `@/components/ui` alias and Tailwind utility classes. It uses remote Unsplash images in the demo only; replace those URLs with local assets before production use. Desktop users get the pointer-following GSAP preview. Coarse-pointer devices get a readable image grid instead.
