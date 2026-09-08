-- Horticulture messaging V7 — true delete-for-everyone
-- Run once in the Supabase SQL editor after the V6 messaging migration.

create or replace function public.horticulture_hard_delete_message(p_message_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_conversation uuid;
  v_sender text;
  v_row record;
  v_token text;
  v_b64 text;
  v_payload jsonb;
  v_new_token text;
  v_suffix text;
begin
  select conversation_id, sender_id
    into v_conversation, v_sender
  from public.horticulture_messages
  where id = p_message_id;

  if v_conversation is null then
    return true;
  end if;

  if v_sender <> public.horticulture_auth_app_user_id() then
    raise exception 'DELETE_NOT_ALLOWED';
  end if;

  if not public.horticulture_is_conversation_member(v_conversation) then
    raise exception 'NOT_A_CONVERSATION_MEMBER';
  end if;

  -- Replies currently contain a small encoded snapshot of the quoted text.
  -- Before deleting the original message, replace that snapshot with the
  -- deleted-message label so the original content cannot reappear later.
  for v_row in
    select id, body
    from public.horticulture_messages
    where conversation_id = v_conversation
      and id <> p_message_id
      and body like '[[HORTI_REPLY_V1:%'
  loop
    begin
      v_token := (regexp_match(v_row.body, '^\[\[HORTI_REPLY_V1:([A-Za-z0-9_-]+)\]\]'))[1];
      if v_token is null then
        continue;
      end if;

      v_b64 := translate(v_token, '-_', '+/');
      v_b64 := v_b64 || repeat('=', (4 - length(v_b64) % 4) % 4);
      v_payload := convert_from(decode(v_b64, 'base64'), 'UTF8')::jsonb;

      if coalesce(v_payload->>'id','') <> p_message_id::text then
        continue;
      end if;

      v_payload := jsonb_set(v_payload, '{text}', to_jsonb('Ce message a été supprimé'::text), true);
      v_new_token := encode(convert_to(v_payload::text, 'UTF8'), 'base64');
      v_new_token := replace(replace(v_new_token, E'\n', ''), E'\r', '');
      v_new_token := rtrim(translate(v_new_token, '+/', '-_'), '=');
      v_suffix := regexp_replace(v_row.body, '^\[\[HORTI_REPLY_V1:[A-Za-z0-9_-]+\]\]\n?', '');

      update public.horticulture_messages
      set body = '[[HORTI_REPLY_V1:' || v_new_token || ']]' || E'\n' || v_suffix
      where id = v_row.id;
    exception when others then
      -- A malformed legacy reply must never block deletion of the original.
      null;
    end;
  end loop;

  delete from public.horticulture_messages
  where id = p_message_id;

  return true;
end;
$$;

revoke all on function public.horticulture_hard_delete_message(uuid) from public, anon;
grant execute on function public.horticulture_hard_delete_message(uuid) to authenticated;
