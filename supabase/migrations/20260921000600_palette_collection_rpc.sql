-- Private palette shelves for signed-in Studio users.
-- A saved item contains only the five HEX values and provenance metadata;
-- source images and user-authored project text never enter this path.

create or replace function public.save_palette_to_collection(
  p_collection_name text,
  p_name text,
  p_palette_id text,
  p_colors jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_collection_id uuid;
  v_item_id uuid;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_collection_name is null or character_length(trim(p_collection_name)) not between 1 and 100 then
    raise exception 'Collection name must be between 1 and 100 characters' using errcode = '22023';
  end if;
  if p_name is not null and character_length(trim(p_name)) > 120 then
    raise exception 'Palette name is too long' using errcode = '22023';
  end if;
  if jsonb_typeof(p_colors) <> 'array' or jsonb_array_length(p_colors) <> 5 then
    raise exception 'A saved palette requires exactly five colors' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_colors) as color(value)
    where color.value !~ '^#[0-9A-Fa-f]{6}$'
  ) then
    raise exception 'Palette colors must use six-digit HEX values' using errcode = '22023';
  end if;
  if p_palette_id is not null and not exists (
    select 1 from public.palettes
    where id = p_palette_id and is_published = true
  ) then
    raise exception 'Source palette not found' using errcode = 'P0002';
  end if;

  insert into public.collections (user_id, name)
  values (v_user_id, trim(p_collection_name))
  on conflict (user_id, name) do update set updated_at = now()
  returning id into v_collection_id;

  insert into public.saved_palette_items (
    collection_id, palette_id, name, colors, source, source_metadata
  ) values (
    v_collection_id, p_palette_id, nullif(trim(coalesce(p_name, '')), ''),
    p_colors, case when p_palette_id is null then 'manual' else 'curated' end,
    jsonb_build_object('saved_via', 'studio')
  ) returning id into v_item_id;

  return v_item_id;
end;
$$;

create or replace function public.delete_saved_palette_item(p_item_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  delete from public.saved_palette_items item
  using public.collections collection
  where item.id = p_item_id
    and item.collection_id = collection.id
    and collection.user_id = (select auth.uid());
  if not found then
    raise exception 'Saved palette not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke insert, update, delete on table public.collections, public.saved_palette_items from authenticated;
grant select on table public.collections, public.saved_palette_items to authenticated;
revoke all on function public.save_palette_to_collection(text, text, text, jsonb) from public, anon;
grant execute on function public.save_palette_to_collection(text, text, text, jsonb) to authenticated;
revoke all on function public.delete_saved_palette_item(uuid) from public, anon;
grant execute on function public.delete_saved_palette_item(uuid) to authenticated;
