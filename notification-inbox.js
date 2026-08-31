(()=>{
'use strict';
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const qs=new URLSearchParams(location.search),userId=qs.get('userId')||'';
const list=document.getElementById('list'),readAll=document.getElementById('readAll');
const CACHE_KEY='horticulture-notification-inbox-cache-v2:'+userId;
let rows=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=t=>{t=String(t||'').toLowerCase();if(t.includes('suggest'))return'Suggestion';if(t.includes('helloasso')||t.includes('membership')||t.includes('adherent'))return'Adhérents';if(t.includes('ag'))return'Assemblée générale';if(t.includes('sortie'))return'Sortie';if(t.includes('admin'))return'Administratif';return'Information'};
const icon=t=>{t=String(t||'').toLowerCase();if(t.includes('suggest'))return'💡';if(t.includes('helloasso')||t.includes('membership')||t.includes('adherent'))return'👤';if(t.includes('ag'))return'🗳️';if(t.includes('sortie'))return'🌿';return'🔔'};
const ago=v=>{const d=new Date(v),m=Math.floor((Date.now()-d.getTime())/60000);if(!Number.isFinite(m))return'';if(m<1)return"À l’instant";if(m<60)return`Il y a ${m} min`;const h=Math.floor(m/60);if(h<24)return`Il y a ${h} h`;const j=Math.floor(h/24);return j===1?'Hier':`Il y a ${j} jours`};
async function post(body){const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});const j=await r.json();if(!j?.ok)throw new Error(j?.error||'Erreur');return j}
function visibleRows(){const cutoff=Date.now()-30*86400000;return rows.filter(n=>!n.read&&(!n.createdAt||Date.parse(n.createdAt)>=cutoff))}
function saveCache(){try{sessionStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),rows}))}catch(_){}}
function loadCache(){try{const c=JSON.parse(sessionStorage.getItem(CACHE_KEY)||'null');if(c&&Array.isArray(c.rows)&&Date.now()-Number(c.at||0)<10*60*1000){rows=c.rows;return true}}catch(_){}return false}
function render(){const v=visibleRows();window.parent.postMessage({source:'horticulture-notification-inbox',unread:v.length},location.origin);readAll.disabled=!v.length;if(!v.length){list.className='empty';list.innerHTML='<div class="emptyIcon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></div>Aucune nouvelle notification.';return}list.className='list';list.innerHTML=v.map(n=>`<div class="card" data-id="${esc(n.id)}"><div class="icon">${icon(n.type)}</div><div><b>${esc(n.title)}</b><p>${esc(n.message)}</p><div class="meta">${esc(label(n.type))} · ${esc(ago(n.createdAt))}</div></div></div>`).join('')}
async function refresh(){if(!userId){list.className='error';list.textContent='Utilisateur non identifié.';return}try{const r=await fetch(`${API}?action=listNotifications&userId=${encodeURIComponent(userId)}&t=${Date.now()}`,{cache:'no-store'}),j=await r.json();if(!j?.ok)throw new Error(j?.error||'Lecture impossible');rows=Array.isArray(j.notifications)?j.notifications:[];saveCache();render()}catch(e){if(!rows.length){list.className='error';list.textContent='Impossible de charger les notifications.'}}}
if(loadCache())render();
refresh();
list.addEventListener('click',async e=>{const c=e.target.closest('.card');if(!c)return;const id=c.dataset.id,n=rows.find(x=>x.id===id);if(n){n.read=true;saveCache();render()}try{await post({action:'markNotificationRead',notificationId:id,userId})}catch(e){if(n){n.read=false;saveCache();render()}}});
readAll.addEventListener('click',async()=>{const v=visibleRows();if(!v.length)return;v.forEach(n=>n.read=true);saveCache();render();try{await post({action:'markAllNotificationsRead',userId})}catch(e){v.forEach(n=>n.read=false);saveCache();render()}});
})();