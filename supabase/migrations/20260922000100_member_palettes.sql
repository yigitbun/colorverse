-- Personal palettes are not constrained by Studio's five preview roles.
-- Existing five-color records and RPC callers remain compatible.
begin;
alter table public.saved_palette_items
  drop constraint saved_palette_items_colors_check;
alter table public.saved_palette_items
  add constraint saved_palette_items_colors_check check (
    jsonb_typeof(colors) = 'array' and jsonb_array_length(colors) between 2 and 24
  );

create or replace function public.save_member_palette(
  p_item_id uuid,
  p_collection_name text,
  p_name text,
  p_colors jsonb,
  p_reference_key text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_collection_id uuid;
  v_item_id uuid;
  v_palette_id text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_collection_name is null or character_length(trim(p_collection_name)) not between 1 and 100 then
    raise exception 'Collection name must be between 1 and 100 characters' using errcode = '22023';
  end if;
  if p_name is null or character_length(trim(p_name)) not between 1 and 120 then
    raise exception 'Palette name must be between 1 and 120 characters' using errcode = '22023';
  end if;
  -- Separate checks keep malformed JSON from reaching array operations.
  if p_colors is null or jsonb_typeof(p_colors) <> 'array' then
    raise exception 'Colors must be an array' using errcode = '22023';
  end if;
  if jsonb_array_length(p_colors) not between 2 and 24 then
    raise exception 'Use between 2 and 24 colors' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_colors) as color(value)
    where jsonb_typeof(color.value) <> 'string'
       or (color.value #>> '{}') !~ '^#[0-9A-Fa-f]{6}$'
  ) then
    raise exception 'Colors must be six-digit HEX strings' using errcode = '22023';
  end if;
  if p_reference_key is not null then
    select id into v_palette_id from public.palettes
    where id = p_reference_key and is_published = true;
    if v_palette_id is null and p_reference_key <> 'drift-field-01' then
      raise exception 'Reference not found' using errcode = 'P0002';
    end if;
  end if;
  -- Check ownership before creating/moving collections; never accept owner IDs.
  if p_item_id is not null then
    select item.id into v_item_id
    from public.saved_palette_items item
    join public.collections collection on collection.id = item.collection_id
    where item.id = p_item_id and collection.user_id = v_user_id
    for update of item;
    if v_item_id is null then
      raise exception 'Saved palette not found' using errcode = 'P0002';
    end if;
  end if;
  insert into public.collections (user_id, name)
  values (v_user_id, trim(p_collection_name))
  on conflict (user_id, name) do update set updated_at = now()
  returning id into v_collection_id;

  if p_item_id is null then
    insert into public.saved_palette_items (collection_id, palette_id, name, colors, source, source_metadata)
    values (v_collection_id, v_palette_id, trim(p_name), p_colors,
      case when p_reference_key is null then 'manual' else 'curated' end,
      jsonb_build_object('saved_via', 'account', 'reference_key', p_reference_key))
    returning id into v_item_id;
  else
    update public.saved_palette_items set
      collection_id = v_collection_id, palette_id = v_palette_id, name = trim(p_name), colors = p_colors,
      source_metadata = source_metadata || jsonb_build_object('reference_key', p_reference_key)
    where id = v_item_id;
  end if;
  return v_item_id;
end;
$$;

revoke all on function public.save_member_palette(uuid, text, text, jsonb, text) from public, anon;
grant execute on function public.save_member_palette(uuid, text, text, jsonb, text) to authenticated;
-- Keep direct browser writes closed. Existing owner-only RLS protects reads.
revoke insert, update, delete on public.saved_palette_items, public.collections from anon, authenticated;
commit;
