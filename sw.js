const VERSION='v114-ag-route-transmission-fix';

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
    for(const c of list){if('focus' in c){await c.focus();try{c.postMessage({type:'horticulture-notification-click',data});}catch(_){}return;}}
    if(self.clients.openWindow)return self.clients.openWindow(target);
  })());
});

self.addEventListener('message',e=>{
  const m=e.data||{};if(m.type!=='horticulture-show-notification')return;
  const n=m.notification||{};
  e.waitUntil(self.registration.showNotification(n.title||'Administration — Horticulture',{
    body:n.message||'',icon:'./app-icon-botanical-v4.png',badge:'./app-icon-192.png',tag:n.tag||('horticulture-'+String(n.id||Date.now())),renotify:false,
    data:{url:'./',type:n.type||'info',notificationId:n.id||'',suggestionId:n.suggestionId||''}
  }));
});

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url),isAG=u.pathname.endsWith('/ag-consultation-v1.js'),isAGTile=u.pathname.endsWith('/ag-module-tile-v1.js');
  if(!isAG&&!isAGTile)return;
  e.respondWith((async()=>{
    const r=await fetch(e.request,{cache:'no-store'});
    if(isAGTile)return new Response(await r.text(),{status:r.status,statusText:r.statusText,headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
    let source=await r.text();

    source=source.replace(/  async function persist\(\)\{[\s\S]*?\n  \}\n  \$\('\[data-back\]'/,`  let persistBusy=false;
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
    const saved=JSON.parse(JSON.stringify(draft)),id=saved.id;
    saveCampaign(saved,false);activeId=id;clearDraft();draft=null;campaign(id,'overview');
    setTimeout(()=>{agPushCampaign_(saved).catch(e=>console.warn('Synchronisation Google Sheets en arrière-plan',e))},0);
  }
  $('[data-back]'`);

    // Conserver la route Consultation AG au rafraîchissement. Le code natif restaure
    // le questionnaire et l'onglet tant que la session AG est toujours active.
    source=source.replaceAll("$('.view').forEach(v=>v.classList.remove('active'));","$$('.view').forEach(v=>v.classList.remove('active'));");

    // Transmission fait partie du rendu natif de la fiche.
    source=source.replace(
      "    '<button class=\"agBtn\" data-print>Imprimer</button></div></div>'+",
      "    '<button class=\"agBtn agTransmitPrimary\" data-ag-transmit-primary>Transmettre aux adhérents</button><button class=\"agBtn\" data-print>Imprimer</button></div></div>'+"
    );
    source=source.replace(
      "      '<button class=\"agTab '+(tab==='settings'?'active':'')+'\" data-tab=\"settings\">Paramètres</button>'+",
      "      '<button class=\"agTab '+(tab==='settings'?'active':'')+'\" data-tab=\"settings\">Paramètres</button><button class=\"agTab '+(tab==='transmission'?'active':'')+'\" data-ag-dist>Transmission</button>'+"
    );

    // Les deux accès Transmission appellent directement le module, avec une petite
    // attente si son fichier termine juste de se charger.
    source=source.replace(
      "  $$('[data-tab]',root()).forEach(b=>b.onclick=()=>campaign(id,b.dataset.tab));",
      `  $$('[data-tab]',root()).forEach(b=>b.onclick=()=>campaign(id,b.dataset.tab));
  const openTransmission_=()=>{
    saveRoute({screen:'campaign',id,tab:'transmission'});
    const run=(tries=0)=>{
      if(window.HorticultureAGTransmission?.open){window.HorticultureAGTransmission.open(id);return}
      if(tries<20)setTimeout(()=>run(tries+1),50);
    };
    run();
  };
  $('[data-ag-transmit-primary]',root())?.addEventListener('click',openTransmission_);
  $('[data-ag-dist]',root())?.addEventListener('click',openTransmission_);`
    );

    // Une route restaurée sur Transmission ne doit pas tomber dans Paramètres.
    source=source.replace(
      "  if(tab==='overview')overview(c);else if(tab==='collect')collect(c);else if(tab==='responses')responses(c);else if(tab==='results')results(c);else settings(c);",
      `  if(tab==='overview')overview(c);else if(tab==='collect')collect(c);else if(tab==='responses')responses(c);else if(tab==='results')results(c);else if(tab==='transmission'){
    $('[data-content]',root()).innerHTML='<div class="agPanel"><h3>Transmission aux adhérents</h3><div class="agMeta">Chargement…</div></div>';
    setTimeout(()=>window.HorticultureAGTransmission?.open?.(id),0);
  }else settings(c);`
    );

    source=source.replace("window.HorticultureAG={open:openAGSafe_,new:newWizard,version:APP_VERSION,syncVersion:31};","window.HorticultureAG={open:openAGSafe_,new:newWizard,openCampaign:(id,tab='overview')=>campaign(id,tab),version:APP_VERSION,syncVersion:35};");

    source+=`\n;(()=>{if(!document.getElementById('agTransmissionNative')){const s=document.createElement('script');s.id='agTransmissionNative';s.src='./ag-transmission-native.js?v=2';s.async=true;document.head.appendChild(s)}if(!document.getElementById('agResultsPolish')){const p=document.createElement('script');p.id='agResultsPolish';p.src='./ag-results-polish.js?v=1';p.async=true;document.head.appendChild(p)}})();`;

    return new Response(source,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
  })());
});