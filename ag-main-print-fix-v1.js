(()=>{
'use strict';
if(window.__agMainPrintFixV6)return;window.__agMainPrintFixV6=true;
const STORE='horticulture-ag-pro-v2',ROUTE='horticulture-ag-route-v3';
const ios=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function route(){try{return JSON.parse(localStorage.getItem(ROUTE)||'null')}catch{return null}}
function campaign(id){try{const raw=JSON.parse(localStorage.getItem(STORE)||'{"campaigns":[]}'),rows=Array.isArray(raw)?raw:(raw.campaigns||[]);return rows.find(c=>String(c?.id)===String(id))||null}catch{return null}}
function toast(text,bad=false){let x=document.getElementById('agPrintStatusV6');if(!x){x=document.createElement('div');x.id='agPrintStatusV6';Object.assign(x.style,{position:'fixed',left:'16px',right:'16px',bottom:'92px',zIndex:'100002',padding:'12px 14px',borderRadius:'12px',fontWeight:'800',fontSize:'13px',textAlign:'center',boxShadow:'0 10px 30px #0002'});document.body.appendChild(x)}x.style.background=bad?'#fff1f1':'#ecf8f1';x.style.color=bad?'#a52323':'#07583f';x.textContent=text;clearTimeout(x._t);x._t=setTimeout(()=>x.remove(),4200)}
function waitCloud(){return new Promise((resolve,reject)=>{if(window.HorticultureDocumentsCloud?.archiveAgPrint)return resolve(window.HorticultureDocumentsCloud);let s=document.getElementById('agPrintCloudLoaderV6');if(!s){s=document.createElement('script');s.id='agPrintCloudLoaderV6';s.src='./documents-cloud-archive-v1.js?v=8';s.async=false;s.onload=()=>window.HorticultureDocumentsCloud?.archiveAgPrint?resolve(window.HorticultureDocumentsCloud):reject(Error('Module Cloud indisponible'));s.onerror=()=>reject(Error('Module Cloud indisponible'));document.head.appendChild(s)}else{let n=0;const t=setInterval(()=>{n++;if(window.HorticultureDocumentsCloud?.archiveAgPrint){clearInterval(t);resolve(window.HorticultureDocumentsCloud)}else if(n>30){clearInterval(t);reject(Error('Module Cloud indisponible'))}},50)}})}
async function archiveFirst(){const cloud=await waitCloud();toast('Enregistrement dans le Cloud…');const doc=await cloud.archiveAgPrint();try{await cloud.sync?.()}catch(_){}toast('Document enregistré dans le Cloud');return doc}
async function printAfterArchive(c){await archiveFirst();const tab=document.querySelector('#agConsultation .agTab.active')?.dataset.tab||'';if(tab==='results'&&window.HorticultureAGSynthesisPrint?.print){window.HorticultureAGSynthesisPrint.print(c);return}if(window.HorticultureAGQuestionnairePrint?.print){window.HorticultureAGQuestionnairePrint.print(c);return}window.print()}
window.addEventListener('click',async e=>{
  const b=e.target.closest?.('#agConsultation [data-print]');if(!b)return;
  /* Sur iPhone/iPad, le générateur PDF mobile archive lui-même le PDF exact avant la feuille Partager. */
  if(ios())return;
  const r=route(),c=r?.id?campaign(r.id):null;
  if(!c){toast('Questionnaire introuvable',true);return}
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  b.disabled=true;
  try{await printAfterArchive(c)}catch(err){console.error('Archivage avant impression AG',err);toast('Échec de l’enregistrement Cloud : '+(err?.message||'erreur inconnue'),true)}finally{b.disabled=false}
},true);
window.HorticultureAGMainPrint=printAfterArchive;
})();