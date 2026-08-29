const VERSION='v72-persistent-notification-badge';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));await self.clients.claim();})());});

self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const data=e.notification.data||{};
  const target=data.url||'./';
  e.waitUntil((async()=>{
    const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    for(const c of list){
      if('focus' in c){
        await c.focus();
        try{c.postMessage({type:'horticulture-notification-click',data});}catch(_){}
        return;
      }
    }
    if(self.clients.openWindow) return self.clients.openWindow(target);
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

self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const u=new URL(e.request.url);
  const isNav=e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/horticulture-app/');
  if(!isNav){e.respondWith(fetch(e.request,{cache:'no-store'}));return;}
  e.respondWith((async()=>{
    const r=await fetch(e.request,{cache:'no-store'});
    let text=await r.text();
    ['shared-sync','permanent-delete','access-status-direct','access-live-sync','permission-ui','profile-personalization','account-ui','home-permissions-fix','permissions-cloud-sync','settings-v1','notification-onboarding','profile-v1','profile-restore','account-recovery-v1','access-route-fix','security-alerts-v1','sessions-v1','sessions-ui-v1','notification-center-v1','suggestions-v1','suggestions-season-v1','suggestions-click-fix','suggestions-navigation-v1','drawer-icons-v1','ag-module-tile-v1','ag-access-display-fix','dashboard-v1','dashboard-tune','dashboard-fixes-v2','dashboard-plant-fix','plant-render-fix'].forEach(n=>{text=text.replace(new RegExp('<script src="\\./?'+n+'\\.js[^>]*><\\/script>','g'),'')});
    text=text.replace('</head>','<script src="./shared-sync.js?v=12"></script></head>');
    text=text.replace('</body>','<script src="./dashboard-v1.js?v=4"></script><script src="./dashboard-tune.js?v=2"></script><script src="./dashboard-fixes-v2.js?v=3"></script><script src="./dashboard-plant-fix.js?v=3"></script><script src="./plant-render-fix.js?v=3"></script><script src="./permanent-delete.js?v=5"></script><script src="./access-status-direct.js?v=5"></script><script src="./access-live-sync.js?v=3"></script><script src="./permission-ui.js?v=3"></script><script src="./account-ui.js?v=4"></script><script src="./home-permissions-fix.js?v=3"></script><script src="./permissions-cloud-sync.js?v=1"></script><script src="./settings-v1.js?v=8"></script><script src="./notification-onboarding.js?v=1"></script><script src="./profile-v1.js?v=2"></script><script src="./profile-restore.js?v=1"></script><script src="./account-recovery-v1.js?v=3"></script><script src="./access-route-fix.js?v=2"></script><script src="./sessions-v1.js?v=2"></script><script src="./sessions-ui-v1.js?v=1"></script><script src="./security-alerts-v1.js?v=8"></script><script src="./notification-center-v1.js?v=5"></script><script src="./suggestions-v1.js?v=5"></script><script src="./suggestions-season-v1.js?v=1"></script><script src="./suggestions-click-fix.js?v=3"></script><script src="./suggestions-navigation-v1.js?v=4"></script><script src="./drawer-icons-v1.js?v=2"></script><script src="./ag-module-tile-v1.js?v=1"></script><script src="./ag-access-display-fix.js?v=1"></script></body>');
    return new Response(text,{status:r.status,statusText:r.statusText,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store, no-cache, must-revalidate'}});
  })().catch(()=>fetch(e.request,{cache:'reload'})));
});