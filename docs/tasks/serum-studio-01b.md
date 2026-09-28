# SERUM-STUDIO-01B — connect the approved bottle, no new product variants

Owner: Codex lead, quota fallback explained to owner.
Base: `06f78e4`; dependency: reviewed SERUM-RENDERER-01A.
Status: locally integrated and browser checked, not public.

Allowed app/controller/CSS/test/cache changes only; renderer's four files
belong exclusively to the separately assigned worker until delivery.

- Mount the optional approved Katre serum profile in Skincare only.
- Defaults: Label→Background, Body→Primary, Accent→Accent, Cap→Surface,
  printed glyphs→Text. Keep five preview roles and every workspace member.
- Keep old careAssignment field names and explicit stored role indices;
  missing fields get the new defaults. Do not migrate or write hosted data.
- Update four dropdown names and usage hint; Text is print, not fixed ink.
  Scene background/clear base stay fixed. No automatic palette/color changes.
- Keep existing comparison/update/restore/clear, coalesced preview, error/retry,
  PNG export and teardown contracts. Square image fits at the bounded size.
- Update affected static tests and scoped asset cache references; add profile
  tests to the existing test command. No extra variants, UI redesign or CMS.

Acceptance: build/tests, isolated-origin browser default photo, independent
color/assignment edits and Text print, comparison/restore, context teardown,
palette order/HEX preserved, source photo unchanged and no visible color spill.
Test actual browser result; do not infer visual quality from regex assertions.
No live auth/mail/private projects, production writes or push/deploy.

## Local acceptance — 2026-09-28

Reviewed renderer `903f9ea` mounted in Skincare. Stored careAssignment names and
explicit indices stay intact; only missing values receive the new defaults.
Four controls are Label / Body / Accent / Cap; Text edits printed glyphs.
No workspace/schema/approval changes. Source PNG is byte-identical to approved v3.
App cache v100, photo engine v3, serum profile v1, photo CSS v4; affected canonical
HTML/test pins updated. Legacy renderer remains available without the profile.

`npm run check:release`: 185 PASS / 0 FAIL. Isolated-origin 4201 browser:
default photo ready, actual color/assignment edits including pale Text print,
frozen comparison, restore of original colors AND assignments, clear comparison,
Screens teardown (no photo or usage hint), and Products remount PASS. Console
warn/error list empty; Export PNG enabled. Returned to original five HEX values
and default assignments, no hosted project/save/auth actions. Owner's account
tab on 4200 and existing 4197 draft were not touched.

Preview: `http://127.0.0.1:4201/studio/?p=custom-concept-piera` (agent-created
local draft, restored to original colors). Device PNG download, current mobile
browser and authenticated persistence NOT RUN. No push or public release.
