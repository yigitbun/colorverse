# Open Sandbox

Routes: `/sandbox/` and `/sandbox/one-shape/`. Entry links live in the Explore
collection footer and Lab intro, outside the RoomKit workbench.

The owner requested an unpassworded accumulation space for experiments. These
pages intentionally have no authentication guard and no account SDK, backend
write, analytics script, iframe or external dependency. `noindex,nofollow` is
a discovery preference, not access control. After a normal Cloudflare release,
anyone with the URL can open them. They are not a private environment.

The draft key is `colorverse-sandbox-v1`, separate from account and Studio drafts.
`state.js` validates version, five HEX values, bounded name, selected color,
allowlisted concept ID, assignments and optional baseline. Missing, corrupted
or denied storage falls back to a usable in-memory experiment; the UI reports
when persistence is unavailable. Reset and Undo affect only this Sandbox draft.
"Open in Studio" is the sole explicit palette handoff. It carries the current
name, exact five colors, surface assignments and optional baseline, not a foreign
catalog ID or the AI photo.

The first workbench includes ColorwayKit surface mapping and PNG export, HSL
controls, frozen comparisons, a sample surface switch, segmented controls,
simulated button feedback, editable name suggestions and a command menu.
Button feedback is labeled simulated; it does not pretend to save to an account.
The same owner-supplied images provide context, not dynamic photo recoloring.

## One Shape reference

The supplied `one-shape.html` is a scripted 14-second morphing animation, not
a collection of functional products. Its time-based spring channels and visual
sequence are retained in `one-shape/reference.js`; the player provides genuine
Play/Pause, Replay and timeline controls. Scripts/styles are externalized for
the existing CSP. The embedded third-party font is not copied; the site font
is used. The fixed 1440px stage scales within a responsive viewport; text-cursor
measurement compensates for that scale. Playback starts paused, respects
reduced-motion changes and stops on page hide. No security headers were relaxed.

New experiments can be added as scoped sections/modules here, with their own
validation and explicit side effects. Do not auto-promote them to the homepage,
Studio, or RoomKit. Do not upload private experiments or create public community
posts as part of testing.

## Local verification — 2026-09-27

Earlier implementation verification: static validation and 99 unit/regression
tests passed at that checkpoint. The later handoff check passed 101 tests;
see [MVP evidence](mvp-gap-audit.md). It did not repeat these browser journeys.
Desktop browser checks
covered independent surface assignments, baseline immutability, live HEX edits,
undo, name suggestion, manual naming and exact-color Studio handoff. The motion
player played, paused and scrubbed without warnings/errors. At 390px, Explore
filtered to one AI study and opened its exact five colors in Studio; Sandbox and
its command dialog fit without horizontal overflow. No accounts were created,
mail sent or backend data changed. A Cloudflare release has not been performed.
