(()=>{
'use strict';
if(window.__horticultureSortiesAutoUiV1)return;
window.__horticultureSortiesAutoUiV1=true;
const syncIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7h-5V2M4 17h5v5M19 9a7 7 0 0 0-12-3L4 9M5 15a7 7 0 0 0 12 3l3-3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function relativeDate(v){if(!v)return'';const d=new Date(v);if(Number.isNaN(d.getTime()))return'';const m=Math.max(0,Math.round((Date.now()-d.getTime())/60000));if(m<1)return'à l’instant';if(m<60)return'il y a '+m+' min';const h=Math.round(m/60);if(h<24)return'il y a '+h+' h';return d.toLocaleDateString('fr-FR')}
function polish(){
  const v=document.getElementById('sortiesAdmin');if(!v)return;
  const b=v.querySelector('[data-sync]');if(b){
    const info=window.HorticultureSortiesSharedInfo||{};
    b.removeAttribute('data-sync');b.disabled=true;b.style.cursor='default';b.style.opacity='1';
    b.innerHTML=syncIcon+'<span>HelloAsso · automatique'+(info.lastHelloAssoSync?' · '+relativeDate(info.lastHelloAssoSync):'')+'</span>';
    b.title=info.connected?'Synchronisation HelloAsso automatique toutes les 5 minutes':'La base commune doit encore être activée côté serveur';
  }
}
window.addEventListener('horticulture-sorties-shared-updated',()=>{window.HorticultureSorties?.refresh?.();setTimeout(polish,30)});
document.addEventListener('click',e=>{if(e.target.closest?.('[data-permission="sorties"]'))setTimeout(polish,80)},true);
new MutationObserver(polish).observe(document.body,{childList:true,subtree:true});
setTimeout(polish,100);
})();
