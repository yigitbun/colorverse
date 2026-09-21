-- ColorVerse MVP data model.
--
-- Public access is limited to curated, published palettes. Projects, versions,
-- templates, collections, saved palette items, and extraction history are
-- private to the authenticated owner. There is intentionally no public upload
-- or community-write path in the MVP schema.

create extension if not exists "pgcrypto" with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon;
grant execute on function public.set_updated_at() to authenticated;

create table public.worlds (
  id text primary key,
  name text not null check (character_length(name) between 1 and 80),
  short_name text check (short_name is null or character_length(short_name) between 1 and 40),
  description text check (description is null or character_length(description) <= 500),
  accent_hex text check (accent_hex is null or accent_hex ~ '^#[0-9A-Fa-f]{6}$'),
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.visual_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null check (character_length(title) between 1 and 120),
  image_url text not null check (character_length(image_url) <= 2048),
  source_url text check (source_url is null or character_length(source_url) <= 2048),
  source_credit text check (source_credit is null or character_length(source_credit) <= 160),
  license_name text check (license_name is null or character_length(license_name) <= 80),
  license_url text check (license_url is null or character_length(license_url) <= 2048),
  category text check (category is null or character_length(category) <= 60),
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table public.palettes (
  id text primary key,
  name text not null check (character_length(name) between 1 and 100),
  description text check (description is null or character_length(description) <= 500),
  category text check (category is null or character_length(category) <= 60),
  tags text[] not null default '{}',
  use_cases text[] not null default '{}',
  world_id text references public.worlds(id) on delete set null,
  visual_source_id uuid references public.visual_sources(id) on delete set null,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.palette_colors (
  palette_id text not null references public.palettes(id) on delete cascade,
  position smallint not null check (position between 1 and 5),
  role text not null check (role in ('background', 'surface', 'primary', 'accent', 'text')),
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now(),
  primary key (palette_id, position),
  unique (palette_id, role)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (character_length(name) between 1 and 120),
  description text check (description is null or character_length(description) <= 1000),
  context_type text not null default 'custom'
    check (context_type in ('custom', 'website', 'slides', 'social', 'shop', 'brand', 'roomkit', 'editorial')),
  status text not null default 'active' check (status in ('active', 'archived')),
  source_palette_id text references public.palettes(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_versions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  parent_version_id uuid references public.project_versions(id) on delete set null,
  version_number integer not null check (version_number > 0),
  name text not null check (character_length(name) between 1 and 80),
  variant_key text not null default 'checkpoint'
    check (variant_key in ('baseline', 'alternative', 'checkpoint')),
  is_locked boolean not null default false,
  colors jsonb not null
    check (jsonb_typeof(colors) = 'array' and jsonb_array_length(colors) = 5),
  roles jsonb not null default '{}'::jsonb check (jsonb_typeof(roles) = 'object'),
  editor_state jsonb not null default '{}'::jsonb check (jsonb_typeof(editor_state) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, version_number)
);

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (character_length(name) between 1 and 120),
  description text check (description is null or character_length(description) <= 1000),
  context_type text not null default 'custom'
    check (context_type in ('custom', 'website', 'slides', 'social', 'shop', 'brand', 'roomkit', 'editorial')),
  source_project_id uuid references public.projects(id) on delete set null,
  colors jsonb not null
    check (jsonb_typeof(colors) = 'array' and jsonb_array_length(colors) = 5),
  roles jsonb not null default '{}'::jsonb check (jsonb_typeof(roles) = 'object'),
  defaults jsonb not null default '{}'::jsonb check (jsonb_typeof(defaults) = 'object'),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (character_length(name) between 1 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);

create table public.saved_palette_items (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  palette_id text references public.palettes(id) on delete set null,
  name text check (name is null or character_length(name) <= 120),
  colors jsonb not null
    check (jsonb_typeof(colors) = 'array' and jsonb_array_length(colors) = 5),
  source text not null default 'manual'
    check (source in ('atlas', 'extract', 'curated', 'manual', 'project', 'community')),
  source_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(source_metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.extraction_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  source_type text not null default 'browser_upload'
    check (source_type in ('browser_upload', 'remote_image', 'curated_source')),
  source_fingerprint text check (source_fingerprint is null or character_length(source_fingerprint) <= 160),
  selected_variant text check (selected_variant is null or selected_variant in ('observed', 'focused', 'applied')),
  colors jsonb not null default '[]'::jsonb check (jsonb_typeof(colors) = 'array'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create trigger worlds_set_updated_at before update on public.worlds
for each row execute function public.set_updated_at();
create trigger palettes_set_updated_at before update on public.palettes
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger project_versions_set_updated_at before update on public.project_versions
for each row execute function public.set_updated_at();
create trigger templates_set_updated_at before update on public.templates
for each row execute function public.set_updated_at();
create trigger collections_set_updated_at before update on public.collections
for each row execute function public.set_updated_at();
create trigger saved_palette_items_set_updated_at before update on public.saved_palette_items
for each row execute function public.set_updated_at();

create index palettes_published_sort_idx on public.palettes (is_published, sort_order);
create index palettes_world_idx on public.palettes (world_id);
create index palettes_visual_source_idx on public.palettes (visual_source_id);
create index projects_user_updated_idx on public.projects (user_id, updated_at desc);
create index project_versions_project_idx on public.project_versions (project_id, version_number desc);
create index project_versions_parent_idx on public.project_versions (parent_version_id);
create index templates_user_updated_idx on public.templates (user_id, updated_at desc);
create index templates_source_project_idx on public.templates (source_project_id);
create index collections_user_updated_idx on public.collections (user_id, updated_at desc);
create index saved_palette_items_collection_idx on public.saved_palette_items (collection_id, updated_at desc);
create index saved_palette_items_palette_idx on public.saved_palette_items (palette_id);
create index extraction_runs_user_idx on public.extraction_runs (user_id, created_at desc);

alter table public.worlds enable row level security;
alter table public.visual_sources enable row level security;
alter table public.palettes enable row level security;
alter table public.palette_colors enable row level security;
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.templates enable row level security;
alter table public.collections enable row level security;
alter table public.saved_palette_items enable row level security;
alter table public.extraction_runs enable row level security;

-- Start from no browser privileges, then add the smallest required surface.
revoke all on table public.worlds from anon, authenticated;
revoke all on table public.visual_sources from anon, authenticated;
revoke all on table public.palettes from anon, authenticated;
revoke all on table public.palette_colors from anon, authenticated;
revoke all on table public.projects from anon, authenticated;
revoke all on table public.project_versions from anon, authenticated;
revoke all on table public.templates from anon, authenticated;
revoke all on table public.collections from anon, authenticated;
revoke all on table public.saved_palette_items from anon, authenticated;
revoke all on table public.extraction_runs from anon, authenticated;

grant select on table public.worlds, public.visual_sources, public.palettes, public.palette_colors to anon, authenticated;
grant select, insert, update, delete on table public.projects, public.project_versions, public.templates,
  public.collections, public.saved_palette_items to authenticated;

create policy "Published worlds are readable"
  on public.worlds for select
  to anon, authenticated
  using (is_published = true);

create policy "Visual sources for published palettes are readable"
  on public.visual_sources for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.palettes
      where palettes.visual_source_id = visual_sources.id
        and palettes.is_published = true
    )
  );

create policy "Published palettes are readable"
  on public.palettes for select
  to anon, authenticated
  using (is_published = true);

create policy "Colors of published palettes are readable"
  on public.palette_colors for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.palettes
      where palettes.id = palette_colors.palette_id
        and palettes.is_published = true
    )
  );

create policy "Owners read projects"
  on public.projects for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "Owners create projects"
  on public.projects for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "Owners update projects"
  on public.projects for update
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "Owners delete projects"
  on public.projects for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Owners read project versions"
  on public.project_versions for select
  to authenticated
  using (exists (
    select 1 from public.projects
    where projects.id = project_versions.project_id
      and projects.user_id = (select auth.uid())
  ));
create policy "Owners create project versions"
  on public.project_versions for insert
  to authenticated
  with check (exists (
    select 1 from public.projects
    where projects.id = project_versions.project_id
      and projects.user_id = (select auth.uid())
  ));
create policy "Owners update project versions"
  on public.project_versions for update
  to authenticated
  using (exists (
    select 1 from public.projects
    where projects.id = project_versions.project_id
      and projects.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.projects
    where projects.id = project_versions.project_id
      and projects.user_id = (select auth.uid())
  ));
create policy "Owners delete project versions"
  on public.project_versions for delete
  to authenticated
  using (exists (
    select 1 from public.projects
    where projects.id = project_versions.project_id
      and projects.user_id = (select auth.uid())
  ));

create policy "Owners manage templates"
  on public.templates for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check (
    (select auth.uid()) is not null
    and (select auth.uid()) = user_id
    and (
      source_project_id is null
      or exists (
        select 1 from public.projects
        where projects.id = templates.source_project_id
          and projects.user_id = (select auth.uid())
      )
    )
  );

create policy "Owners manage collections"
  on public.collections for all
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create policy "Owners manage saved palette items"
  on public.saved_palette_items for all
  to authenticated
  using (exists (
    select 1 from public.collections
    where collections.id = saved_palette_items.collection_id
      and collections.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.collections
    where collections.id = saved_palette_items.collection_id
      and collections.user_id = (select auth.uid())
  ));

create policy "Owners read extraction history"
  on public.extraction_runs for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "Owners create extraction history"
  on public.extraction_runs for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "Owners delete extraction history"
  on public.extraction_runs for delete
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
