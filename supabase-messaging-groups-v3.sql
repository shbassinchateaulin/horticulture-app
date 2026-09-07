-- Horticulture messaging v3 — groupes façon messagerie moderne
-- À exécuter APRÈS supabase-messaging-auth-v2.sql.

alter table public.horticulture_conversation_members
  add column if not exists member_role text not null default 'member'
  check (member_role in ('member','admin'));

create index if not exists horticulture_members_conv_role
  on public.horticulture_conversation_members(conversation_id, member_role);

-- Crée un groupe. p_members = [{"email":"...","user_id":"..."}, ...]
create or replace function public.horticulture_create_group(
  p_title text,
  p_creator_app_user_id text,
  p_members jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me citext := public.horticulture_auth_email();
  v_id uuid;
  v_item jsonb;
  v_email citext;
  v_user_id text;
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(trim(coalesce(p_title,''))) < 2 then raise exception 'GROUP_TITLE_REQUIRED'; end if;

  insert into public.horticulture_conversations(kind,title,created_by,creator_email)
  values('group',trim(p_title),coalesce(p_creator_app_user_id,''),v_me)
  returning id into v_id;

  insert into public.horticulture_conversation_members(conversation_id,user_id,user_email,member_role)
  values(v_id,coalesce(p_creator_app_user_id,''),v_me,'admin');

  if jsonb_typeof(coalesce(p_members,'[]'::jsonb))='array' then
    for v_item in select * from jsonb_array_elements(coalesce(p_members,'[]'::jsonb)) loop
      v_email := nullif(lower(trim(coalesce(v_item->>'email',''))),'')::citext;
      v_user_id := coalesce(v_item->>'user_id','');
      if v_email is not null and lower(v_email::text) <> lower(v_me::text) then
        insert into public.horticulture_conversation_members(conversation_id,user_id,user_email,member_role)
        values(v_id,v_user_id,v_email,'member')
        on conflict (conversation_id,user_id) do nothing;
      end if;
    end loop;
  end if;

  if (select count(*) from public.horticulture_conversation_members where conversation_id=v_id) < 2 then
    raise exception 'GROUP_NEEDS_ANOTHER_MEMBER';
  end if;
  return v_id;
end
$$;

revoke all on function public.horticulture_create_group(text,text,jsonb) from public, anon;
grant execute on function public.horticulture_create_group(text,text,jsonb) to authenticated;

create or replace function public.horticulture_add_group_member(
  p_conversation_id uuid,
  p_email text,
  p_app_user_id text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me citext := public.horticulture_auth_email();
  v_email citext := nullif(lower(trim(coalesce(p_email,''))),'')::citext;
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (
    select 1 from public.horticulture_conversation_members m
    join public.horticulture_conversations c on c.id=m.conversation_id
    where m.conversation_id=p_conversation_id
      and lower(m.user_email::text)=lower(v_me::text)
      and m.member_role='admin' and c.kind='group'
  ) then raise exception 'GROUP_ADMIN_REQUIRED'; end if;
  if v_email is null then raise exception 'EMAIL_REQUIRED'; end if;

  insert into public.horticulture_conversation_members(conversation_id,user_id,user_email,member_role)
  values(p_conversation_id,coalesce(p_app_user_id,''),v_email,'member')
  on conflict (conversation_id,user_id) do update set user_email=excluded.user_email;
end
$$;

revoke all on function public.horticulture_add_group_member(uuid,text,text) from public, anon;
grant execute on function public.horticulture_add_group_member(uuid,text,text) to authenticated;

create or replace function public.horticulture_remove_group_member(
  p_conversation_id uuid,
  p_app_user_id text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me citext := public.horticulture_auth_email();
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (
    select 1 from public.horticulture_conversation_members m
    join public.horticulture_conversations c on c.id=m.conversation_id
    where m.conversation_id=p_conversation_id
      and lower(m.user_email::text)=lower(v_me::text)
      and m.member_role='admin' and c.kind='group'
  ) then raise exception 'GROUP_ADMIN_REQUIRED'; end if;
  delete from public.horticulture_conversation_members
   where conversation_id=p_conversation_id and user_id=coalesce(p_app_user_id,'') and member_role<>'admin';
end
$$;

revoke all on function public.horticulture_remove_group_member(uuid,text) from public, anon;
grant execute on function public.horticulture_remove_group_member(uuid,text) to authenticated;

create or replace function public.horticulture_rename_group(
  p_conversation_id uuid,
  p_title text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me citext := public.horticulture_auth_email();
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(trim(coalesce(p_title,''))) < 2 then raise exception 'GROUP_TITLE_REQUIRED'; end if;
  if not exists (
    select 1 from public.horticulture_conversation_members m
    join public.horticulture_conversations c on c.id=m.conversation_id
    where m.conversation_id=p_conversation_id
      and lower(m.user_email::text)=lower(v_me::text)
      and m.member_role='admin' and c.kind='group'
  ) then raise exception 'GROUP_ADMIN_REQUIRED'; end if;
  update public.horticulture_conversations set title=trim(p_title) where id=p_conversation_id and kind='group';
end
$$;

revoke all on function public.horticulture_rename_group(uuid,text) from public, anon;
grant execute on function public.horticulture_rename_group(uuid,text) to authenticated;
