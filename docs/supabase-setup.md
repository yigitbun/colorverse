# Supabase setup

Infrastructure initialized on 2026-09-11 with Supabase CLI 2.117.0.

## Active project

| Setting | Value |
| --- | --- |
| Project | ColorVerse Studio |
| Project reference | `ayzymeogptrqtouwnahh` |
| Organization | yigit's Org (`hbbbtvnqtjmpldmjoxxi`) |
| Plan / compute | Free / Nano |
| Region | Frankfurt (`eu-central-1`) |
| Dashboard | https://supabase.com/dashboard/project/ayzymeogptrqtouwnahh |
| API URL | https://ayzymeogptrqtouwnahh.supabase.co |

The project was restored from its free-plan pause on 2026-09-19 and the dashboard
reports it as healthy. The workspace is linked to this project through the Supabase CLI. Local link metadata
is ignored by Git in `supabase/.temp/`; another checkout must be linked explicitly.

```sh
npx --yes supabase@2.117.0 projects list
npx --yes supabase@2.117.0 link --project-ref ayzymeogptrqtouwnahh
```

The generated database password is stored in macOS Keychain under service
`ColorVerse Studio Supabase database`, account `colorverse-studio`. It is not in
the repository or the website. Use the existing CLI session and credential storage;
do not put database passwords or service-role keys in the static application.

`supabase/config.toml` configures local development. Initializing and linking the
workspace does not apply that configuration to the hosted project.

The hosted database has the private workspace schema recorded in
`supabase/migrations/`. The initial schema was already present on the restored
project, so its migration history was reconciled on 2026-09-20 instead of
replaying table creation. The snapshot RPC and generated 100-item palette
catalog migrations are now applied remotely; the hosted catalog contains 100
palettes and 500 role-color rows. Curated palettes remain read-only to browser
roles. Projects, project versions, templates, color tray items,
collections, saved palette items, and extraction history are restricted to their
authenticated owner with explicit grants and row-level security. Extraction
history has no browser grant in the MVP because image extraction remains local;
the table is reserved for a future validated RPC. The dashboard
security advisor reported no issues after the schema was applied. There is no public
upload, Community post, comment, or vote write path in the MVP schema.

Studio uses the project's browser-safe publishable key with Supabase Auth and RLS;
the secret key remains server-only and must never enter `dist/`. Image extraction and
RoomKit image processing remain browser-local. A private project stores the project
name, five colors, role assignments, preview context, and version history—not the
source image.

## Existing project

The older `ColorVerse` project (`ukftlivoujhgrqnxgrhp`) was left unchanged.
The dashboard reports that it was paused on 2025-06-22 and can no longer be restored
in place. It offers database and storage backup downloads. Inspect those backups
before deciding whether any earlier data should be migrated into the new project.

Regenerate the palette migration after intentionally changing the static library:

```sh
npm run generate:palette-migration
```

After applying it, verify that the anonymous published-palette count is 100.
The hosted project was initialized before CLI migration history was recorded;
that comparison and reconciliation is complete for the current schema. Do not
blindly replay the initial migration in a fresh recovery or another project.

The current snapshot RPC validates project names, supported contexts, five
six-digit HEX values, bounded role/editor objects, and published source palette
references before writing a project and its version atomically. The template
snapshot RPC applies the same boundary to reusable private starts and validates
the optional source project owner before writing. Authenticated browser roles
have read-only access to their RLS-visible project, version, and template rows;
project and template mutations are exposed only through these narrow RPCs,
which derive ownership from `auth.uid()` rather than accepting a user id from
the browser.

On 2026-09-21, a rollback-only two-identity probe verified the linked database:
the owner could read its project and baseline version, the second identity saw
neither row, and a cross-user snapshot update returned `Project not found`. The
temporary auth users and project were created inside one transaction and rolled
back. This proves the database policy boundary without leaving test data behind;
an actual email/magic-link end-to-end test remains a separate account-flow check.
The production Auth settings endpoint has also been checked read-only: email
sign-up is enabled and sign-up is not globally disabled. Delivery and link
consumption still require a real inbox test.

## Remaining implementation checks

- 2026-09-22: a dedicated `ColorVerse Dev` project could not be created because
  the free account has two active projects. The owner approved using the
  existing `ColorVerse Studio` database; the site now uses a single public
  ColorVerse address. Leave the other projects and all existing records
  untouched. `20260922000100_member_palettes.sql`
  prepares private 2–24-color palette editing while retaining five-role Studio
  projects. The migration is remotely applied and the live owner/cross-user/
  anonymous boundary test passes with disposable users removed afterward.
- `/account/` adds email/password signup, sign-in, recovery and a paginated
  private palette library. Hosted Auth redirects include the public site and
  local development. Custom SMTP is
  enabled through the verified `byigit.dev` domain in Resend with a restricted
  sending-only key. A real inbox confirmation/recovery test still remains
  before declaring email delivery fully verified.

- Exercise the real email/magic-link account flow end to end before opening
  broader account access; the rollback-only two-identity RLS boundary probe is
  already verified. This requires a real inbox and is not safely simulated by
  an anonymous smoke test.
- No Supabase Storage bucket is used in the MVP: Extract and RoomKit uploads
  remain browser-local, are never public Community content, and are discarded
  when the local page state is cleared. Revisit storage only alongside an
  explicit publish, moderation, rights, and retention design.
- The project-level A/B prototype workbench now uses a validated RPC: Prototype
  1 is locked as a private baseline and Prototype 2 records a parent reference
  instead of overwriting it.
- Public Community posts, comments, votes, reports, and moderation remain
  closed until the shared-content review and takedown path exists.
- Keep product records in Postgres and behavior analytics in GA4. Do not send
  project names, colors, emails, or other user-authored values to GA4.
