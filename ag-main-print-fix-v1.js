(()=>{
'use strict';
if(window.__agMainPrintFixV2)return;window.__agMainPrintFixV2=true;
const STORE='horticulture-ag-pro-v2',ROUTE='horticulture-ag-route-v3';
function route(){try{return JSON.parse(localStorage.getItem(ROUTE)||'null')}catch{return null}}
function campaign(id){try{const raw=JSON.parse(localStorage.getItem(STORE)||'{"campaigns":[]}'),rows=Array.isArray(raw)?raw:(raw.campaigns||[]);return rows.find(c=>String(c?.id)===String(id))||null}catch{return null}}
function toast(text,bad=false){let x=document.getElementById('agPrintStatusV2');if(!x){x=document.createElement('div');x.id='agPrintStatusV2';Object.assign(x.style,{position:'fixed',left:'16px',right:'16px',bottom:'92px',zIndex:'99999',padding:'12px 14px',borderRadius:'12px',fontWeight:'800',fontSize:'13px',textAlign:'center',boxShadow:'0 10px 30px #0002'});document.body.appendChild(x)}x.style.background=bad?'#fff1f1':'#ecf8f1';x.style.color=bad?'#a52323':'#07583f';x.textContent=text;clearTimeout(x._t);x._t=setTimeout(()=>x.remove(),3500)}
function archive(){try{const cloud=window.HorticultureDocumentsCloud;if(!cloud?.archiveAgPrint){toast('Impression ouverte — archivage Cloud indisponible',true);return}const p=cloud.archiveAgPrint();if(p?.then)p.then(()=>toast('Document classé dans Documents Cloud')).catch(err=>{console.warn('Archivage bouton principal AG',err);toast('Impression ouverte — archivage Cloud impossible',true)})}catch(err){console.warn('Archivage bouton principal AG',err);toast('Impression ouverte — archivage Cloud impossible',true)}}
function printQuestionnaire(c){archive();try{if(window.HorticultureAGQuestionnairePrint?.print){window.HorticultureAGQuestionnairePrint.print(c);return}window.print()}catch(err){console.error('Impression bouton principal AG',err);toast('Impossible d’ouvrir l’impression',true)}}
window.addEventListener('click',e=>{
  const b=e.target.closest?.('#agConsultation .agBanner [data-print]');
  if(!b)return;
  const r=route();
  const id=r?.id||b.closest('#agConsultation')?.dataset?.campaignId;
  const c=id?campaign(id):null;
  if(!c){toast('Questionnaire introuvable',true);return}
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  printQuestionnaire(c);
},true);
})();