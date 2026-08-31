(()=>{
'use strict';
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const qs=new URLSearchParams(location.search),userId=qs.get('userId')||'';
const list=document.getElementById('list'),readAll=document.getElementById('readAll'),clearAll=document.getElementById('clearAll');
let rows=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=t=>{t=String(t||'').toLowerCase();if(t.includes('suggest'))return'Suggestion';if(t.includes('helloasso')||t.includes('membership')||t.includes('adherent'))return'Adhérents';if(t.includes('ag'))return'Assemblée générale';if(t.includes('sortie'))return'Sortie';if(t.includes('admin'))return'Administratif';return'Information'};
const icon=t=>{t=String(t||'').toLowerCase();if(t.includes('suggest'))return'💡';if(t.includes('helloasso')||t.includes('membership')||t.includes('adherent'))return'👤';if(t.includes('ag'))return'🗳️';if(t.includes('sortie'))return'🌿';return'🔔'};
const ago=v=>{const d=new Date(v),m=Math.floor((Date.now()-d.getTime())/60000);if(!Number.isFinite(m))return'';if(m<1)return"À l’instant";if(m<60)return`Il y a ${m} min`;const h=Math.floor(m/60);if(h<24)return`Il y a ${h} h`;const j=Math.floor(h/24);return j===1?'Hier':`Il y a ${j} jours`};
async function post(body){const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});const j=await r.json();if(!j?.ok)throw new Error(j?.error||'Erreur');return j}
function visibleRows(){const cutoff=Date.now()-30*86400000;return rows.filter(n=>!n.read&&(!n.createdAt||Date.parse(n.createdAt)>=cutoff))}
function render(){const v=visibleRows();window.parent.postMessage({source:'horticulture-notification-inbox',unread:v.length},location.origin);readAll.disabled=!v.length;clearAll.disabled=!v.length;if(!v.length){list.className='empty';list.innerHTML='Aucune nouvelle notification.';return}list.className='list';list.innerHTML=v.map(n=>`<div class="card" data-id="${esc(n.id)}"><div class="icon">${icon(n.type)}</div><div><b>${esc(n.title)}</b><p>${esc(n.message)}</p><div class="meta">${esc(label(n.type))} · ${esc(ago(n.createdAt))}</div></div></div>`).join('')}
async function load(){if(!userId){list.className='error';list.textContent='Utilisateur non identifié.';return}try{const r=await fetch(`${API}?action=listNotifications&userId=${encodeURIComponent(userId)}&t=${Date.now()}`,{cache:'no-store'}),j=await r.json();if(!j?.ok)throw new Error(j?.error||'Lecture impossible');rows=Array.isArray(j.notifications)?j.notifications:[];render()}catch(e){list.className='error';list.textContent='Impossible de charger les notifications.'}}
list.addEventListener('click',async e=>{const c=e.target.closest('.card');if(!c)return;const id=c.dataset.id;c.style.opacity='.45';try{await post({action:'markNotificationRead',notificationId:id,userId});const n=rows.find(x=>x.id===id);if(n)n.read=true;render()}catch(e){c.style.opacity='1'}});
readAll.addEventListener('click',async()=>{const v=visibleRows();if(!v.length)return;readAll.disabled=true;try{await Promise.all(v.map(n=>post({action:'markNotificationRead',notificationId:n.id,userId})));v.forEach(n=>n.read=true);render()}catch(e){readAll.disabled=false}});
clearAll.addEventListener('click',async()=>{clearAll.disabled=true;try{await post({action:'markAllNotificationsRead',userId});rows.forEach(n=>n.read=true);render()}catch(e){clearAll.disabled=false}});
load();
})();