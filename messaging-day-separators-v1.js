(()=>{
'use strict';
if(window.__horticultureMessagingDaySeparatorsV1)return;window.__horticultureMessagingDaySeparatorsV1=true;
const USERS='horticulture-admin-users-v2';
let busy=false,timer=null;
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]').filter(x=>x.active!==false)}catch{return[]}}
function peer(){const n=document.querySelector('#messaging .m6Peer b')?.textContent?.trim();return users().find(x=>[x.firstName,x.lastName].filter(Boolean).join(' ')===n)?.id||null}
function dayKey(v){const d=new Date(v);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function label(v){const d=new Date(v);if(Number.isNaN(d.getTime()))return'';const now=new Date(),a=new Date(now.getFullYear(),now.getMonth(),now.getDate()),b=new Date(d.getFullYear(),d.getMonth(),d.getDate()),diff=Math.round((a-b)/86400000);if(diff===0)return'Aujourd’hui';if(diff===1)return'Hier';if(diff===2)return'Avant-hier';return d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:d.getFullYear()===now.getFullYear()?undefined:'numeric'})}
async function conversationId(){const t=window.HorticultureSupabaseTransport;if(!t)return null;const p=peer();if(p)return t.ensureDirect?.(String(p));const title=document.querySelector('#messaging .m6Peer b')?.textContent?.trim();if(!title)return null;const groups=await t.listGroups?.()||[];return groups.find(g=>g.title===title)?.conversationId||null}
async function apply(){if(busy)return;const box=document.querySelector('#messaging .m6Messages');if(!box)return;const bubbles=[...box.querySelectorAll('.m6Bubble')];if(!bubbles.length)return;busy=true;try{const t=window.HorticultureSupabaseTransport,cid=await conversationId();if(!t?.listConversationMessages||!cid)return;const rows=await t.listConversationMessages(cid,false)||[];box.querySelectorAll(':scope>.m6Day').forEach(x=>x.remove());let prev='';bubbles.forEach((b,i)=>{const m=rows[i];if(!m?.createdAt)return;const k=dayKey(m.createdAt);if(!k||k===prev)return;prev=k;const d=document.createElement('div');d.className='m6Day';d.textContent=label(m.createdAt);box.insertBefore(d,b)})}catch(e){console.warn('Message day separators',e)}finally{busy=false}}
function schedule(ms=0){clearTimeout(timer);timer=setTimeout(apply,ms)}
const observer=new MutationObserver(m=>{if(m.some(x=>{const e=x.target?.nodeType===1?x.target:x.target?.parentElement;return e?.closest?.('#messaging .m6Messages')||[...x.addedNodes].some(n=>n.nodeType===1&&n.matches?.('#messaging .m6Messages,#messaging .m6Messages *'))}))schedule(0)});
observer.observe(document.documentElement,{subtree:true,childList:true});
['horticulture-messages-cache-updated','horticulture-supabase-conversation-updated','horticulture-realtime-message'].forEach(ev=>window.addEventListener(ev,()=>schedule(0)));
document.addEventListener('click',e=>{if(e.target.closest?.('#messaging'))schedule(30)},true);
[100,400,1000].forEach(schedule);
})();