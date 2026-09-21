-- Validated template saves for the private Studio workspace.
-- Templates are reusable starting points, not public community posts.

create or replace function public.save_template_snapshot(
  p_template_id uuid,
  p_name text,
  p_context_type text,
  p_source_project_id uuid,
  p_colors jsonb,
  p_roles jsonb,
  p_defaults jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_template_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_name is null or character_length(trim(p_name)) not between 1 and 120 then
    raise exception 'Template name must be between 1 and 120 characters' using errcode = '22023';
  end if;
  if p_context_type is null or p_context_type not in ('custom', 'website', 'slides', 'social', 'shop', 'brand', 'roomkit', 'editorial') then
    raise exception 'Unsupported template context' using errcode = '22023';
  end if;
  if jsonb_typeof(p_colors) <> 'array' or jsonb_array_length(p_colors) <> 5 then
    raise exception 'A template requires exactly five colors' using errcode = '22023';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(p_colors) as color(value)
    where color.value !~ '^#[0-9A-Fa-f]{6}$'
  ) then
    raise exception 'Template colors must use six-digit HEX values' using errcode = '22023';
  end if;
  if p_roles is not null and (jsonb_typeof(p_roles) <> 'object' or octet_length(p_roles::text) > 4096) then
    raise exception 'Invalid template roles' using errcode = '22023';
  end if;
  if p_defaults is not null and (jsonb_typeof(p_defaults) <> 'object' or octet_length(p_defaults::text) > 16384) then
    raise exception 'Invalid template defaults' using errcode = '22023';
  end if;
  if p_source_project_id is not null and not exists (
    select 1 from public.projects
    where projects.id = p_source_project_id
      and projects.user_id = (select auth.uid())
  ) then
    raise exception 'Source project not found' using errcode = 'P0002';
  end if;

  if p_template_id is null then
    insert into public.templates (
      user_id, name, context_type, source_project_id, colors, roles, defaults
    ) values (
      (select auth.uid()), trim(p_name), p_context_type, p_source_project_id,
      p_colors, coalesce(p_roles, '{}'::jsonb), coalesce(p_defaults, '{}'::jsonb)
    ) returning id into v_template_id;
  else
    update public.templates
    set name = trim(p_name),
        context_type = p_context_type,
        source_project_id = p_source_project_id,
        colors = p_colors,
        roles = coalesce(p_roles, '{}'::jsonb),
        defaults = coalesce(p_defaults, '{}'::jsonb)
    where id = p_template_id and user_id = (select auth.uid())
    returning id into v_template_id;

    if v_template_id is null then
      raise exception 'Template not found' using errcode = 'P0002';
    end if;
  end if;

  return v_template_id;
end;
$$;

revoke insert, update, delete on table public.templates from authenticated;
grant select on table public.templates to authenticated;
revoke all on function public.save_template_snapshot(uuid, text, text, uuid, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_template_snapshot(uuid, text, text, uuid, jsonb, jsonb, jsonb) to authenticated;
