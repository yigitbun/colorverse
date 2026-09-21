-- Keep the private Color Tray account-backed without storing source images.
create table public.color_tray_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  hex text not null check (hex ~ '^#[0-9A-Fa-f]{6}$'),
  position smallint not null check (position between 1 and 18),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, hex),
  unique (user_id, position)
);

create trigger color_tray_items_set_updated_at before update on public.color_tray_items
for each row execute function public.set_updated_at();

create index color_tray_items_user_position_idx
  on public.color_tray_items (user_id, position);

alter table public.color_tray_items enable row level security;
revoke all on table public.color_tray_items from anon, authenticated;
grant select on table public.color_tray_items to authenticated;

create policy "Owners read color tray"
  on public.color_tray_items for select
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create or replace function public.sync_color_tray(p_colors jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_colors, '[]'::jsonb)) <> 'array'
     or jsonb_array_length(coalesce(p_colors, '[]'::jsonb)) > 18 then
    raise exception 'A color tray can contain at most 18 colors' using errcode = '22023';
  end if;
  if exists (
    select 1
    from jsonb_array_elements_text(coalesce(p_colors, '[]'::jsonb)) as color(value)
    where trim(color.value) !~ '^#[0-9A-Fa-f]{6}$'
  ) then
    raise exception 'Color tray values must be six-digit HEX colors' using errcode = '22023';
  end if;

  delete from public.color_tray_items where user_id = v_user_id;

  with incoming as (
    select upper(trim(color.value)) as hex, min(color.ordinality) as first_position
    from jsonb_array_elements_text(coalesce(p_colors, '[]'::jsonb)) with ordinality as color(value, ordinality)
    group by upper(trim(color.value))
  ), ordered as (
    select hex, row_number() over (order by first_position)::smallint as position
    from incoming
  )
  insert into public.color_tray_items (user_id, hex, position)
  select v_user_id, hex, position from ordered;
end;
$$;

revoke all on function public.sync_color_tray(jsonb) from public, anon;
grant execute on function public.sync_color_tray(jsonb) to authenticated;
