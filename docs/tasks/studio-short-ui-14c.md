# STUDIO-SHORT-14C — Show authored colors honestly in Studio

Owner: Claude Opus 5.5; Codex reviews/integrates. Start only after 14B is
integrated. Read AGENTS.md, docs/agent-coordination.md and this brief.

## User promise

When Studio opens a two-, three- or four-color palette, the left rail shows
exactly those authored colors. The remaining neutral colors are merely fixed
preview support for rendering product/report surfaces. The interface must
clearly distinguish support from the user's palette, without inflating the
palette count or offering support as an editable palette color.

## Narrow implementation

- `dist/app.js`, `dist/studio-editor.css`, and focused existing Studio UX tests
  only. No data model, Account, project store, Supabase, corpus or deployment.
- Keep the left rail as two to four actual color buttons. Add a compact,
  visibly muted non-button indication near the rail that neutral preview
  support is used, rather than fabricating three extra palette members.
  In collapsed rail, preserve color-first layout and a concise accessible label.
- Show the existing five-slot “Use in preview” control for short palettes too.
  Clearly identify support slots there as “Preview support”; selecting one
  trades the selected authored color with support, without changing authored
  count. Preserve larger palettes and legacy five-color behavior.
- Fix `assignPreviewRole` status text so replacing a support slot never says
  `Color NaN`. The “Swap with next” action must not treat a short palette as
  five actual members: either adapt it safely to actual member count or hide
  it for 2–4. Preserve existing five-color action.
- Keep all color editing on authored members. Test 2/3/4/5/8 render/control
  boundaries and accessibility text; support neutrals must not become palette
  members after any UI action.

Run focused tests and `npm run check:release`; report exact commit and any
untested browser path. Commit locally if possible. No push/deploy.
