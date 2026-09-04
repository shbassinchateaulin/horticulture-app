(()=>{
'use strict';
if(window.__agIosPrintV3)return;window.__agIosPrintV3=true;
const STORE='horticulture-ag-pro-v2',ROUTE='horticulture-ag-route-v3';
const ios=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function route(){try{return JSON.parse(localStorage.getItem(ROUTE)||'null')}catch{return null}}
function campaign(id){try{const raw=JSON.parse(localStorage.getItem(STORE)||'{"campaigns":[]}'),rows=Array.isArray(raw)?raw:(raw.campaigns||[]);return rows.find(c=>String(c?.id)===String(id))||null}catch{return null}}
function kind(){return document.querySelector('#agConsultation .agTab.active')?.dataset.tab==='results'?'summary':'questionnaire'}
function archive(){try{const p=window.HorticultureDocumentsCloud?.archiveAgPrint?.();if(p?.catch)p.catch(err=>console.warn('Archivage AG iOS',err))}catch(err){console.warn('Archivage AG iOS',err)}}
function run(c,k){archive();if(k==='summary'&&window.HorticultureAGSynthesisPrint?.print){window.HorticultureAGSynthesisPrint.print(c);return}if(k==='questionnaire'&&window.HorticultureAGQuestionnairePrint?.print){window.HorticultureAGQuestionnairePrint.print(c);return}window.print()}
document.addEventListener('click',e=>{if(!ios())return;const b=e.target.closest?.('#agConsultation [data-print]');if(!b)return;const r=route(),c=r?.id?campaign(r.id):null;if(!c)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();run(c,kind())},true);
})();