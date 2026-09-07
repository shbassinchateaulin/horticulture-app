-- Horticulture realtime messaging v1
-- Run once in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.horticulture_messages (
  id uuid primary key default gen_random_uuid(),
  client_id text not null unique,
  sender_id text not null,
  recipient_id text not null,
  body text not null check (char_length(body) between 1 and 10000),
  created_at timestamptz not null default now(),
  delivered_at timestamptz,
  read_at timestamptz
);
create index if not exists horticulture_messages_pair_time on public.horticulture_messages(sender_id,recipient_id,created_at desc);
create index if not exists horticulture_messages_recipient_time on public.horticulture_messages(recipient_id,created_at desc);

alter table public.horticulture_messages enable row level security;
revoke all on public.horticulture_messages from anon, authenticated;
-- IMPORTANT: the current app has its own login system, not Supabase Auth.
-- Direct Data API access stays closed until authenticated JWT/RLS is wired.

-- Realtime publication: server-side inserts/updates can be streamed once clients are authenticated.
do $$ begin
  alter publication supabase_realtime add table public.horticulture_messages;
exception when duplicate_object then null;
end $$;

-- Future group-ready schema.
create table if not exists public.horticulture_conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'direct' check (kind in ('direct','group')),
  title text,
  created_by text not null,
  created_at timestamptz not null default now()
);
create table if not exists public.horticulture_conversation_members (
  conversation_id uuid not null references public.horticulture_conversations(id) on delete cascade,
  user_id text not null,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key(conversation_id,user_id)
);
alter table public.horticulture_conversations enable row level security;
alter table public.horticulture_conversation_members enable row level security;
revoke all on public.horticulture_conversations from anon, authenticated;
revoke all on public.horticulture_conversation_members from anon, authenticated;
