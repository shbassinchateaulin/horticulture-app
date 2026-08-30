(()=>{
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const MIN_REFRESH_GAP=60000;
let lastRefresh=0,busy=false,totalUnread=0,suggestionUnread=0;
function session(){try{return JSON.parse(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1')||'null')}catch{return null}}
function users(){try{return JSON.parse(localStorage.getItem('horticulture-admin-users-v2')||'[]')}catch{return[]}}
function userId(){const s=session();if(!s)return'';const us=users();const u=us.find(x=>String(x.id)===String(s.id||s.userId||''))||us.find(x=>s.username&&String(x.username||'').toLowerCase()===String(s.username).toLowerCase())||s;return String(u?.id||u?.userId||'').trim()}
function bell(){return document.querySelector('.admBell')}
function suggestionTile(){return document.querySelector('[data-permission="suggestions"]')}
function styleBadge(el,cls){let b=el.querySelector('.'+cls);if(!b){b=document.createElement('span');b.className=cls;b.style.cssText='position:absolute;right:-2px;top:-4px;min-width:18px;height:18px;padding:0 4px;border-radius:20px;background:#d62828;color:#fff;font:800 11px/18px Arial;text-align:center;z-index:40;pointer-events:none;box-sizing:border-box';if(getComputedStyle(el).position==='static')el.style.position='relative';el.appendChild(b)}return b}
function render(){const b=bell();if(b){const x=b.querySelector('.pushBellBadge');if(totalUnread>0){styleBadge(b,'pushBellBadge').textContent='1'}else x?.remove()}const t=suggestionTile();if(t){const x=t.querySelector('.pushSugBadge');if(suggestionUnread>0){const sb=styleBadge(t,'pushSugBadge');sb.style.right='10px';sb.style.top='9px';sb.textContent='1'}else x?.remove()}}
function setFromNotifications(ns){const unread=(Array.isArray(ns)?ns:[]).filter(n=>!n.read);totalUnread=unread.length?1:0;suggestionUnread=unread.some(n=>String(n.type||'').toLowerCase()==='suggestion')?1:0;render()}
async function refresh(force=false){const id=userId(),now=Date.now();if(!id||busy||(!force&&now-lastRefresh<MIN_REFRESH_GAP))return;busy=true;lastRefresh=now;const c=new AbortController(),timer=setTimeout(()=>c.abort(),4000);try{const r=await fetch(API+'?action=listNotifications&userId='+encodeURIComponent(id)+'&t='+now,{cache:'no-store',signal:c.signal});const j=await r.json();if(j?.ok&&Array.isArray(j.notifications))setFromNotifications(j.notifications)}catch(e){console.warn('Badges notification',e)}finally{clearTimeout(timer);busy=false}}
function onPush(e){const d=e?.detail||{};const data=d.data||d.additionalData||{};totalUnread=1;if(String(data.type||d.type||'').toLowerCase()==='suggestion')suggestionUnread=1;render()}
window.addEventListener('horticulture-onesignal-push',onPush);
window.addEventListener('horticulture-onesignal-user-bound',()=>setTimeout(()=>refresh(true),250));
window.addEventListener('focus',()=>refresh(false));
window.addEventListener('pageshow',()=>{render();refresh(false)});
window.addEventListener('horticulture-users-synced',()=>refresh(false));
setTimeout(()=>{render();refresh(true)},1200);
window.HorticultureLightBadges={refresh:()=>refresh(true),render};
})();