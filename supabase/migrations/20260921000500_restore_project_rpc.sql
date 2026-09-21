-- Archived projects remain recoverable by their owner.
create or replace function public.restore_project(p_project_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  update public.projects
  set status = 'active'
  where id = p_project_id and user_id = (select auth.uid()) and status = 'archived';
  if not found then
    raise exception 'Archived project not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.restore_project(uuid) from public, anon;
grant execute on function public.restore_project(uuid) to authenticated;
