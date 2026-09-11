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

The workspace is linked to this project through the Supabase CLI. Local link metadata
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
workspace does not apply that configuration to the hosted project. No application
schema, seed data, storage buckets, or website integration were deployed in this step.
The published site continues to use its existing static palette data and client-side
image extraction.

## Existing project

The older `ColorVerse` project (`ukftlivoujhgrqnxgrhp`) was left unchanged.
The dashboard reports that it was paused on 2025-06-22 and can no longer be restored
in place. It offers database and storage backup downloads. Inspect those backups
before deciding whether any earlier data should be migrated into the new project.

## Next implementation work

- Agree on the Studio data model, including images, palette variants, extraction
  parameters, provenance and versions, before creating application tables.
- Track schema changes in SQL migrations and define explicit grants and row-level
  security policies before exposing data to the browser.
- Decide which assets are public and which uploads are private before setting up
  storage buckets and retention rules.
- Connect application features after the schema and access policies are ready.
  Keep product records in Postgres and behavior analytics in GA4.
