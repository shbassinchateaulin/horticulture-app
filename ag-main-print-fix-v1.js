(()=>{
'use strict';
if(window.__agMainPrintFixV5)return;window.__agMainPrintFixV5=true;
const STORE='horticulture-ag-pro-v2',ROUTE='horticulture-ag-route-v3';
const ios=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
function route(){try{return JSON.parse(localStorage.getItem(ROUTE)||'null')}catch{return null}}
function campaign(id){try{const raw=JSON.parse(localStorage.getItem(STORE)||'{"campaigns":[]}'),rows=Array.isArray(raw)?raw:(raw.campaigns||[]);return rows.find(c=>String(c?.id)===String(id))||null}catch{return null}}
function toast(text,bad=false){let x=document.getElementById('agPrintStatusV5');if(!x){x=document.createElement('div');x.id='agPrintStatusV5';Object.assign(x.style,{position:'fixed',left:'16px',right:'16px',bottom:'92px',zIndex:'100002',padding:'12px 14px',borderRadius:'12px',fontWeight:'800',fontSize:'13px',textAlign:'center',boxShadow:'0 10px 30px #0002'});document.body.appendChild(x)}x.style.background=bad?'#fff1f1':'#ecf8f1';x.style.color=bad?'#a52323':'#07583f';x.textContent=text;clearTimeout(x._t);x._t=setTimeout(()=>x.remove(),5000)}
function archive(){try{const p=window.HorticultureDocumentsCloud?.archiveAgPrint?.();if(p?.catch)p.catch(err=>console.warn('Archivage AG',err))}catch(err){console.warn('Archivage AG',err)}}
function run(c){archive();if(window.HorticultureAGQuestionnairePrint?.print){window.HorticultureAGQuestionnairePrint.print(c);return}window.print()}
window.addEventListener('click',e=>{
  const b=e.target.closest?.('#agConsultation .agBanner [data-print]');
  if(!b)return;
  /* Sur iPhone/iPad on ne bloque plus le clic ici : ag-ios-print-v1.js gère
     tous les boutons Imprimer et ouvre la feuille native Partager avec le PDF. */
  if(ios())return;
  const r=route(),c=r?.id?campaign(r.id):null;
  if(!c){toast('Questionnaire introuvable',true);return}
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();run(c);
},true);
})();