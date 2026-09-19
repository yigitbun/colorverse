-- Atomic project/version save used by the static Studio client.
-- SECURITY INVOKER keeps grants and RLS as the source of authorization.

create or replace function public.save_project_snapshot(
  p_project_id uuid,
  p_name text,
  p_context_type text,
  p_source_palette_id text,
  p_colors jsonb,
  p_roles jsonb,
  p_editor_state jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_project_id uuid;
  v_next_version integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_name is null or character_length(trim(p_name)) not between 1 and 120 then
    raise exception 'Project name must be between 1 and 120 characters' using errcode = '22023';
  end if;
  if jsonb_typeof(p_colors) <> 'array' or jsonb_array_length(p_colors) <> 5 then
    raise exception 'A project snapshot requires exactly five colors' using errcode = '22023';
  end if;

  if p_project_id is null then
    insert into public.projects (user_id, name, context_type, source_palette_id)
    values ((select auth.uid()), trim(p_name), p_context_type, p_source_palette_id)
    returning id into v_project_id;
  else
    update public.projects
    set name = trim(p_name), context_type = p_context_type, source_palette_id = p_source_palette_id
    where id = p_project_id and user_id = (select auth.uid())
    returning id into v_project_id;

    if v_project_id is null then
      raise exception 'Project not found' using errcode = 'P0002';
    end if;
  end if;

  -- The project row is locked by the insert/update above, so version numbers
  -- remain sequential even if the same user saves twice in quick succession.
  select coalesce(max(version_number), 0) + 1
  into v_next_version
  from public.project_versions
  where project_id = v_project_id;

  insert into public.project_versions (
    project_id,
    version_number,
    name,
    variant_key,
    colors,
    roles,
    editor_state
  ) values (
    v_project_id,
    v_next_version,
    case when v_next_version = 1 then 'Baseline' else 'Version ' || v_next_version end,
    case when v_next_version = 1 then 'baseline' else 'checkpoint' end,
    p_colors,
    coalesce(p_roles, '{}'::jsonb),
    coalesce(p_editor_state, '{}'::jsonb)
  );

  return v_project_id;
end;
$$;

revoke all on function public.save_project_snapshot(uuid, text, text, text, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_project_snapshot(uuid, text, text, text, jsonb, jsonb, jsonb) to authenticated;
