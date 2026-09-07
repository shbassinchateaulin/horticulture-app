(()=>{
'use strict';
if(window.__horticultureMessagingReplyWallpaperV1)return;
window.__horticultureMessagingReplyWallpaperV1=true;

const USERS='horticulture-admin-users-v2',SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1';
const DELETED='Ce message a été supprimé';
const deletedIds=new Set();
let refreshTimer=null,lastConversation='';

function me(){try{return JSON.parse(localStorage.getItem(PERSIST)||sessionStorage.getItem(SESSION)||'null')}catch{return null}}
function users(){try{return JSON.parse(localStorage.getItem(USERS)||'[]').filter(x=>x.active!==false)}catch{return[]}}
function peer(){const n=document.querySelector('#messaging .m6Peer b')?.textContent?.trim();return users().find(x=>[x.firstName,x.lastName].filter(Boolean).join(' ')===n)?.id||null}
async function activeConversation(){const t=window.HorticultureSupabaseTransport;if(!t)return null;const p=peer();if(p)return t.ensureDirect?.(String(p));const title=document.querySelector('#messaging .m6Peer b')?.textContent?.trim();if(!title)return null;const groups=await t.listGroups?.()||[];return groups.find(g=>g.title===title)?.conversationId||null}
function unb64(s){try{s=String(s||'').replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return JSON.parse(decodeURIComponent(escape(atob(s))))}catch{return null}}
function replyData(raw){const x=String(raw||'').match(/^\[\[HORTI_REPLY_V1:([A-Za-z0-9_-]+)\]\]/);return x?unb64(x[1]):null}
function isDeletedText(v){return String(v||'').trim()===DELETED}

function rememberVisibleDeletes(root=document){root.querySelectorAll?.('#messaging .m6Messages .m6Bubble').forEach(b=>{
  if(b.dataset.messageId&&isDeletedText(b.textContent))deletedIds.add(String(b.dataset.messageId));
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
    deletedIds.clear();
    rows.forEach(m=>{if(isDeletedText(m?.text))deletedIds.add(String(m.id))});
    stabilizeQuotes();
  }catch(_){stabilizeQuotes()}
}
function scheduleRefresh(delay=40){clearTimeout(refreshTimer);refreshTimer=setTimeout(refreshDeletedIds,delay)}

function installStyle(){
  if(document.getElementById('hortiReplyWallpaperStyleV1'))return;
  const s=document.createElement('style');s.id='hortiReplyWallpaperStyleV1';s.textContent=`
#messaging .m6Messages{background-color:#f3f7f3!important;background-position:0 0!important;background-repeat:repeat!important;background-attachment:local!important}
#messaging .m6Bubble{position:relative;z-index:1}
#messaging .hortiReplyQuote.hortiReplyDeleted{opacity:.82;font-style:italic}
#messaging .hortiReplyQuote.hortiReplyDeleted b{font-style:normal}
`;
  document.head.appendChild(s);
}
function logoSrc(){
  const candidates=[
    document.querySelector('#messaging .msgExactLogo'),
    document.querySelector('[data-module="messaging"] .msgExactLogo'),
    document.querySelector('#messaging .m6EmptyIcon img'),
    document.querySelector('[data-module="messaging"] img'),
    document.querySelector('header img'),
    document.querySelector('.app-header img')
  ].filter(Boolean);
  return candidates.map(x=>x.currentSrc||x.src||'').find(Boolean)||'';
}
function applyWallpaper(){
  installStyle();
  const box=document.querySelector('#messaging .m6Messages');if(!box)return;
  const src=logoSrc();if(!src)return;
  const safe=src.replace(/"/g,'%22');
  box.style.backgroundImage=`linear-gradient(rgba(243,247,243,.955),rgba(243,247,243,.955)),url("${safe}")`;
  box.style.backgroundSize='auto, 118px 118px';
  box.style.backgroundRepeat='repeat, repeat';
  box.style.backgroundPosition='0 0, 14px 12px';
  box.style.backgroundBlendMode='normal, luminosity';
}
function run(){applyWallpaper();stabilizeQuotes();scheduleRefresh(25)}

const observer=new MutationObserver(muts=>{
  let relevant=false;
  for(const m of muts){
    const el=m.target?.nodeType===1?m.target:m.target?.parentElement;
    if(el?.closest?.('#messaging .m6Messages')||[...m.addedNodes].some(n=>n.nodeType===1&&n.matches?.('#messaging .m6Messages,#messaging .m6Messages *'))){relevant=true;break}
  }
  if(relevant){stabilizeQuotes();applyWallpaper()}
});
observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true});

window.addEventListener('horticulture-messages-cache-updated',()=>{stabilizeQuotes();scheduleRefresh(20)});
window.addEventListener('horticulture-supabase-conversation-updated',()=>{stabilizeQuotes();scheduleRefresh(20)});
window.addEventListener('horticulture-realtime-message',()=>{stabilizeQuotes();scheduleRefresh(20)});
window.addEventListener('horticulture-users-synced',()=>setTimeout(run,30));
document.addEventListener('click',e=>{if(e.target.closest?.('#messaging,[data-module="messaging"]'))setTimeout(run,20)},true);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)run()});
[0,120,400,900,1800].forEach(ms=>setTimeout(run,ms));
setInterval(()=>{if(document.querySelector('#messaging .m6Messages')){stabilizeQuotes();if(!lastConversation)scheduleRefresh(0)}},1500);
})();
