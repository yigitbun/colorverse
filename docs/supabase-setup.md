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
`supabase/migrations/`. A generated migration synchronizes the 100-item static
palette library into Postgres; once applied, curated palettes remain read-only
to browser roles. Projects, project versions, templates,
collections, saved palette items, and extraction history are restricted to their
authenticated owner with explicit grants and row-level security. The dashboard
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
The current hosted project was initialized before CLI migration history was
recorded, so reconcile that history only after comparing the live schema; do not
blindly replay the initial migration.

The current snapshot RPC validates project names, supported contexts, five
six-digit HEX values, bounded role/editor objects, and published source palette
references before writing a project and its version atomically. Authenticated
browser roles have read-only access to their RLS-visible project and version
rows; project mutations are exposed only through this narrow RPC, which derives
ownership from `auth.uid()` rather than accepting a user id from the browser.

## Next implementation work

- Decide which assets are public and which uploads are private before setting up
  storage buckets and retention rules.
- Add automated two-user integration tests that prove one account cannot read or
  modify another account's projects before opening broader account access.
- Keep product records in Postgres and behavior analytics in GA4. Do not send
  project names, colors, emails, or other user-authored values to GA4.
