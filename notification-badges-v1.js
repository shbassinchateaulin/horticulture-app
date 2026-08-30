(()=>{
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const MIN_REFRESH_GAP=60000;
let lastRefresh=0,busy=false,state={suggestion:false,other:false,items:[]};
function session(){try{return JSON.parse(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1')||'null')}catch{return null}}
function users(){try{return JSON.parse(localStorage.getItem('horticulture-admin-users-v2')||'[]')}catch{return[]}}
function userId(){const s=session();if(!s)return'';const us=users();const u=us.find(x=>String(x.id)===String(s.id||s.userId||''))||us.find(x=>s.username&&String(x.username||'').toLowerCase()===String(s.username).toLowerCase())||s;return String(u?.id||u?.userId||'').trim()}
function storageKey(){return 'horticulture-light-badges-v2:'+(userId()||'anonymous')}
function cleanItem(n={}){return{id:String(n.id||''),type:String(n.type||'info').toLowerCase(),title:String(n.title||'Notification'),message:String(n.message||n.body||''),createdAt:String(n.createdAt||new Date().toISOString()),data:(n.data&&typeof n.data==='object')?n.data:{}}}
function load(){try{const v=JSON.parse(localStorage.getItem(storageKey())||'null');if(v&&typeof v==='object'){state={suggestion:!!v.suggestion,other:!!v.other,items:Array.isArray(v.items)?v.items.map(cleanItem).slice(0,20):[]}}}catch{}}
function save(){try{localStorage.setItem(storageKey(),JSON.stringify(state))}catch{}}
function bell(){return document.querySelector('.admBell')}
function suggestionTile(){return document.querySelector('[data-permission="suggestions"]')}
function styleBadge(el,cls){let b=el.querySelector('.'+cls);if(!b){b=document.createElement('span');b.className=cls;b.style.cssText='position:absolute;right:-2px;top:-4px;min-width:18px;height:18px;padding:0 4px;border-radius:20px;background:#d62828;color:#fff;font:800 11px/18px Arial;text-align:center;z-index:40;pointer-events:none;box-sizing:border-box';if(getComputedStyle(el).position==='static')el.style.position='relative';el.appendChild(b)}return b}
function render(){const total=state.suggestion||state.other;const b=bell();if(b){const x=b.querySelector('.pushBellBadge');if(total){styleBadge(b,'pushBellBadge').textContent='1'}else x?.remove()}const t=suggestionTile();if(t){const x=t.querySelector('.pushSugBadge');if(state.suggestion){const sb=styleBadge(t,'pushSugBadge');sb.style.right='10px';sb.style.top='9px';sb.textContent='1'}else x?.remove()}window.dispatchEvent(new CustomEvent('horticulture-light-badges-updated'))}
function addItem(item){const n=cleanItem(item),key=n.id||[n.type,n.title,n.message,n.createdAt].join('|');state.items=state.items.filter(x=>(x.id||[x.type,x.title,x.message,x.createdAt].join('|'))!==key);state.items.unshift(n);state.items=state.items.slice(0,20);if(n.type==='suggestion')state.suggestion=true;else state.other=true;save();render()}
function setState(next){state={suggestion:!!next.suggestion,other:!!next.other,items:Array.isArray(next.items)?next.items.map(cleanItem).slice(0,20):[]};save();render()}
function mergeNotifications(ns){const unread=(Array.isArray(ns)?ns:[]).filter(n=>!n.read);if(!unread.length){render();return}for(const n of unread)addItem(n)}
async function fetchJson(url,options={}){const c=new AbortController(),timer=setTimeout(()=>c.abort(),4000);try{const r=await fetch(url,{...options,signal:c.signal,cache:'no-store'}),text=await r.text();let j=null;try{j=JSON.parse(text)}catch{};return j}finally{clearTimeout(timer)}}
async function refresh(force=false){const id=userId(),now=Date.now();if(!id||busy||(!force&&now-lastRefresh<MIN_REFRESH_GAP))return;busy=true;lastRefresh=now;try{const j=await fetchJson(API+'?action=listNotifications&userId='+encodeURIComponent(id)+'&t='+now);if(j?.ok&&Array.isArray(j.notifications))mergeNotifications(j.notifications)}catch(e){console.warn('Badges notification',e)}finally{busy=false}}
async function markServerRead(notificationId){const id=userId();if(!id||!notificationId)return false;try{const j=await fetchJson(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'markNotificationRead',notificationId:String(notificationId),userId:id})});return !!j?.ok}catch{return false}}
async function markAllServerRead(){const id=userId();if(!id)return false;try{const j=await fetchJson(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'markAllNotificationsRead',userId:id})});return !!j?.ok}catch{return false}}
function recalc(){state.suggestion=state.items.some(x=>x.type==='suggestion');state.other=state.items.some(x=>x.type!=='suggestion');save();render()}
function markItemRead(notificationId){const id=String(notificationId||'');const item=state.items.find(x=>String(x.id)===id);state.items=state.items.filter(x=>String(x.id)!==id);recalc();if(item?.id&&!item.id.startsWith('local-'))markServerRead(item.id);return true}
function markSuggestionRead(suggestionId=''){const key=String(suggestionId||'');const matches=state.items.filter(x=>x.type==='suggestion'&&(!key||String(x.data?.suggestionId||x.data?.row||'')===key));state.items=state.items.filter(x=>!(x.type==='suggestion'&&(!key||String(x.data?.suggestionId||x.data?.row||'')===key)));state.suggestion=state.items.some(x=>x.type==='suggestion');if(!matches.length)state.suggestion=false;save();render();for(const n of matches)if(n.id&&!n.id.startsWith('local-'))markServerRead(n.id);return true}
function clearAll(){setState({suggestion:false,other:false,items:[]});markAllServerRead();return true}
function pushType(e){const d=e?.detail||{},data=d.data||d.additionalData||{};return String(data.type||d.type||'').toLowerCase()}
function onPush(e){const d=e?.detail||{},type=pushType(e)||'info';addItem({id:d.id||'',type,title:d.title||'Notification',message:d.message||d.body||'',createdAt:new Date().toISOString(),data:d.data||d.additionalData||{}})}
function fallbackItems(){if(state.items.length)return state.items.slice();const out=[];if(state.suggestion)out.push(cleanItem({id:'local-suggestion',type:'suggestion',title:'Nouvelle suggestion reçue',message:'Une suggestion est en attente de lecture.',createdAt:new Date().toISOString()}));if(state.other)out.push(cleanItem({id:'local-notification',type:'info',title:'Notification non lue',message:'Une notification est en attente de lecture.',createdAt:new Date().toISOString()}));return out}
load();render();
window.addEventListener('horticulture-onesignal-push',onPush);
window.addEventListener('horticulture-onesignal-click',e=>{const type=pushType(e);if(type==='suggestion')markSuggestionRead();else clearAll()});
window.addEventListener('pageshow',()=>{load();render()});
document.addEventListener('click',e=>{const card=e.target.closest?.('.sugCard[data-id]');if(card)markSuggestionRead(String(card.dataset.id||''))},true);
setTimeout(()=>{load();render();refresh(true)},1800);
window.HorticultureLightBadges={refresh:()=>refresh(false),render,getItems:fallbackItems,getState:()=>({...state,items:state.items.slice()}),markItemRead,markSuggestionRead,clearAll};
})();