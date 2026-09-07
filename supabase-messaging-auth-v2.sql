-- Horticulture messaging v2 — authenticated private conversations
-- Run this AFTER supabase-messaging-schema.sql in the Supabase SQL Editor.

create extension if not exists citext;

alter table public.horticulture_conversations
  add column if not exists creator_email citext;

alter table public.horticulture_conversation_members
  add column if not exists user_email citext;

alter table public.horticulture_messages
  add column if not exists conversation_id uuid references public.horticulture_conversations(id) on delete cascade,
  add column if not exists sender_email citext,
  add column if not exists kind text not null default 'text',
  add column if not exists media_url text,
  add column if not exists media_name text,
  add column if not exists media_type text,
  add column if not exists media_size bigint;

-- recipient_id is kept for compatibility with the current UI, but groups do not have one recipient.
alter table public.horticulture_messages alter column recipient_id drop not null;

create index if not exists horticulture_members_email_conv
  on public.horticulture_conversation_members(lower(user_email::text), conversation_id);
create index if not exists horticulture_messages_conv_time
  on public.horticulture_messages(conversation_id, created_at desc);
create index if not exists horticulture_messages_sender_email
  on public.horticulture_messages(lower(sender_email::text), created_at desc);

-- No anonymous access to private messaging data.
revoke all on public.horticulture_messages from anon;
revoke all on public.horticulture_conversations from anon;
revoke all on public.horticulture_conversation_members from anon;

grant select, insert on public.horticulture_messages to authenticated;
grant select on public.horticulture_conversations to authenticated;
grant select on public.horticulture_conversation_members to authenticated;

-- Helper: verified email carried by the Supabase Auth JWT.
create or replace function public.horticulture_auth_email()
returns citext
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select nullif(lower(coalesce(auth.jwt()->>'email','')), '')::citext
$$;

-- RLS: a user can see only conversations where their verified e-mail is a member.
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
      and lower(m.user_email::text) = lower(public.horticulture_auth_email()::text)
  )
);

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
      and lower(mine.user_email::text) = lower(public.horticulture_auth_email()::text)
  )
);

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
      and lower(m.user_email::text) = lower(public.horticulture_auth_email()::text)
  )
);

drop policy if exists horticulture_messages_insert_member on public.horticulture_messages;
create policy horticulture_messages_insert_member
on public.horticulture_messages
for insert
to authenticated
with check (
  conversation_id is not null
  and lower(sender_email::text) = lower(public.horticulture_auth_email()::text)
  and exists (
    select 1
    from public.horticulture_conversation_members m
    where m.conversation_id = horticulture_messages.conversation_id
      and lower(m.user_email::text) = lower(public.horticulture_auth_email()::text)
  )
);

-- Creates or returns ONE direct conversation between the signed-in user and another e-mail.
-- Membership security is based on verified Supabase Auth e-mail, not on client-supplied user ids.
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
  v_me citext := public.horticulture_auth_email();
  v_other citext := nullif(lower(trim(coalesce(p_other_email,''))), '')::citext;
  v_id uuid;
begin
  if auth.uid() is null or v_me is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if v_other is null then
    raise exception 'RECIPIENT_EMAIL_REQUIRED';
  end if;
  if lower(v_other::text) = lower(v_me::text) then
    raise exception 'SELF_CONVERSATION_NOT_ALLOWED';
  end if;

  select c.id into v_id
  from public.horticulture_conversations c
  where c.kind = 'direct'
    and exists (
      select 1 from public.horticulture_conversation_members a
      where a.conversation_id=c.id and lower(a.user_email::text)=lower(v_me::text)
    )
    and exists (
      select 1 from public.horticulture_conversation_members b
      where b.conversation_id=c.id and lower(b.user_email::text)=lower(v_other::text)
    )
    and (select count(*) from public.horticulture_conversation_members x where x.conversation_id=c.id)=2
  order by c.created_at asc
  limit 1;

  if v_id is not null then return v_id; end if;

  insert into public.horticulture_conversations(kind,title,created_by,creator_email)
  values('direct',null,coalesce(p_creator_app_user_id,''),v_me)
  returning id into v_id;

  insert into public.horticulture_conversation_members(conversation_id,user_id,user_email)
  values
    (v_id,coalesce(p_creator_app_user_id,''),v_me),
    (v_id,coalesce(p_other_app_user_id,''),v_other);

  return v_id;
end
$$;

revoke all on function public.horticulture_get_or_create_direct(text,text,text) from public, anon;
grant execute on function public.horticulture_get_or_create_direct(text,text,text) to authenticated;

-- Marks messages received/read only for a conversation the signed-in user belongs to.
create or replace function public.horticulture_mark_conversation_read(p_conversation_id uuid)
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
    where m.conversation_id=p_conversation_id
      and lower(m.user_email::text)=lower(v_me::text)
  ) then raise exception 'FORBIDDEN'; end if;

  update public.horticulture_messages
  set delivered_at=coalesce(delivered_at,now()), read_at=coalesce(read_at,now())
  where conversation_id=p_conversation_id
    and lower(coalesce(sender_email::text,'')) <> lower(v_me::text)
    and read_at is null;

  update public.horticulture_conversation_members
  set last_read_at=now()
  where conversation_id=p_conversation_id
    and lower(user_email::text)=lower(v_me::text);
end
$$;

revoke all on function public.horticulture_mark_conversation_read(uuid) from public, anon;
grant execute on function public.horticulture_mark_conversation_read(uuid) to authenticated;

-- Keep the message table in the Realtime publication.
do $$ begin
  alter publication supabase_realtime add table public.horticulture_messages;
exception when duplicate_object then null;
end $$;
