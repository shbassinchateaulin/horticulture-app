const VERSION='v99-ag-instant-save';
self.addEventListener('install',e=>{self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('notificationclick',e=>{e.notification.close();const data=e.notification.data||{},target=data.url||'./';e.waitUntil((async()=>{const list=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const c of list){if('focus' in c){await c.focus();try{c.postMessage({type:'horticulture-notification-click',data});}catch(_){}return;}}if(self.clients.openWindow)return self.clients.openWindow(target)})())});
self.addEventListener('message',e=>{const m=e.data||{};if(m.type!=='horticulture-show-notification')return;const n=m.notification||{};e.waitUntil(self.registration.showNotification(n.title||'Administration — Horticulture',{body:n.message||'',icon:'./app-icon-botanical-v4.png',badge:'./app-icon-192.png',tag:n.tag||('horticulture-'+String(n.id||Date.now())),renotify:false,data:{url:'./',type:n.type||'info',notificationId:n.id||'',suggestionId:n.suggestionId||''}}))});

// Consultation AG : correctifs chargés à la volée pour éviter tout blocage UI.
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(!u.pathname.endsWith('/ag-consultation-v1.js'))return;
  e.respondWith((async()=>{
    const r=await fetch(e.request,{cache:'no-store'});
    let source=await r.text();

    // Enregistrement instantané : on sauvegarde localement et on ouvre tout de suite.
    // Google Sheets est ensuite synchronisé en arrière-plan, sans bloquer l'utilisateur.
    source=source.replace(
      /  async function persist\(\)\{[\s\S]*?\n  \}\n  \$\('\[data-back\]'/,
`  let persistBusy=false;
  function persist(){
    if(persistBusy)return;
    syncHeader();
    draft.title=draft.title.trim()||'Questionnaire Assemblée générale';
    draft.sections.forEach(s=>{s.title=(s.title||'Section').trim()||'Section';s.questions=(s.questions||[]).filter(q=>(q.label||'').trim())});
    if(!allQuestions(draft).length)return alert('Ajoute au moins une question.');
    persistBusy=true;
    $$('[data-save],[data-save-bottom]',root()).forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true')});
    audit(draft,'Enregistrement du questionnaire',allQuestions(draft).length+' question(s)');
    const saved=JSON.parse(JSON.stringify(draft));
    const id=saved.id;
    saveCampaign(saved,false);
    activeId=id;
    clearDraft();
    draft=null;
    campaign(activeId,'overview');
    setTimeout(()=>{
      agPushCampaign_(saved).then(ok=>{
        if(!ok)console.warn('Questionnaire enregistré localement ; synchronisation Google Sheets à réessayer automatiquement.');
      }).catch(e=>console.warn('Synchronisation Google Sheets en arrière-plan',e));
    },0);
  }
  $('[data-back]'`
    );

    // Menu ••• fiable même après les rerendus automatiques.
    const hotfix=`\n;(()=>{\n'use strict';\nif(window.__agRowMenuCaptureFix)return;window.__agRowMenuCaptureFix=true;\nconst closeAll=()=>document.querySelectorAll('#agConsultation [data-row-pop]').forEach(p=>{p.hidden=true;p.style.display='none';});\ndocument.addEventListener('click',e=>{\n  const btn=e.target.closest?.('#agConsultation [data-row-menu]');\n  if(btn){\n    e.preventDefault();e.stopImmediatePropagation();\n    const wrap=btn.closest('.agRowMenuWrap'),pop=wrap?.querySelector('[data-row-pop]');\n    if(!pop)return;\n    const open=pop.hidden||getComputedStyle(pop).display==='none';\n    closeAll();\n    if(open){\n      pop.hidden=false;pop.style.display='block';pop.style.zIndex='99999';\n      if(wrap)wrap.style.overflow='visible';\n      const actions=wrap?.closest('.agRowActions');if(actions)actions.style.overflow='visible';\n      const row=wrap?.closest('.agListRow');if(row){row.style.overflow='visible';row.style.zIndex='50';row.style.position='relative';}\n    }\n    return;\n  }\n  if(!e.target.closest?.('#agConsultation [data-row-pop]'))closeAll();\n},true);\n})();\n`;
    return new Response(source+hotfix,{status:r.status,statusText:r.statusText,headers:{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
  })());
});