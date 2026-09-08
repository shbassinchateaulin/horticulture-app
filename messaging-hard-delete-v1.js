(()=>{
'use strict';
if(window.__horticultureMessagingHardDeleteV1)return;window.__horticultureMessagingHardDeleteV1=true;
const DELETED='Ce message a été supprimé',CACHE_PREFIX='horticulture-msg-cache-v1:',DELETED_KEY='horticulture-msg-deleted-global-v1';
let lastBubble=null,channel=null,busy=false;
function sb(){return window.HorticultureSupabaseMessaging?.client||window.HorticultureSupabaseClient||null}
function remember(id){if(!id)return;try{const s=new Set(JSON.parse(localStorage.getItem(DELETED_KEY)||'[]').map(String));s.add(String(id));localStorage.setItem(DELETED_KEY,JSON.stringify([...s].slice(-2000)))}catch(_){}}
function purgeCaches(id){try{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(!k?.startsWith(CACHE_PREFIX))continue;let d=null;try{d=JSON.parse(localStorage.getItem(k)||'null')}catch{}if(!d||!Array.isArray(d.messages))continue;const before=d.messages.length;d.messages=d.messages.filter(m=>String(m?.id||'')!==String(id));if(d.messages.length!==before){d.savedAt=Date.now();localStorage.setItem(k,JSON.stringify(d))}}}catch(_){}}
function currentBubbleFromPoint(e){return e.target?.closest?.('#messaging .m6Messages .m6Bubble')||null}
function clearReplyBarFor(id){const bar=document.querySelector('.hortiReplyBar');if(!bar)return;const t=bar.textContent||'';if(t.includes(DELETED))bar.remove()}
async function hardDelete(id,bubble){const client=sb();if(!client)throw Error('Supabase indisponible');remember(id);purgeCaches(id);clearReplyBarFor(id);bubble?.remove();window.dispatchEvent(new CustomEvent('horticulture-message-deleted',{detail:{id,hardDelete:true}}));const {error}=await client.rpc('horticulture_hard_delete_message',{p_message_id:id});if(error)throw error;window.dispatchEvent(new CustomEvent('horticulture-supabase-conversation-updated',{detail:{messageId:id,hardDeleted:true}}))}
async function interceptDelete(e){const btn=e.target?.closest?.('.hortiMsgMenu button[data-a="deleteAll"]');if(!btn||busy)return;e.preventDefault();e.stopImmediatePropagation();const bubble=lastBubble;if(!bubble?.dataset?.messageId)return;const id=String(bubble.dataset.messageId);if(!confirm('Supprimer définitivement ce message pour tous les participants ?'))return;busy=true;document.querySelector('.hortiMsgMenu')?.remove();try{await hardDelete(id,bubble)}catch(err){console.error('Suppression définitive',err);alert('La suppression définitive n’a pas pu être effectuée. La fonction Supabase V7 doit être installée sur la base.')}finally{busy=false}}
function track(e){const b=currentBubbleFromPoint(e);if(b)lastBubble=b}
document.addEventListener('contextmenu',track,true);document.addEventListener('pointerdown',track,true);document.addEventListener('click',interceptDelete,true);
function subscribeDelete(){const client=sb();if(!client||channel)return;channel=client.channel('horticulture-message-hard-delete-v1').on('postgres_changes',{event:'DELETE',schema:'public',table:'horticulture_messages'},p=>{const id=String(p.old?.id||'');if(id){remember(id);purgeCaches(id)}window.dispatchEvent(new CustomEvent('horticulture-supabase-conversation-updated',{detail:{messageId:id,hardDeleted:true,remote:true}}))}).subscribe()}
window.addEventListener('horticulture-supabase-ready',subscribeDelete);window.addEventListener('horticulture-supabase-authenticated',subscribeDelete);[300,1000,2500].forEach(ms=>setTimeout(subscribeDelete,ms));
})();
