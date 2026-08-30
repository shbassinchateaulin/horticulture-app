const VERSION='v103-ag-fresh-modules';

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

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  const isAG=u.pathname.endsWith('/ag-consultation-v1.js');
  const isAGTile=u.pathname.endsWith('/ag-module-tile-v1.js');
  if(!isAG&&!isAGTile)return;

  e.respondWith((async()=>{
    const r=await fetch(e.request,{cache:'no-store'});
    if(isAGTile){
      return new Response(await r.text(),{
        status:r.status,statusText:r.statusText,
        headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store, max-age=0'}
      });
    }

    let source=await r.text();

    // Enregistrement natif du concepteur : local immédiat, puis Sheets en arrière-plan.
    source=source.replace(
      /  async function persist\(\)\{[\s\S]*?\n  \}\n  \$\('\[data-back\]'/,
`  let persistBusy=false;
  function persist(){
    if(persistBusy)return;
    syncHeader();
    draft.status=$('[data-status]',root()).value;
    draft.title=draft.title.trim()||'Questionnaire Assemblée générale';
    draft.sections.forEach(s=>{s.title=(s.title||'Section').trim()||'Section';s.questions=(s.questions||[]).filter(q=>(q.label||'').trim())});
    if(!allQuestions(draft).length)return alert('Ajoute au moins une question.');
    persistBusy=true;
    $$('[data-save],[data-save-bottom]',root()).forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');b.textContent='Enregistré ✓'});
    audit(draft,'Enregistrement du questionnaire',allQuestions(draft).length+' question(s)');
    const saved=JSON.parse(JSON.stringify(draft));
    const id=saved.id;
    saveCampaign(saved,false);
    activeId=id;
    clearDraft();
    draft=null;
    campaign(activeId,'overview');
    setTimeout(()=>{agPushCampaign_(saved).catch(e=>console.warn('Synchronisation Google Sheets en arrière-plan',e))},0);
  }
  $('[data-back]'`
    );

    // Une ancienne route AG ne doit jamais être restaurée automatiquement après refresh.
    source=source.replace("setTimeout(()=>scheduleRouteRestore(),450);","clearRoute();setAGActive_(false);");
    source=source.replace(
      "window.addEventListener('pageshow',()=>{setTimeout(()=>scheduleRouteRestore(),120);setTimeout(agWarmShared_,500)});",
      "window.addEventListener('pageshow',()=>{clearRoute();setAGActive_(false);setTimeout(agWarmShared_,500)});"
    );
    source=source.replace(
      "  setTimeout(()=>scheduleRouteRestore(),80);\n  if(screen==='home'&&document.body.classList.contains('agWorkspaceMode'))",
      "  clearRoute();setAGActive_(false);\n  if(screen==='home'&&document.body.classList.contains('agWorkspaceMode'))"
    );
    source=source.replaceAll("$('.view').forEach(v=>v.classList.remove('active'));","$$('.view').forEach(v=>v.classList.remove('active'));");

    return new Response(source,{
      status:r.status,statusText:r.statusText,
      headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store, max-age=0'}
    });
  })());
});