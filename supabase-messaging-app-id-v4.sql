-- Horticulture messaging v4 — sécurité par identifiant de compte applicatif
-- À exécuter APRÈS supabase-messaging-auth-v2.sql et supabase-messaging-groups-v3.sql.
-- Cette version ne dépend plus de l'adresse e-mail du compte pour les autorisations.

create or replace function public.horticulture_auth_app_user_id()
returns text
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select nullif(coalesce(auth.jwt()->>'app_user_id',''), '')
$$;

-- RLS conversations : membre si son user_id applicatif figure dans la conversation.
drop policy if exists horticulture_conversations_select_member on public.horticulture_conversations;
create policy horticulture_conversations_select_member
on public.horticulture_conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.horticulture_conversation_members m
    where m.conversation_id = horticulture_conversations.id
      and m.user_id = public.horticulture_auth_app_user_id()
  )
);

-- RLS membres : accès aux membres des conversations auxquelles le compte appartient.
drop policy if exists horticulture_members_select_member on public.horticulture_conversation_members;
create policy horticulture_members_select_member
on public.horticulture_conversation_members
for select
to authenticated
using (
  exists (
    select 1
    from public.horticulture_conversation_members mine
    where mine.conversation_id = horticulture_conversation_members.conversation_id
      and mine.user_id = public.horticulture_auth_app_user_id()
  )
);

-- RLS messages : lecture et envoi uniquement dans ses conversations.
drop policy if exists horticulture_messages_select_member on public.horticulture_messages;
create policy horticulture_messages_select_member
on public.horticulture_messages
for select
to authenticated
using (
  conversation_id is not null
  and exists (
    select 1
    from public.horticulture_conversation_members m
    where m.conversation_id = horticulture_messages.conversation_id
      and m.user_id = public.horticulture_auth_app_user_id()
  )
);

drop policy if exists horticulture_messages_insert_member on public.horticulture_messages;
create policy horticulture_messages_insert_member
on public.horticulture_messages
for insert
to authenticated
with check (
  conversation_id is not null
  and sender_id = public.horticulture_auth_app_user_id()
  and exists (
    select 1
    from public.horticulture_conversation_members m
    where m.conversation_id = horticulture_messages.conversation_id
      and m.user_id = public.horticulture_auth_app_user_id()
  )
);

-- Conversation directe : sécurité basée sur l'identifiant applicatif signé dans le JWT.
create or replace function public.horticulture_get_or_create_direct(
  p_other_email text,
  p_creator_app_user_id text,
  p_other_app_user_id text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me text := public.horticulture_auth_app_user_id();
  v_id uuid;
  v_email citext := nullif(lower(trim(coalesce(p_other_email,''))), '')::citext;
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if coalesce(p_other_app_user_id,'') = '' then raise exception 'RECIPIENT_REQUIRED'; end if;
  if p_other_app_user_id = v_me then raise exception 'SELF_CONVERSATION_NOT_ALLOWED'; end if;

  select c.id into v_id
  from public.horticulture_conversations c
  where c.kind='direct'
    and exists (select 1 from public.horticulture_conversation_members a where a.conversation_id=c.id and a.user_id=v_me)
    and exists (select 1 from public.horticulture_conversation_members b where b.conversation_id=c.id and b.user_id=p_other_app_user_id)
    and (select count(*) from public.horticulture_conversation_members x where x.conversation_id=c.id)=2
  order by c.created_at asc
  limit 1;

  if v_id is not null then return v_id; end if;

  insert into public.horticulture_conversations(kind,title,created_by,creator_email)
  values('direct',null,v_me,public.horticulture_auth_email())
  returning id into v_id;

  insert into public.horticulture_conversation_members(conversation_id,user_id,user_email,member_role)
  values
    (v_id,v_me,public.horticulture_auth_email(),'member'),
    (v_id,p_other_app_user_id,v_email,'member');

  return v_id;
end
$$;

revoke all on function public.horticulture_get_or_create_direct(text,text,text) from public, anon;
grant execute on function public.horticulture_get_or_create_direct(text,text,text) to authenticated;

create or replace function public.horticulture_mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_me text := public.horticulture_auth_app_user_id();
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (
    select 1 from public.horticulture_conversation_members m
    where m.conversation_id=p_conversation_id and m.user_id=v_me
  ) then raise exception 'FORBIDDEN'; end if;

  update public.horticulture_messages
  set delivered_at=coalesce(delivered_at,now()), read_at=coalesce(read_at,now())
  where conversation_id=p_conversation_id
    and sender_id<>v_me
    and read_at is null;

  update public.horticulture_conversation_members
  set last_read_at=now()
  where conversation_id=p_conversation_id and user_id=v_me;
end
$$;

revoke all on function public.horticulture_mark_conversation_read(uuid) from public, anon;
grant execute on function public.horticulture_mark_conversation_read(uuid) to authenticated;

-- Groupes : même logique, sans dépendre des e-mails.
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
  v_me text := public.horticulture_auth_app_user_id();
  v_id uuid;
  v_item jsonb;
  v_user_id text;
  v_email citext;
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(trim(coalesce(p_title,'')))<2 then raise exception 'GROUP_TITLE_REQUIRED'; end if;

  insert into public.horticulture_conversations(kind,title,created_by,creator_email)
  values('group',trim(p_title),v_me,public.horticulture_auth_email()) returning id into v_id;

  insert into public.horticulture_conversation_members(conversation_id,user_id,user_email,member_role)
  values(v_id,v_me,public.horticulture_auth_email(),'admin');

  if jsonb_typeof(coalesce(p_members,'[]'::jsonb))='array' then
    for v_item in select * from jsonb_array_elements(coalesce(p_members,'[]'::jsonb)) loop
      v_user_id := coalesce(v_item->>'user_id','');
      v_email := nullif(lower(trim(coalesce(v_item->>'email',''))),'')::citext;
      if v_user_id<>'' and v_user_id<>v_me then
        insert into public.horticulture_conversation_members(conversation_id,user_id,user_email,member_role)
        values(v_id,v_user_id,v_email,'member')
        on conflict (conversation_id,user_id) do update set user_email=excluded.user_email;
      end if;
    end loop;
  end if;

  if (select count(*) from public.horticulture_conversation_members where conversation_id=v_id)<2 then
    raise exception 'GROUP_NEEDS_ANOTHER_MEMBER';
  end if;
  return v_id;
end
$$;

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
  v_me text := public.horticulture_auth_app_user_id();
  v_email citext := nullif(lower(trim(coalesce(p_email,''))),'')::citext;
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (
    select 1 from public.horticulture_conversation_members m
    join public.horticulture_conversations c on c.id=m.conversation_id
    where m.conversation_id=p_conversation_id and m.user_id=v_me and m.member_role='admin' and c.kind='group'
  ) then raise exception 'GROUP_ADMIN_REQUIRED'; end if;
  if coalesce(p_app_user_id,'')='' then raise exception 'USER_REQUIRED'; end if;
  insert into public.horticulture_conversation_members(conversation_id,user_id,user_email,member_role)
  values(p_conversation_id,p_app_user_id,v_email,'member')
  on conflict (conversation_id,user_id) do update set user_email=excluded.user_email;
end
$$;

create or replace function public.horticulture_remove_group_member(
  p_conversation_id uuid,
  p_app_user_id text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_me text := public.horticulture_auth_app_user_id();
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if not exists (
    select 1 from public.horticulture_conversation_members m
    join public.horticulture_conversations c on c.id=m.conversation_id
    where m.conversation_id=p_conversation_id and m.user_id=v_me and m.member_role='admin' and c.kind='group'
  ) then raise exception 'GROUP_ADMIN_REQUIRED'; end if;
  delete from public.horticulture_conversation_members
  where conversation_id=p_conversation_id and user_id=coalesce(p_app_user_id,'') and member_role<>'admin';
end
$$;

create or replace function public.horticulture_rename_group(
  p_conversation_id uuid,
  p_title text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_me text := public.horticulture_auth_app_user_id();
begin
  if auth.uid() is null or v_me is null then raise exception 'AUTH_REQUIRED'; end if;
  if length(trim(coalesce(p_title,'')))<2 then raise exception 'GROUP_TITLE_REQUIRED'; end if;
  if not exists (
    select 1 from public.horticulture_conversation_members m
    join public.horticulture_conversations c on c.id=m.conversation_id
    where m.conversation_id=p_conversation_id and m.user_id=v_me and m.member_role='admin' and c.kind='group'
  ) then raise exception 'GROUP_ADMIN_REQUIRED'; end if;
  update public.horticulture_conversations set title=trim(p_title)
  where id=p_conversation_id and kind='group';
end
$$;

revoke all on function public.horticulture_create_group(text,text,jsonb) from public, anon;
revoke all on function public.horticulture_add_group_member(uuid,text,text) from public, anon;
revoke all on function public.horticulture_remove_group_member(uuid,text) from public, anon;
revoke all on function public.horticulture_rename_group(uuid,text) from public, anon;
grant execute on function public.horticulture_create_group(text,text,jsonb) to authenticated;
grant execute on function public.horticulture_add_group_member(uuid,text,text) to authenticated;
grant execute on function public.horticulture_remove_group_member(uuid,text) to authenticated;
grant execute on function public.horticulture_rename_group(uuid,text) to authenticated;
