(()=>{
'use strict';
const PERM='consultation_ag';
const AG_ROUTE='horticulture-ag-route-v3';
const AG_ACTIVE='horticulture-ag-active-v1';
const AG_DRAFT='horticulture-ag-pro-draft-v2';
const agIcon=`<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h3M8 12h3M8 16h3M14 8h2M14 12h2M14 16h2"/><path d="m8 8 .8.8L10.5 7"/></svg>`;
let lastOpen=0,pendingSaveOpen='';

function clearAGRoute_(){
 try{sessionStorage.removeItem(AG_ACTIVE)}catch(_){}
 try{localStorage.removeItem(AG_ROUTE)}catch(_){}
}
function resetAGVisualState_(clearRoute=false){
 document.body.classList.remove('agWorkspaceMode');
 document.getElementById('agConsultation')?.classList.remove('active');
 if(clearRoute)clearAGRoute_();
}

// Un rafraîchissement doit repartir de l'Administration normale.
resetAGVisualState_(true);

function runAG_(){
 document.getElementById('drawer')?.classList.remove('open');
 resetAGVisualState_(true);
 try{
   if(typeof window.HorticultureAG?.open==='function'){
     window.HorticultureAG.open();
     return true;
   }
 }catch(err){console.error('Ouverture Consultation AG',err)}
 return false;
}
function openAG(e){
 if(e){e.preventDefault();e.stopPropagation()}
 const t=Date.now();if(t-lastOpen<350)return;lastOpen=t;
 if(runAG_())return;
 [60,180,420].forEach(ms=>setTimeout(()=>{
   if(!document.getElementById('agConsultation')?.classList.contains('active'))runAG_();
 },ms));
}
function isAGControl_(target){
 return target?.closest?.('[data-module="consultation-ag"],[data-permission="consultation_ag"]')||null;
}
function captureAG_(e){
 const b=isAGControl_(e.target);if(!b)return;
 e.preventDefault();e.stopPropagation();
 if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
 openAG();
}
function wire(b){
 if(!b||b.dataset.agMobileOpen==='1')return;
 b.dataset.agMobileOpen='1';
 b.type='button';
 b.style.touchAction='manipulation';
 b.onclick=openAG;
}

function draftId_(){
 try{return String(JSON.parse(localStorage.getItem(AG_DRAFT)||'null')?.id||'')}
 catch{return ''}
}
function openSavedOverview_(id){
 if(!id||pendingSaveOpen!==id)return false;
 const fn=window.HorticultureAG?.openCampaign;
 if(typeof fn!=='function')return false;
 try{
   fn(id,'overview');
   pendingSaveOpen='';
   return true;
 }catch(err){
   console.error('Ouverture automatique du questionnaire enregistré',err);
   return false;
 }
}

// Le clic Enregistrer laisse le module AG effectuer sa sauvegarde normalement.
// Ensuite on ouvre directement la fiche du questionnaire, sans repasser par
// la liste (où un brouillon déclenche volontairement « Continuer » -> concepteur).
document.addEventListener('click',e=>{
 const save=e.target.closest?.('#agConsultation [data-save],#agConsultation [data-save-bottom]');
 if(!save||!document.querySelector('#agConsultation [data-sections]'))return;
 let id=draftId_();
 const tryOpen=()=>{
   id=id||draftId_();
   if(!id)return false;
   pendingSaveOpen=id;
   return openSavedOverview_(id);
 };
 [35,100,220,450,800].forEach(ms=>setTimeout(tryOpen,ms));
},true);

// Tout retour vers Accueil / logo nettoie complètement l'ancien état AG.
document.addEventListener('click',e=>{
 const home=e.target.closest?.('[data-go="home"],.admBrand,.admBrand img,.top b,.welcome img,.dhead img');
 if(!home)return;
 pendingSaveOpen='';
 resetAGVisualState_(true);
},true);

window.addEventListener('touchend',captureAG_,{capture:true,passive:false});
window.addEventListener('click',captureAG_,true);

function add(){
 const grid=document.querySelector('#home .dashGrid');
 if(grid&&!grid.querySelector('[data-permission="'+PERM+'"]')){
  const b=document.createElement('button');
  b.className='dashTile';b.dataset.permission=PERM;b.dataset.module='consultation-ag';
  b.innerHTML=`<span class="dashIcon">${agIcon}</span><b>Consultation AG</b><small>Questionnaires, collecte<br>et dépouillement automatique</small>`;
  wire(b);grid.insertBefore(b,grid.querySelector('#dashAccess')||null);
 }
 const list=document.querySelector('.dlist');
 if(list&&!list.querySelector('[data-permission="'+PERM+'"]')){
  const b=document.createElement('button');
  b.dataset.permission=PERM;b.dataset.module='consultation-ag';
  b.innerHTML=`<span class="drawerI">${agIcon}</span><span>Consultation AG</span>`;
  wire(b);
  const access=[...list.querySelectorAll('button')].find(x=>(x.textContent||'').toLowerCase().includes('gestion des accès')||(x.textContent||'').toLowerCase().includes('gestion des acces'));
  list.insertBefore(b,access||null);
 }
 grid?.querySelectorAll('[data-module="consultation-ag"],[data-permission="consultation_ag"]').forEach(wire);
 document.querySelectorAll('.dlist [data-module="consultation-ag"],.dlist [data-permission="consultation_ag"]').forEach(wire);
}
add();setTimeout(add,250);setTimeout(add,800);
window.addEventListener('pageshow',()=>{pendingSaveOpen='';resetAGVisualState_(true);add()});
window.addEventListener('horticulture-users-synced',add);
})();