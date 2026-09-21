-- Template lifecycle mutations stay behind owner-checked RPCs.
create or replace function public.rename_template(p_template_id uuid, p_name text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if p_name is null or character_length(trim(p_name)) not between 1 and 120 then
    raise exception 'Template name must be between 1 and 120 characters' using errcode = '22023';
  end if;
  update public.templates
  set name = trim(p_name)
  where id = p_template_id and user_id = (select auth.uid());
  if not found then
    raise exception 'Template not found' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.delete_template(p_template_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  delete from public.templates
  where id = p_template_id and user_id = (select auth.uid());
  if not found then
    raise exception 'Template not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.rename_template(uuid, text) from public, anon;
grant execute on function public.rename_template(uuid, text) to authenticated;
revoke all on function public.delete_template(uuid) from public, anon;
grant execute on function public.delete_template(uuid) to authenticated;
