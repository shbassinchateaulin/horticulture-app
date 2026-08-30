(()=>{
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const MIN_REFRESH_GAP=60000;
let lastRefresh=0,busy=false,state={suggestion:false,other:false};
function session(){try{return JSON.parse(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1')||'null')}catch{return null}}
function users(){try{return JSON.parse(localStorage.getItem('horticulture-admin-users-v2')||'[]')}catch{return[]}}
function userId(){const s=session();if(!s)return'';const us=users();const u=us.find(x=>String(x.id)===String(s.id||s.userId||''))||us.find(x=>s.username&&String(x.username||'').toLowerCase()===String(s.username).toLowerCase())||s;return String(u?.id||u?.userId||'').trim()}
function storageKey(){return 'horticulture-light-badges-v2:'+(userId()||'anonymous')}
function load(){try{const v=JSON.parse(localStorage.getItem(storageKey())||'null');if(v&&typeof v==='object')state={suggestion:!!v.suggestion,other:!!v.other}}catch{}}
function save(){try{localStorage.setItem(storageKey(),JSON.stringify(state))}catch{}}
function bell(){return document.querySelector('.admBell')}
function suggestionTile(){return document.querySelector('[data-permission="suggestions"]')}
function styleBadge(el,cls){let b=el.querySelector('.'+cls);if(!b){b=document.createElement('span');b.className=cls;b.style.cssText='position:absolute;right:-2px;top:-4px;min-width:18px;height:18px;padding:0 4px;border-radius:20px;background:#d62828;color:#fff;font:800 11px/18px Arial;text-align:center;z-index:40;pointer-events:none;box-sizing:border-box';if(getComputedStyle(el).position==='static')el.style.position='relative';el.appendChild(b)}return b}
function render(){const total=state.suggestion||state.other;const b=bell();if(b){const x=b.querySelector('.pushBellBadge');if(total){styleBadge(b,'pushBellBadge').textContent='1'}else x?.remove()}const t=suggestionTile();if(t){const x=t.querySelector('.pushSugBadge');if(state.suggestion){const sb=styleBadge(t,'pushSugBadge');sb.style.right='10px';sb.style.top='9px';sb.textContent='1'}else x?.remove()}}
function setState(next){state={suggestion:!!next.suggestion,other:!!next.other};save();render()}
function mergeNotifications(ns){const unread=(Array.isArray(ns)?ns:[]).filter(n=>!n.read);if(!unread.length){render();return}const hasSuggestion=unread.some(n=>String(n.type||'').toLowerCase()==='suggestion');const hasOther=unread.some(n=>String(n.type||'').toLowerCase()!=='suggestion');state.suggestion=state.suggestion||hasSuggestion;state.other=state.other||hasOther;save();render()}
async function refresh(force=false){const id=userId(),now=Date.now();if(!id||busy||(!force&&now-lastRefresh<MIN_REFRESH_GAP))return;busy=true;lastRefresh=now;const c=new AbortController(),timer=setTimeout(()=>c.abort(),4000);try{const r=await fetch(API+'?action=listNotifications&userId='+encodeURIComponent(id)+'&t='+now,{cache:'no-store',signal:c.signal});const j=await r.json();if(j?.ok&&Array.isArray(j.notifications))mergeNotifications(j.notifications)}catch(e){console.warn('Badges notification',e)}finally{clearTimeout(timer);busy=false}}
function pushType(e){const d=e?.detail||{},data=d.data||d.additionalData||{};return String(data.type||d.type||'').toLowerCase()}
function onPush(e){const type=pushType(e);if(type==='suggestion')state.suggestion=true;else state.other=true;save();render()}
function clearSuggestion(){state.suggestion=false;save();render()}
function clearAll(){setState({suggestion:false,other:false})}
load();render();
window.addEventListener('horticulture-onesignal-push',onPush);
window.addEventListener('horticulture-onesignal-click',e=>{const type=pushType(e);if(type==='suggestion')clearSuggestion();else clearAll()});
window.addEventListener('horticulture-onesignal-user-bound',()=>setTimeout(()=>refresh(true),250));
window.addEventListener('focus',()=>refresh(false));
window.addEventListener('pageshow',()=>{load();render();refresh(false)});
window.addEventListener('horticulture-users-synced',()=>refresh(false));
document.addEventListener('click',e=>{if(e.target.closest?.('.sugCard[data-id]'))clearSuggestion()},true);
setTimeout(()=>{load();render();refresh(true)},1200);
window.HorticultureLightBadges={refresh:()=>refresh(true),render,clearSuggestion,clearAll};
})();