-- Project-level A/B prototype saves. Prototype 1 is the immutable baseline;
-- Prototype 2 is an independent alternative that keeps a parent reference.

create or replace function public.save_project_prototype(
  p_project_id uuid,
  p_variant_key text,
  p_project_name text,
  p_version_name text,
  p_context_type text,
  p_source_palette_id text,
  p_colors jsonb,
  p_roles jsonb,
  p_editor_state jsonb,
  p_parent_version_id uuid,
  p_lock boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_project_id uuid;
  v_parent_version_id uuid;
  v_version_id uuid;
  v_version_number integer;
  v_locked boolean := coalesce(p_lock, false);
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_variant_key is null or p_variant_key not in ('baseline', 'alternative') then
    raise exception 'Prototype must be baseline or alternative' using errcode = '22023';
  end if;
  if p_variant_key = 'alternative' and v_locked then
    raise exception 'Only Prototype 1 can be locked' using errcode = '22023';
  end if;
  if p_project_name is null or character_length(trim(p_project_name)) not between 1 and 120 then
    raise exception 'Project name must be between 1 and 120 characters' using errcode = '22023';
  end if;
  if p_version_name is null or character_length(trim(p_version_name)) not between 1 and 80 then
    raise exception 'Prototype name must be between 1 and 80 characters' using errcode = '22023';
  end if;
  if p_context_type is null or p_context_type not in ('custom', 'website', 'slides', 'social', 'shop', 'brand', 'roomkit', 'editorial') then
    raise exception 'Unsupported project context' using errcode = '22023';
  end if;
  if jsonb_typeof(p_colors) <> 'array' or jsonb_array_length(p_colors) <> 5 then
    raise exception 'A prototype requires exactly five colors' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_colors) as color(value)
    where color.value !~ '^#[0-9A-Fa-f]{6}$'
  ) then
    raise exception 'Prototype colors must use six-digit HEX values' using errcode = '22023';
  end if;
  if p_roles is not null and (jsonb_typeof(p_roles) <> 'object' or octet_length(p_roles::text) > 4096) then
    raise exception 'Invalid prototype roles' using errcode = '22023';
  end if;
  if p_editor_state is not null and (jsonb_typeof(p_editor_state) <> 'object' or octet_length(p_editor_state::text) > 16384) then
    raise exception 'Invalid prototype editor state' using errcode = '22023';
  end if;
  if p_source_palette_id is not null and not exists (
    select 1 from public.palettes where id = p_source_palette_id and is_published = true
  ) then
    raise exception 'Source palette not found' using errcode = 'P0002';
  end if;

  if p_project_id is null then
    if p_variant_key <> 'baseline' then
      raise exception 'Prototype 1 must be saved before Prototype 2' using errcode = 'P0001';
    end if;
    insert into public.projects (user_id, name, context_type, source_palette_id)
    values (v_user_id, trim(p_project_name), p_context_type, p_source_palette_id)
    returning id into v_project_id;
  else
    update public.projects
    set name = trim(p_project_name), context_type = p_context_type, source_palette_id = p_source_palette_id
    where id = p_project_id and user_id = v_user_id and status = 'active'
    returning id into v_project_id;
    if v_project_id is null then
      raise exception 'Active project not found' using errcode = 'P0002';
    end if;
  end if;

  if p_variant_key = 'baseline' and exists (
    select 1 from public.project_versions
    where project_id = v_project_id and variant_key = 'baseline' and is_locked = true
  ) then
    raise exception 'Prototype 1 is locked' using errcode = '55000';
  end if;

  if p_variant_key = 'alternative' then
    if p_parent_version_id is null then
      select id into v_parent_version_id
      from public.project_versions
      where project_id = v_project_id and variant_key = 'baseline'
      order by version_number desc limit 1;
    end if;
    if v_parent_version_id is null or not exists (
      select 1 from public.project_versions
      where id = v_parent_version_id and project_id = v_project_id and variant_key = 'baseline'
    ) then
      raise exception 'Prototype 1 baseline not found' using errcode = 'P0002';
    end if;
  end if;

  select coalesce(max(version_number), 0) + 1 into v_version_number
  from public.project_versions where project_id = v_project_id;

  insert into public.project_versions (
    project_id, parent_version_id, version_number, name, variant_key,
    is_locked, colors, roles, editor_state
  ) values (
    v_project_id, case when p_variant_key = 'alternative' then v_parent_version_id else null end,
    v_version_number, trim(p_version_name), p_variant_key, v_locked,
    p_colors, coalesce(p_roles, '{}'::jsonb), coalesce(p_editor_state, '{}'::jsonb)
  ) returning id into v_version_id;

  return jsonb_build_object(
    'project_id', v_project_id,
    'version_id', v_version_id,
    'version_number', v_version_number,
    'variant_key', p_variant_key,
    'is_locked', v_locked
  );
end;
$$;

revoke all on function public.save_project_prototype(uuid, text, text, text, text, text, jsonb, jsonb, jsonb, uuid, boolean) from public, anon;
grant execute on function public.save_project_prototype(uuid, text, text, text, text, text, jsonb, jsonb, jsonb, uuid, boolean) to authenticated;
