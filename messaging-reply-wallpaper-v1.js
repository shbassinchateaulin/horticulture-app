(()=>{
'use strict';
if(window.__horticultureMessagingReplyWallpaperV2)return;
window.__horticultureMessagingReplyWallpaperV2=true;

const USERS='horticulture-admin-users-v2',SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1';
const DELETED='Ce message a été supprimé';
const DELETED_KEY='horticulture-msg-deleted-global-v1';
const deletedIds=new Set();
let refreshTimer=null,lastConversation='';

function me(){try{return JSON.parse(localStorage.getItem(PERSIST)||sessionStorage.getItem(SESSION)||'null')}catch{return null}}
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]').filter(x=>x.active!==false)}catch{return[]}}
function peer(){const n=document.querySelector('#messaging .m6Peer b')?.textContent?.trim();return users().find(x=>[x.firstName,x.lastName].filter(Boolean).join(' ')===n)?.id||null}
async function activeConversation(){const t=window.HorticultureSupabaseTransport;if(!t)return null;const p=peer();if(p)return t.ensureDirect?.(String(p));const title=document.querySelector('#messaging .m6Peer b')?.textContent?.trim();if(!title)return null;const groups=await t.listGroups?.()||[];return groups.find(g=>g.title===title)?.conversationId||null}
function unb64(s){try{s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return JSON.parse(decodeURIComponent(escape(atob(s))))}catch{return null}}
function replyData(raw){const x=String(raw||'').match(/^\[\[HORTI_REPLY_V1:([A-Za-z0-9_-]+)\]\]/);return x?unb64(x[1]):null}
function isDeletedText(v){return String(v||'').trim()===DELETED}
function loadDeleted(){try{JSON.parse(localStorage.getItem(DELETED_KEY)||'[]').forEach(id=>deletedIds.add(String(id)))}catch(_){}}
function saveDeleted(){try{localStorage.setItem(DELETED_KEY,JSON.stringify([...deletedIds].slice(-2000)))}catch(_){}}
function rememberDeleted(id){if(!id)return;deletedIds.add(String(id));saveDeleted()}

function rememberVisibleDeletes(root=document){root.querySelectorAll?.('#messaging .m6Messages .m6Bubble').forEach(b=>{
  if(b.dataset.messageId&&isDeletedText(b.textContent))rememberDeleted(b.dataset.messageId);
});}
function stabilizeQuotes(root=document){
  rememberVisibleDeletes(root);
  root.querySelectorAll?.('#messaging .m6Messages .m6Bubble').forEach(b=>{
    const d=replyData(b.dataset.messageText||'');
    if(!d?.id||!deletedIds.has(String(d.id)))return;
    const q=b.querySelector('.hortiReplyQuote');if(!q)return;
    const span=q.querySelector('span');if(span&&span.textContent!==DELETED)span.textContent=DELETED;
    q.classList.add('hortiReplyDeleted');
  });
}
async function refreshDeletedIds(){
  try{
    const t=window.HorticultureSupabaseTransport;if(!t?.listConversationMessages)return;
    const cid=await activeConversation();if(!cid)return;
    lastConversation=String(cid);
    const rows=await t.listConversationMessages(cid,false)||[];
    rows.forEach(m=>{if(isDeletedText(m?.text))deletedIds.add(String(m.id))});
    saveDeleted();
    stabilizeQuotes();
  }catch(_){stabilizeQuotes()}
}
function scheduleRefresh(delay=40){clearTimeout(refreshTimer);refreshTimer=setTimeout(refreshDeletedIds,delay)}

function installStyle(){
  document.getElementById('hortiReplyWallpaperStyleV1')?.remove();
  if(document.getElementById('hortiReplyWallpaperStyleV2'))return;
  const s=document.createElement('style');s.id='hortiReplyWallpaperStyleV2';s.textContent=`
#messaging .m6Messages{background-color:#f1f6f1!important;background-image:linear-gradient(rgba(241,246,241,.93),rgba(241,246,241,.93)),url('./logo-admin-transparent.png')!important;background-size:auto,112px 112px!important;background-repeat:repeat,repeat!important;background-position:0 0,18px 14px!important;background-attachment:local!important;background-blend-mode:normal,luminosity!important}
#messaging .m6Bubble{position:relative;z-index:1}
#messaging .hortiReplyQuote.hortiReplyDeleted{opacity:.78;font-style:italic}
#messaging .hortiReplyQuote.hortiReplyDeleted b{font-style:normal}
@media(max-width:700px){#messaging .m6Messages{background-size:auto,96px 96px!important;background-position:0 0,12px 10px!important}}
`;
  document.head.appendChild(s);
}
function applyWallpaper(){installStyle()}
function run(){applyWallpaper();stabilizeQuotes();scheduleRefresh(20)}

loadDeleted();
const observer=new MutationObserver(muts=>{
  let relevant=false;
  for(const m of muts){
    const el=m.target?.nodeType===1?m.target:m.target?.parentElement;
    if(el?.closest?.('#messaging .m6Messages')||[...m.addedNodes].some(n=>n.nodeType===1&&n.matches?.('#messaging .m6Messages,#messaging .m6Messages *'))){relevant=true;break}
  }
  if(relevant){stabilizeQuotes();applyWallpaper()}
});
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});

window.addEventListener('horticulture-messages-cache-updated',()=>{stabilizeQuotes();scheduleRefresh(0)});
window.addEventListener('horticulture-supabase-conversation-updated',()=>{stabilizeQuotes();scheduleRefresh(0)});
window.addEventListener('horticulture-realtime-message',e=>{
  const m=e.detail?.message;if(m?.id&&isDeletedText(m?.body))rememberDeleted(m.id);
  stabilizeQuotes();scheduleRefresh(0)
});
window.addEventListener('horticulture-users-synced',()=>setTimeout(run,20));
document.addEventListener('click',e=>{if(e.target.closest?.('#messaging,[data-module="messaging"]'))setTimeout(run,0)},true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
[0,80,250,700,1400].forEach(ms=>setTimeout(run,ms));
setInterval(()=>{if(document.querySelector('#messaging .m6Messages')){stabilizeQuotes();if(!lastConversation)scheduleRefresh(0)}},1200);
})();
