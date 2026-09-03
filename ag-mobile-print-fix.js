(()=>{
'use strict';
if(window.__agMobilePrintCompatV2)return;window.__agMobilePrintCompatV2=true;
const STORE='horticulture-ag-pro-v2',ROUTE='horticulture-ag-route-v3';
function standalone(){return !!(window.matchMedia?.('(display-mode: standalone)')?.matches||window.navigator.standalone===true)}
function route(){try{return JSON.parse(localStorage.getItem(ROUTE)||'null')}catch{return null}}
function campaign(id){try{const raw=JSON.parse(localStorage.getItem(STORE)||'{"campaigns":[]}'),rows=Array.isArray(raw)?raw:(raw.campaigns||[]);return rows.find(c=>String(c?.id)===String(id))||null}catch{return null}}
function activeTab(){return document.querySelector('#agConsultation .agTab.active')?.dataset.tab||''}
function fallback(c){try{if(activeTab()==='results'&&window.HorticultureAGSynthesisPrint?.print)return window.HorticultureAGSynthesisPrint.print(c);if(window.HorticultureAGQuestionnairePrint?.print)return window.HorticultureAGQuestionnairePrint.print(c);window.print()}catch(e){console.error('Impression AG',e)}}
/*
 * IMPORTANT iOS/PWA:
 * l'ancienne version interceptait le clic en phase capture puis préparait un PDF
 * de façon asynchrone. Une PWA iOS peut alors bloquer le partage/impression.
 * En mode standalone ce fichier ne capture donc PLUS le clic : ag-ios-print-v1.js
 * est l'unique gestionnaire de l'impression PWA.
 */
document.addEventListener('click',e=>{
  if(standalone())return;
  const btn=e.target.closest?.('#agConsultation [data-print]');if(!btn)return;
  const r=route();if(r?.screen!=='campaign'||!r.id)return;
  const c=campaign(r.id);if(!c)return;
  // Hors PWA, on laisse d'abord les gestionnaires dédiés questionnaire/synthèse agir.
  // Ce fallback n'empêche jamais leur propagation.
  setTimeout(()=>{if(!e.defaultPrevented)fallback(c)},0);
},false);
window.HorticultureAGMobilePrint={print:fallback,isStandalone:standalone};
})();