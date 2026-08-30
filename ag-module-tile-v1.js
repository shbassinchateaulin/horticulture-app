(()=>{
const PERM='consultation_ag';
const agIcon=`<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h3M8 12h3M8 16h3M14 8h2M14 12h2M14 16h2"/><path d="m8 8 .8.8L10.5 7"/></svg>`;
let lastOpen=0,saveClickLocked=false;
function resetAGVisualState_(){
 document.body.classList.remove('agWorkspaceMode');
 document.getElementById('agConsultation')?.classList.remove('active');
 try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}
}
function runAG_(){
 document.getElementById('drawer')?.classList.remove('open');
 resetAGVisualState_();
 try{
   if(typeof window.HorticultureAG?.open==='function'){window.HorticultureAG.open();return true}
 }catch(err){console.error('Ouverture Consultation AG',err)}
 return false;
}
function openAG(e){
 if(e){e.preventDefault();e.stopPropagation()}
 const t=Date.now();if(t-lastOpen<450)return;lastOpen=t;
 if(runAG_())return;
 [60,180,420].forEach(ms=>setTimeout(runAG_,ms));
}
function isAGControl_(target){
 return target?.closest?.('[data-module="consultation-ag"],[data-permission="consultation_ag"]')||null;
}
function captureAG_(e){
 const b=isAGControl_(e.target);if(!b)return;
 e.preventDefault();
 e.stopPropagation();
 if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
 openAG();
}
function captureImmediateSave_(e){
 const b=e.target.closest?.('#agConsultation [data-save],#agConsultation [data-save-bottom]');
 if(!b)return;
 if(saveClickLocked){
   e.preventDefault();
   e.stopPropagation();
   if(typeof e.stopImmediatePropagation==='function')e.stopImmediatePropagation();
   return;
 }
 saveClickLocked=true;
 document.querySelectorAll('#agConsultation [data-save],#agConsultation [data-save-bottom]').forEach(x=>{
   x.disabled=true;
   x.setAttribute('aria-busy','true');
   x.dataset.oldText=x.textContent||'';
   x.textContent='Enregistré ✓';
 });
 // Le brouillon AG est déjà écrit localement à chaque modification. On donne donc
 // une réponse visuelle immédiate et on revient à la vue AG sans attendre Sheets.
 setTimeout(()=>{
   try{window.HorticultureAG?.open?.()}catch(err){console.error('Ouverture après enregistrement AG',err)}
   setTimeout(()=>{saveClickLocked=false},1200);
 },0);
}
function wire(b){
 if(!b||b.dataset.agMobileOpen==='1')return;
 b.dataset.agMobileOpen='1';
 b.type='button';
 b.style.touchAction='manipulation';
 b.onclick=openAG;
}
// Nettoyage systématique quand on revient vers l'accueil via la navigation ou le logo.
document.addEventListener('click',e=>{
 const home=e.target.closest?.('[data-go="home"],.top b,.welcome img,.dhead img');
 if(!home)return;
 if(document.body.classList.contains('agWorkspaceMode')||document.getElementById('agConsultation')?.classList.contains('active'))resetAGVisualState_();
},true);
// Capture au niveau window : avant les autres gestionnaires globaux de l'application.
// Le save est seulement verrouillé contre les doubles clics ; le gestionnaire AG natif
// continue son enregistrement serveur en arrière-plan.
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
add();setTimeout(add,400);window.addEventListener('pageshow',add);window.addEventListener('horticulture-users-synced',add);
})();