(()=>{
'use strict';
if(window.__agMainPrintFixV1)return;window.__agMainPrintFixV1=true;
const STORE='horticulture-ag-pro-v2',ROUTE='horticulture-ag-route-v3';
function route(){try{return JSON.parse(localStorage.getItem(ROUTE)||'null')}catch{return null}}
function campaign(id){try{const raw=JSON.parse(localStorage.getItem(STORE)||'{"campaigns":[]}'),rows=Array.isArray(raw)?raw:(raw.campaigns||[]);return rows.find(c=>String(c?.id)===String(id))||null}catch{return null}}
function archive(){try{const p=window.HorticultureDocumentsCloud?.archiveAgPrint?.();if(p?.catch)p.catch(err=>console.warn('Archivage bouton principal AG',err))}catch(err){console.warn('Archivage bouton principal AG',err)}}
function printQuestionnaire(c){
  archive();
  if(window.HorticultureAGQuestionnairePrint?.print){window.HorticultureAGQuestionnairePrint.print(c);return}
  window.print();
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#agConsultation .agBanner [data-print]');
  if(!b)return;
  const r=route();
  if(r?.screen!=='campaign'||!r.id)return;
  const c=campaign(r.id);
  if(!c)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  printQuestionnaire(c);
},true);
})();