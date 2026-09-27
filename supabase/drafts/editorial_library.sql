-- REVIEW DRAFT ONLY. Not in the deployment migration chain; not remotely applied.
-- Discovery approval is separate from palettes.is_published, which legacy
-- project snapshot RPCs still use to validate reference IDs. Never mass-toggle it.
begin;

create table public.editorial_name_reservations (
  name_key text primary key check (name_key ~ '^[a-z]+( [a-z]+)?$' and length(name_key) <= 18),
  palette_id text not null references public.palettes(id),
  reserved_at timestamptz not null default now()
);

create table public.editorial_palette_entries (
  palette_id text primary key references public.palettes(id),
  status text not null default 'draft' check (status in ('draft', 'review', 'approved', 'archived')),
  canonical_name text check (canonical_name is null or
    (canonical_name ~ '^[A-Za-z]+( [A-Za-z]+)?$' and length(canonical_name) <= 18)),
  aliases text[] not null default '{}',
  category text not null default '' check (length(category) <= 60),
  tags text[] not null default '{}',
  use_cases text[] not null default '{}',
  colors text[] not null default '{}',
  credit text check (credit is null or length(credit) <= 160),
  source_url text check (source_url is null or source_url ~ '^https://' and length(source_url) <= 2048),
  provenance_kind text check (provenance_kind in ('external', 'owner_supplied', 'ai_concept', 'no_image')),
  license_url text check (license_url is null or license_url ~ '^https://' and length(license_url) <= 2048),
  rights_verified_at timestamptz,
  owner_approved_at timestamptz,
  sort_order integer not null default 0,
  search_document tsvector not null default ''::tsvector,
  updated_at timestamptz not null default now(),
  check (cardinality(aliases) <= 30 and cardinality(tags) <= 30 and cardinality(use_cases) <= 30)
);

create function public.validate_editorial_entry()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_owner text;
begin
  if tg_op = 'UPDATE' and new.palette_id <> old.palette_id then
    raise exception 'Editorial palette identity cannot change';
  end if;
  if new.canonical_name is not null then
    insert into public.editorial_name_reservations(name_key, palette_id)
    values (lower(new.canonical_name), new.palette_id) on conflict (name_key) do nothing;
    select palette_id into v_owner from public.editorial_name_reservations
      where name_key = lower(new.canonical_name);
    if v_owner <> new.palette_id then raise exception 'Editorial name is already reserved'; end if;
  end if;
  if tg_op = 'UPDATE' and old.canonical_name is not null and
    old.canonical_name is distinct from new.canonical_name then
    if not (old.canonical_name = any(new.aliases)) then
      new.aliases := array_append(new.aliases, old.canonical_name);
    end if;
  end if;
  if new.status = 'approved' then
    if new.canonical_name is null or new.owner_approved_at is null or
       new.rights_verified_at is null or new.provenance_kind is null then
      raise exception 'Name, owner approval and provenance review are required';
    end if;
    if cardinality(new.colors) <> 5 or exists (
      select 1 from unnest(new.colors) color where color is null or color !~ '^#[0-9A-Fa-f]{6}$'
    ) then raise exception 'Exactly five valid HEX colors are required'; end if;
    if new.provenance_kind = 'external' and (new.source_url is null or
       new.credit is null or length(trim(new.credit)) = 0 or new.license_url is null) then
      raise exception 'External images require credit, source and license links';
    end if;
  end if;
  new.search_document := to_tsvector('simple'::regconfig,
    coalesce(new.canonical_name, '') || ' ' || array_to_string(new.aliases, ' ') ||
    ' ' || new.category || ' ' || array_to_string(new.tags, ' ') || ' ' || array_to_string(new.use_cases, ' '));
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.validate_editorial_entry() from public, anon, authenticated;
create trigger validate_editorial_entry before insert or update on public.editorial_palette_entries
for each row execute function public.validate_editorial_entry();

-- Do not reserve old generated labels or approve any old record.
insert into public.editorial_palette_entries(palette_id, status)
select id, 'archived' from public.palettes;
create index editorial_search_idx on public.editorial_palette_entries using gin(search_document);
create index editorial_tags_idx on public.editorial_palette_entries using gin(tags);
create index editorial_order_idx on public.editorial_palette_entries(status, sort_order, palette_id);

alter table public.editorial_name_reservations enable row level security;
alter table public.editorial_palette_entries enable row level security;
revoke all on public.editorial_name_reservations, public.editorial_palette_entries from anon, authenticated;
grant select on public.editorial_palette_entries to anon, authenticated;
create policy "Read approved editorial entries" on public.editorial_palette_entries
for select to anon, authenticated using (status = 'approved');

-- Bounded text/tag search; palette color similarity remains the browser's
-- exact one-to-one Oklab assignment for this small editorial collection.
create function public.search_editorial_palettes(p_query text default '', p_tag text default null,
  p_limit integer default 30, p_offset integer default 0)
returns setof public.editorial_palette_entries language sql stable security invoker set search_path = '' as $$
  select entry.* from public.editorial_palette_entries entry
  where entry.status = 'approved'
    and (nullif(trim(p_query), '') is null or entry.search_document @@
      websearch_to_tsquery('simple'::regconfig, left(p_query, 200)))
    and (p_tag is null or p_tag = any(entry.tags))
  order by entry.sort_order, entry.palette_id
  limit greatest(1, least(coalesce(p_limit, 30), 100))
  offset greatest(0, least(coalesce(p_offset, 0), 10000));
$$;
revoke all on function public.search_editorial_palettes(text, text, integer, integer) from public;
grant execute on function public.search_editorial_palettes(text, text, integer, integer) to anon, authenticated;
commit;
