(()=>{
'use strict';
if(window.__horticultureMessagingDaySeparatorsV5)return;window.__horticultureMessagingDaySeparatorsV5=true;
const USERS='horticulture-admin-users-v2',CACHE='horticulture-day-label-cache-v1:';
let running=false,pending=false,midnightTimer=null,lastSignature='';
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]').filter(x=>x.active!==false)}catch{return[]}}
function visibleName(){return document.querySelector('#messaging .m6Peer b')?.textContent?.trim()||''}
function peer(){const n=visibleName();return users().find(x=>[x.firstName,x.lastName].filter(Boolean).join(' ')===n)?.id||null}
function convKey(){return String(peer()||visibleName()||'unknown')}
function dayKey(v){const d=new Date(v);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function label(v){const d=new Date(v);if(Number.isNaN(d.getTime()))return'';const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),day=new Date(d.getFullYear(),d.getMonth(),d.getDate()),diff=Math.round((today-day)/86400000);if(diff===0)return'Aujourd’hui';if(diff===1)return'Hier';if(diff===2)return'Avant-hier';return d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:d.getFullYear()===now.getFullYear()?undefined:'numeric'})}
function cachedFirst(){try{return JSON.parse(sessionStorage.getItem(CACHE+convKey())||'null')}catch{return null}}
function saveFirst(createdAt,text){try{sessionStorage.setItem(CACHE+convKey(),JSON.stringify({createdAt,text}))}catch(_){}}
async function rowsForActive(){const t=window.HorticultureSupabaseTransport;if(!t)return[];const p=peer();if(p){try{const j=await t.listMessages?.(String(p),false);if(Array.isArray(j?.messages))return j.messages}catch(_){ }try{const cid=await t.ensureDirect?.(String(p));if(cid){const rows=await t.listConversationMessages?.(cid,false);if(Array.isArray(rows))return rows}}catch(_){ }}const title=visibleName();try{const all=await t.listAllConversations?.()||[];const c=all.find(x=>x.isGroup?x.title===title:String(x.otherUserId||'')===String(p||''));if(c?.conversationId){const rows=await t.listConversationMessages?.(c.conversationId,false);if(Array.isArray(rows))return rows}}catch(_){ }return[]}
function signature(rows){return rows.map(m=>`${m.id||''}:${m.createdAt||''}`).join('|')}
function primeVisibleBadge(){const box=document.querySelector('#messaging .m6Messages');if(!box)return;const first=box.querySelector(':scope>.m6Day');if(!first)return;const c=cachedFirst();if(c?.createdAt){first.textContent=label(c.createdAt);first.dataset.hortiDay='1';first.dataset.createdAt=c.createdAt;first.dataset.dayKey=dayKey(c.createdAt)}}
async function render(force=false){const box=document.querySelector('#messaging .m6Messages');if(!box)return;primeVisibleBadge();if(running){pending=true;return}running=true;try{const rows=await rowsForActive();if(!rows.length)return;const bubbles=[...box.querySelectorAll(':scope>.m6Bubble')];if(!bubbles.length)return;const sig=signature(rows);if(!force&&sig===lastSignature&&box.querySelector(':scope>.m6Day[data-horti-day="1"]'))return;lastSignature=sig;const byId=new Map(rows.map(m=>[String(m.id||''),m]));const mapped=bubbles.map((b,i)=>(b.dataset.messageId&&byId.get(String(b.dataset.messageId)))||rows[i]).filter(Boolean);if(!mapped.length)return;
 const needed=[];let prev='';for(let i=0;i<mapped.length;i++){const m=mapped[i];if(!m?.createdAt)continue;const k=dayKey(m.createdAt);if(!k||k===prev)continue;prev=k;needed.push({bubble:bubbles[i],message:m,key:k,text:label(m.createdAt)})}
 if(!needed.length)return;
 let firstBadge=box.querySelector(':scope>.m6Day');if(!firstBadge){firstBadge=document.createElement('div');firstBadge.className='m6Day';box.insertBefore(firstBadge,needed[0].bubble)}
 box.querySelectorAll(':scope>.m6Day').forEach((d,i)=>{if(i>0)d.remove()});
 const first=needed[0];firstBadge.dataset.hortiDay='1';firstBadge.dataset.dayKey=first.key;firstBadge.dataset.createdAt=first.message.createdAt;firstBadge.textContent=first.text;box.insertBefore(firstBadge,first.bubble);saveFirst(first.message.createdAt,first.text);
 for(let i=1;i<needed.length;i++){const x=needed[i],d=document.createElement('div');d.className='m6Day';d.dataset.hortiDay='1';d.dataset.dayKey=x.key;d.dataset.createdAt=x.message.createdAt;d.textContent=x.text;box.insertBefore(d,x.bubble)}
 }catch(e){console.warn('Message day separators',e)}finally{running=false;if(pending){pending=false;queueMicrotask(()=>render(true))}}}
function relabelOnly(){document.querySelectorAll('#messaging .m6Messages>.m6Day[data-horti-day="1"]').forEach((d,i)=>{if(d.dataset.createdAt){d.textContent=label(d.dataset.createdAt);if(i===0)saveFirst(d.dataset.createdAt,d.textContent)}})}
function scheduleMidnight(){clearTimeout(midnightTimer);const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,0,80);midnightTimer=setTimeout(()=>{relabelOnly();scheduleMidnight()},Math.max(1000,next-now))}
const observer=new MutationObserver(muts=>{for(const m of muts){for(const n of m.addedNodes){if(n.nodeType!==1)continue;const box=n.matches?.('#messaging .m6Messages')?n:n.querySelector?.('#messaging .m6Messages');if(box){queueMicrotask(()=>{primeVisibleBadge();render(true)});return}if(n.matches?.('#messaging .m6Messages>.m6Day'))primeVisibleBadge()}}});
observer.observe(document.documentElement,{subtree:true,childList:true});
scheduleMidnight();
['horticulture-messages-cache-updated','horticulture-supabase-conversation-updated','horticulture-realtime-message'].forEach(ev=>window.addEventListener(ev,()=>queueMicrotask(()=>render(false))));
document.addEventListener('click',e=>{if(e.target.closest?.('#messaging .m6Row,[data-peer],[data-new-peer]'))setTimeout(()=>{primeVisibleBadge();render(true)},30)},true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){relabelOnly();primeVisibleBadge()}});
[50,200,600].forEach(ms=>setTimeout(()=>{primeVisibleBadge();render(true)},ms));
})();