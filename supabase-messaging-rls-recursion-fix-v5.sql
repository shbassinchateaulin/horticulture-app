-- Horticulture messaging v5 — correction récursion RLS
-- À exécuter APRÈS v4.
-- Corrige: infinite recursion detected in policy for relation horticulture_conversation_members

-- IMPORTANT : les helpers SECURITY DEFINER lisent la table des membres en contournant
-- les policies de la requête appelante. Les policies n'interrogent donc plus directement
-- horticulture_conversation_members depuis une policy de cette même table.

create or replace function public.horticulture_is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.horticulture_conversation_members m
    where m.conversation_id = p_conversation_id
      and m.user_id = public.horticulture_auth_app_user_id()
  )
$$;

create or replace function public.horticulture_is_group_admin(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.horticulture_conversation_members m
    join public.horticulture_conversations c on c.id = m.conversation_id
    where m.conversation_id = p_conversation_id
      and m.user_id = public.horticulture_auth_app_user_id()
      and m.member_role = 'admin'
      and c.kind = 'group'
  )
$$;

revoke all on function public.horticulture_is_conversation_member(uuid) from public, anon;
grant execute on function public.horticulture_is_conversation_member(uuid) to authenticated;
revoke all on function public.horticulture_is_group_admin(uuid) from public, anon;
grant execute on function public.horticulture_is_group_admin(uuid) to authenticated;

-- Conversations
DROP POLICY IF EXISTS horticulture_conversations_select_member ON public.horticulture_conversations;
CREATE POLICY horticulture_conversations_select_member
ON public.horticulture_conversations
FOR SELECT TO authenticated
USING (public.horticulture_is_conversation_member(id));

-- Membres : surtout ne pas faire de sous-requête directe sur cette même table ici.
DROP POLICY IF EXISTS horticulture_members_select_member ON public.horticulture_conversation_members;
CREATE POLICY horticulture_members_select_member
ON public.horticulture_conversation_members
FOR SELECT TO authenticated
USING (public.horticulture_is_conversation_member(conversation_id));

-- Messages
DROP POLICY IF EXISTS horticulture_messages_select_member ON public.horticulture_messages;
CREATE POLICY horticulture_messages_select_member
ON public.horticulture_messages
FOR SELECT TO authenticated
USING (
  conversation_id IS NOT NULL
  AND public.horticulture_is_conversation_member(conversation_id)
);

DROP POLICY IF EXISTS horticulture_messages_insert_member ON public.horticulture_messages;
CREATE POLICY horticulture_messages_insert_member
ON public.horticulture_messages
FOR INSERT TO authenticated
WITH CHECK (
  conversation_id IS NOT NULL
  AND sender_id = public.horticulture_auth_app_user_id()
  AND public.horticulture_is_conversation_member(conversation_id)
);

-- Si d'anciennes policies des versions précédentes existent encore, on supprime celles
-- qui pouvaient réintroduire la récursion avant de recréer les policies canoniques ci-dessus.
DROP POLICY IF EXISTS "Members can view conversation members" ON public.horticulture_conversation_members;
DROP POLICY IF EXISTS "Conversation members can view members" ON public.horticulture_conversation_members;
DROP POLICY IF EXISTS "members_select" ON public.horticulture_conversation_members;

-- Réapplique la policy canonique après le nettoyage des éventuels anciens noms.
DROP POLICY IF EXISTS horticulture_members_select_member ON public.horticulture_conversation_members;
CREATE POLICY horticulture_members_select_member
ON public.horticulture_conversation_members
FOR SELECT TO authenticated
USING (public.horticulture_is_conversation_member(conversation_id));
