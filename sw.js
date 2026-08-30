const VERSION='v101-clean-ag-runtime';

self.addEventListener('install',()=>{self.skipWaiting();});

self.addEventListener('activate',e=>{
  e.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const data=e.notification.data||{},target=data.url||'./';
  e.waitUntil((async()=>{
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of list){
      if('focus' in c){
        await c.focus();
        try{c.postMessage({type:'horticulture-notification-click',data});}catch(_){}
        return;
      }
    }
    if(self.clients.openWindow)return self.clients.openWindow(target);
  })());
});

self.addEventListener('message',e=>{
  const m=e.data||{};
  if(m.type!=='horticulture-show-notification')return;
  const n=m.notification||{};
  e.waitUntil(self.registration.showNotification(n.title||'Administration — Horticulture',{
    body:n.message||'',
    icon:'./app-icon-botanical-v4.png',
    badge:'./app-icon-192.png',
    tag:n.tag||('horticulture-'+String(n.id||Date.now())),
    renotify:false,
    data:{url:'./',type:n.type||'info',notificationId:n.id||'',suggestionId:n.suggestionId||''}
  }));
});

// Pas de cache applicatif ni d'injection JavaScript ici : les modules sont chargés
// directement depuis leur fichier GitHub Pages afin d'éviter les versions différentes
// entre Super Admin et les autres comptes.