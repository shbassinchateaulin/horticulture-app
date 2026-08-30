const VERSION='v98-ag-menu-hotfix';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('notificationclick',e=>{e.notification.close();const data=e.notification.data||{},target=data.url||'./';e.waitUntil((async()=>{const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of list){if('focus' in c){await c.focus();try{c.postMessage({type:'horticulture-notification-click',data});}catch(_){}return;}}if(self.clients.openWindow)return self.clients.openWindow(target)})())});
self.addEventListener('message',e=>{const m=e.data||{};if(m.type!=='horticulture-show-notification')return;const n=m.notification||{};e.waitUntil(self.registration.showNotification(n.title||'Administration — Horticulture',{body:n.message||'',icon:'./app-icon-botanical-v4.png',badge:'./app-icon-192.png',tag:n.tag||('horticulture-'+String(n.id||Date.now())),renotify:false,data:{url:'./',type:n.type||'info',notificationId:n.id||'',suggestionId:n.suggestionId||''}}))});

// Hotfix Consultation AG : intercepte uniquement le module AG et ajoute un gestionnaire
// de secours en phase capture. Cela rend le menu ••• fiable même après les
// rerendus automatiques provoqués par la synchronisation serveur.
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(!u.pathname.endsWith('/ag-consultation-v1.js'))return;
  e.respondWith((async()=>{
    const r=await fetch(e.request,{cache:'no-store'});
    const source=await r.text();
    const hotfix=`\n;(()=>{\n'use strict';\nif(window.__agRowMenuCaptureFix)return;window.__agRowMenuCaptureFix=true;\nconst closeAll=()=>document.querySelectorAll('#agConsultation [data-row-pop]').forEach(p=>{p.hidden=true;p.style.display='none';});\ndocument.addEventListener('click',e=>{\n  const btn=e.target.closest?.('#agConsultation [data-row-menu]');\n  if(btn){\n    e.preventDefault();e.stopImmediatePropagation();\n    const wrap=btn.closest('.agRowMenuWrap'),pop=wrap?.querySelector('[data-row-pop]');\n    if(!pop)return;\n    const open=pop.hidden||getComputedStyle(pop).display==='none';\n    closeAll();\n    if(open){\n      pop.hidden=false;pop.style.display='block';pop.style.zIndex='99999';\n      if(wrap)wrap.style.overflow='visible';\n      const actions=wrap?.closest('.agRowActions');if(actions)actions.style.overflow='visible';\n      const row=wrap?.closest('.agListRow');if(row){row.style.overflow='visible';row.style.zIndex='50';row.style.position='relative';}\n    }\n    return;\n  }\n  if(!e.target.closest?.('#agConsultation [data-row-pop]'))closeAll();\n},true);\n})();\n`;
    return new Response(source+hotfix,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
  })());
});