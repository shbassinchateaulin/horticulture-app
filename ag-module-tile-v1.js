(()=>{
'use strict';
const PERM='consultation_ag';
const AG_ROUTE='horticulture-ag-route-v3';
const AG_ACTIVE='horticulture-ag-active-v1';
const AG_STORE='horticulture-ag-pro-v2';
const AG_DRAFT='horticulture-ag-pro-draft-v2';
const agIcon=`<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h3M8 12h3M8 16h3M14 8h2M14 12h2M14 16h2"/><path d="m8 8 .8.8L10.5 7"/></svg>`;
let lastOpen=0,saveClickLocked=false;

function clearAGRoute_(){
 try{sessionStorage.removeItem(AG_ACTIVE)}catch(_){}
 try{localStorage.removeItem(AG_ROUTE)}catch(_){}
}
function resetAGVisualState_(clearRoute=false){
 document.body.classList.remove('agWorkspaceMode');
 document.getElementById('agConsultation')?.classList.remove('active');
 if(clearRoute)clearAGRoute_();
}
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
 [60,180,420].forEach(ms=>setTimeout(()=>{if(!document.getElementById('agConsultation')?.classList.contains('active'))runAG_()},ms));
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

function readDraft_(){
 try{return JSON.parse(localStorage.getItem(AG_DRAFT)||'null')}catch{return null}
}
function readDB_(){
 try{
   const raw=JSON.parse(localStorage.getItem(AG_STORE)||'{"version":2,"campaigns":[]}');
   return {version:2,campaigns:Array.isArray(raw)?raw:(Array.isArray(raw?.campaigns)?raw.campaigns:[])};
 }catch{return {version:2,campaigns:[]}}
}
function writeCampaignLocal_(campaign){
 const db=readDB_();
 const i=db.campaigns.findIndex(x=>String(x?.id||'')===String(campaign.id));
 campaign.updatedAt=new Date().toISOString();
 if(i<0)db.campaigns.unshift(campaign);else db.campaigns[i]=campaign;
 localStorage.setItem(AG_STORE,JSON.stringify({version:2,campaigns:db.campaigns}));
 localStorage.removeItem(AG_DRAFT);
}
function unlockSave_(){
 saveClickLocked=false;
 document.querySelectorAll('#agConsultation [data-save],#agConsultation [data-save-bottom]').forEach(b=>{
   b.disabled=false;b.removeAttribute('aria-busy');
 });
}
function captureImmediateSave_(e){
 const b=e.target.closest?.('#agConsultation [data-save],#agConsultation [data-save-bottom]');
 if(!b||!document.querySelector('#agConsultation [data-sections]'))return;
 e.preventDefault();e.stopPropagation();
 if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
 if(saveClickLocked)return;
 saveClickLocked=true;

 const draft=readDraft_();
 if(!draft?.id){unlockSave_();alert('Le brouillon du questionnaire est introuvable.');return}
 const agRoot=document.getElementById('agConsultation');
 const titleEl=agRoot?.querySelector('[data-title]');
 const yearEl=agRoot?.querySelector('[data-year]');
 const identityEl=agRoot?.querySelector('[data-identity]');
 const statusEl=agRoot?.querySelector('[data-status]');
 if(titleEl)draft.title=titleEl.value;
 if(yearEl)draft.year=yearEl.value;
 draft.settings=draft.settings||{};
 if(identityEl){draft.settings.identityMode=identityEl.value;draft.settings.anonymous=identityEl.value==='anonymous'}
 if(statusEl)draft.status=statusEl.value;

 const questions=(Array.isArray(draft.sections)?draft.sections:[]).flatMap(s=>Array.isArray(s?.questions)?s.questions:[]).filter(q=>String(q?.label||'').trim());
 if(!questions.length){unlockSave_();alert('Ajoute au moins une question.');return}

 draft.title=String(draft.title||'').trim()||'Questionnaire Assemblée générale';
 (draft.sections||[]).forEach(s=>{
   s.title=String(s.title||'').trim()||'Section';
   s.questions=(s.questions||[]).filter(q=>String(q?.label||'').trim());
 });
 draft.audit=Array.isArray(draft.audit)?draft.audit:[];
 draft.audit.unshift({id:'log-'+Date.now().toString(36),at:new Date().toISOString(),action:'Enregistrement du questionnaire',detail:questions.length+' question(s)'});
 draft.audit=draft.audit.slice(0,80);

 document.querySelectorAll('#agConsultation [data-save],#agConsultation [data-save-bottom]').forEach(x=>{
   x.disabled=true;x.setAttribute('aria-busy','true');x.textContent='Enregistré ✓';
 });

 writeCampaignLocal_(draft);
 clearAGRoute_();
 setTimeout(()=>{
   try{window.HorticultureAG?.open?.()}catch(err){console.error('Ouverture après enregistrement AG',err)}
   setTimeout(unlockSave_,800);
 },0);
}

function wire(b){
 if(!b||b.dataset.agMobileOpen==='1')return;
 b.dataset.agMobileOpen='1';b.type='button';b.style.touchAction='manipulation';b.onclick=openAG;
}

document.addEventListener('click',e=>{
 const home=e.target.closest?.('[data-go="home"],.admBrand,.admBrand img,.top b,.welcome img,.dhead img');
 if(!home)return;
 resetAGVisualState_(true);
},true);

window.addEventListener('click',captureImmediateSave_,true);
window.addEventListener('touchend',captureAG_,{capture:true,passive:false});
window.addEventListener('click',captureAG_,true);

function add(){
 const grid=document.querySelector('#home .dashGrid');
 if(grid&&!grid.querySelector('[data-permission="'+PERM+'"]')){
  const b=document.createElement('button');b.className='dashTile';b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="dashIcon">${agIcon}</span><b>Consultation AG</b><small>Questionnaires, collecte<br>et dépouillement automatique</small>`;wire(b);grid.insertBefore(b,grid.querySelector('#dashAccess')||null);
 }
 const list=document.querySelector('.dlist');
 if(list&&!list.querySelector('[data-permission="'+PERM+'"]')){
  const b=document.createElement('button');b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="drawerI">${agIcon}</span><span>Consultation AG</span>`;wire(b);
  const access=[...list.querySelectorAll('button')].find(x=>(x.textContent||'').toLowerCase().includes('gestion des accès')||(x.textContent||'').toLowerCase().includes('gestion des acces'));
  list.insertBefore(b,access||null);
 }
 grid?.querySelectorAll('[data-module="consultation-ag"],[data-permission="consultation_ag"]').forEach(wire);
 document.querySelectorAll('.dlist [data-module="consultation-ag"],.dlist [data-permission="consultation_ag"]').forEach(wire);
}
add();setTimeout(add,250);setTimeout(add,800);
window.addEventListener('pageshow',()=>{resetAGVisualState_(true);add()});
window.addEventListener('horticulture-users-synced',add);
})();