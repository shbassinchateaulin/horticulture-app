(()=>{
'use strict';
if(window.__horticultureMessagingDaySeparatorsV3)return;window.__horticultureMessagingDaySeparatorsV3=true;
const USERS='horticulture-admin-users-v2';
let busy=false,timer=null,pending=false,midnightTimer=null;
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]').filter(x=>x.active!==false)}catch{return[]}}
function visibleName(){return document.querySelector('#messaging .m6Peer b')?.textContent?.trim()||''}
function peer(){const n=visibleName();return users().find(x=>[x.firstName,x.lastName].filter(Boolean).join(' ')===n)?.id||null}
function dayKey(v){const d=new Date(v);return Number.isNaN(d.getTime())?'':`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function label(v){const d=new Date(v);if(Number.isNaN(d.getTime()))return'';const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),day=new Date(d.getFullYear(),d.getMonth(),d.getDate()),diff=Math.round((today-day)/86400000);if(diff===0)return'Aujourd’hui';if(diff===1)return'Hier';if(diff===2)return'Avant-hier';return d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:d.getFullYear()===now.getFullYear()?undefined:'numeric'})}
function installStyle(){if(document.getElementById('horticultureDaySeparatorsV3Style'))return;const s=document.createElement('style');s.id='horticultureDaySeparatorsV3Style';s.textContent=`#messaging .m6Messages>.m6Day:not([data-dynamic-day="1"]){display:none!important}#messaging .m6Messages>.m6Day[data-dynamic-day="1"]{display:block!important}`;document.head.appendChild(s)}
async function rowsForActive(){const t=window.HorticultureSupabaseTransport;if(!t)return[];const p=peer();if(p){try{const j=await t.listMessages?.(String(p),false);if(Array.isArray(j?.messages))return j.messages}catch(_){ }try{const cid=await t.ensureDirect?.(String(p));if(cid){const rows=await t.listConversationMessages?.(cid,false);if(Array.isArray(rows))return rows}}catch(_){ }}const title=visibleName();try{const all=await t.listAllConversations?.()||[];const c=all.find(x=>x.isGroup?x.title===title:String(x.otherUserId||'')===String(p||''));if(c?.conversationId){const rows=await t.listConversationMessages?.(c.conversationId,false);if(Array.isArray(rows))return rows}}catch(_){ }try{const groups=await t.listGroups?.()||[];const g=groups.find(x=>x.title===title);if(g?.conversationId){const rows=await t.listConversationMessages?.(g.conversationId,false);if(Array.isArray(rows))return rows}}catch(_){ }return[]}
function clearDynamic(box){box?.querySelectorAll(':scope>.m6Day[data-dynamic-day="1"]').forEach(x=>x.remove())}
async function apply(){installStyle();const box=document.querySelector('#messaging .m6Messages');if(!box)return;if(busy){pending=true;return}busy=true;try{const bubbles=[...box.querySelectorAll(':scope>.m6Bubble')];if(!bubbles.length){clearDynamic(box);return}const rows=await rowsForActive();if(!rows.length)return;const byId=new Map(rows.map(m=>[String(m.id||''),m]));const plan=[];let prev='';bubbles.forEach((b,i)=>{const m=(b.dataset.messageId&&byId.get(String(b.dataset.messageId)))||rows[i];if(!m?.createdAt)return;const k=dayKey(m.createdAt);if(!k||k===prev)return;prev=k;plan.push({bubble:b,createdAt:m.createdAt})});clearDynamic(box);for(const p of plan){if(!p.bubble.isConnected)continue;const d=document.createElement('div');d.className='m6Day';d.dataset.dynamicDay='1';d.dataset.dayTimestamp=String(p.createdAt);d.textContent=label(p.createdAt);box.insertBefore(d,p.bubble)}}catch(e){console.warn('Message day separators',e)}finally{busy=false;if(pending){pending=false;schedule(0)}}}
function schedule(ms=0){clearTimeout(timer);timer=setTimeout(apply,ms)}
function scheduleMidnight(){clearTimeout(midnightTimer);const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,0,0,1,50);midnightTimer=setTimeout(()=>{apply();scheduleMidnight()},Math.max(1000,next-now))}
installStyle();
const observer=new MutationObserver(muts=>{if(muts.some(x=>{const e=x.target?.nodeType===1?x.target:x.target?.parentElement;return e?.closest?.('#messaging .m6Messages')||[...x.addedNodes].some(n=>n.nodeType===1&&n.matches?.('#messaging .m6Messages,#messaging .m6Messages *'))}))schedule(0)});
observer.observe(document.documentElement,{subtree:true,childList:true});
['horticulture-messages-cache-updated','horticulture-supabase-conversation-updated','horticulture-realtime-message','horticulture-users-synced'].forEach(ev=>window.addEventListener(ev,()=>schedule(0)));
document.addEventListener('click',e=>{if(e.target.closest?.('#messaging'))schedule(0)},true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(0)});
window.addEventListener('focus',()=>schedule(0));
[0,80,250,700].forEach(ms=>setTimeout(apply,ms));
scheduleMidnight();
})();