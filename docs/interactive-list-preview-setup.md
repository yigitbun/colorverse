# InteractiveListPreview setup

The current ColorVerse workspace is a static site (`dist/index.html`); it does not contain React, TypeScript, Tailwind, shadcn, or a package manifest. The requested component has therefore been added non-destructively at:

- `components/ui/interactive-list-preview.tsx`
- `components/ui/interactive-list-preview-demo.tsx`

To run it in a React/shadcn app, create or migrate the app with the shadcn CLI, then install the required runtime:

```bash
npx shadcn@latest init
npm install gsap
```

The component expects the standard `@/components/ui` alias and Tailwind utility classes. It uses remote Unsplash images in the demo only; replace those URLs with local assets before production use. Desktop users get the pointer-following GSAP preview. Coarse-pointer devices get a readable image grid instead.
