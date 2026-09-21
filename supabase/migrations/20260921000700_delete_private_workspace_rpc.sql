-- Let an authenticated owner remove the private workspace data stored by
-- ColorVerse without requiring a service key in the browser.

create or replace function public.delete_my_private_workspace()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
begin
  v_user_id := (select auth.uid());
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  delete from public.projects where user_id = v_user_id;
  delete from public.templates where user_id = v_user_id;
  delete from public.collections where user_id = v_user_id;
  delete from public.extraction_runs where user_id = v_user_id;
  delete from public.color_tray_items where user_id = v_user_id;
end;
$$;

revoke all on function public.delete_my_private_workspace() from public, anon;
grant execute on function public.delete_my_private_workspace() to authenticated;
