(()=>{
'use strict';
const PERM='consultation_ag';
const AG_ROUTE='horticulture-ag-route-v3';
const AG_ACTIVE='horticulture-ag-active-v1';
const AG_DRAFT='horticulture-ag-pro-draft-v2';
const agIcon=`<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h3M8 12h3M8 16h3M14 8h2M14 12h2M14 16h2"/><path d="m8 8 .8.8L10.5 7"/></svg>`;
let lastOpen=0,pendingSaveOpen='';
function clearAGRoute_(){try{sessionStorage.removeItem(AG_ACTIVE)}catch(_){}try{localStorage.removeItem(AG_ROUTE)}catch(_){}}
function readAGRoute_(){try{return JSON.parse(localStorage.getItem(AG_ROUTE)||'null')}catch{return null}}
function isAGActive_(){try{return sessionStorage.getItem(AG_ACTIVE)==='1'}catch{return false}}
function forceAGVisible_(){const ag=document.getElementById('agConsultation');if(!ag)return false;document.querySelectorAll('main.app > .view').forEach(v=>{const on=v===ag;v.classList.toggle('active',on);v.style.setProperty('display',on?'block':'none','important')});ag.hidden=false;document.body.classList.add('agWorkspaceMode');return true}
function showHome_(){
 clearAGRoute_();pendingSaveOpen='';document.body.classList.remove('agWorkspaceMode');
 const shell=document.getElementById('appShell');if(shell){shell.style.setProperty('display','block','important');shell.style.setProperty('visibility','visible','important');shell.style.setProperty('opacity','1','important')}
 const main=document.querySelector('main.app');if(main){main.style.setProperty('display','block','important');main.style.setProperty('visibility','visible','important');main.style.setProperty('opacity','1','important')}
 document.querySelectorAll('main.app > .view').forEach(v=>{v.classList.remove('active');v.style.setProperty('display','none','important')});
 const home=document.getElementById('home');if(home){home.hidden=false;home.classList.add('active');home.style.setProperty('display','block','important');home.style.setProperty('visibility','visible','important');home.style.setProperty('opacity','1','important')}
 const ag=document.getElementById('agConsultation');if(ag){ag.classList.remove('active');ag.style.setProperty('display','none','important')}
 window.scrollTo(0,0);
}
function loadTransmission_(){
 if(window.HorticultureAGTransmissionSafe){window.HorticultureAGTransmissionSafe.ensureControls?.();return}
 if(document.getElementById('agTransmissionDirect'))return;
 const s=document.createElement('script');s.id='agTransmissionDirect';s.src='./ag-transmission-safe.js?v=5';s.async=false;s.onload=()=>{setTimeout(()=>window.HorticultureAGTransmissionSafe?.ensureControls?.(),0);setTimeout(()=>window.HorticultureAGTransmissionSafe?.ensureControls?.(),250)};document.head.appendChild(s)
}
function restoreAGAfterRefresh_(n=0){const r=readAGRoute_();if(!isAGActive_()||!r)return false;const api=window.HorticultureAG;if(!api){if(n<30)setTimeout(()=>restoreAGAfterRefresh_(n+1),80);return false}try{if(r.screen==='campaign'&&r.id&&typeof api.openCampaign==='function'){const tab=['overview','collect','responses','results','settings'].includes(r.tab)?r.tab:'overview';api.openCampaign(r.id,tab);forceAGVisible_();loadTransmission_();if(r.tab==='transmission')setTimeout(()=>window.HorticultureAGTransmissionSafe?.open?.(r.id),300);return true}api.open?.();forceAGVisible_();return true}catch(e){console.error('Restauration Consultation AG',e)}return false}
function runAG_(){document.getElementById('drawer')?.classList.remove('open');clearAGRoute_();try{if(typeof window.HorticultureAG?.open==='function'){window.HorticultureAG.open();forceAGVisible_();loadTransmission_();setTimeout(forceAGVisible_,60);return true}}catch(e){console.error('Ouverture Consultation AG',e)}return false}
function openAG(e){if(e){e.preventDefault();e.stopPropagation()}const t=Date.now();if(t-lastOpen<350)return;lastOpen=t;if(runAG_())return;[80,220,500].forEach(ms=>setTimeout(()=>runAG_(),ms))}
function captureAG_(e){const b=e.target?.closest?.('[data-module="consultation-ag"],[data-permission="consultation_ag"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();openAG()}
function wire(b){if(!b||b.dataset.agMobileOpen==='1')return;b.dataset.agMobileOpen='1';b.type='button';b.onclick=openAG}
function draftId_(){try{return String(JSON.parse(localStorage.getItem(AG_DRAFT)||'null')?.id||'')}catch{return ''}}
function openSavedOverview_(id){const fn=window.HorticultureAG?.openCampaign;if(!id||typeof fn!=='function')return false;try{fn(id,'overview');forceAGVisible_();loadTransmission_();pendingSaveOpen='';return true}catch{return false}}
document.addEventListener('click',e=>{const save=e.target.closest?.('#agConsultation [data-save],#agConsultation [data-save-bottom]');if(!save||!document.querySelector('#agConsultation [data-sections]'))return;let id=draftId_();[40,120,250,500].forEach(ms=>setTimeout(()=>{id=id||draftId_();if(id){pendingSaveOpen=id;openSavedOverview_(id)}},ms))},true);
// Le bouton Retour racine de Consultation AG doit TOUJOURS revenir à Accueil.
document.addEventListener('click',e=>{const back=e.target.closest?.('#agConsultation > .back');if(!back)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();showHome_()},true);
// Navigation générale vers Accueil.
document.addEventListener('click',e=>{const home=e.target.closest?.('[data-go="home"],.admBrand,.admBrand img,.top b,.welcome img,.dhead img');if(!home)return;showHome_()},true);
window.addEventListener('touchend',captureAG_,{capture:true,passive:false});window.addEventListener('click',captureAG_,true);
function add(){const grid=document.querySelector('#home .dashGrid');if(grid&&!grid.querySelector('[data-permission="'+PERM+'"]')){const b=document.createElement('button');b.className='dashTile';b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="dashIcon">${agIcon}</span><b>Consultation AG</b><small>Questionnaires, collecte<br>et dépouillement automatique</small>`;wire(b);grid.insertBefore(b,grid.querySelector('#dashAccess')||null)}const list=document.querySelector('.dlist');if(list&&!list.querySelector('[data-permission="'+PERM+'"]')){const b=document.createElement('button');b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="drawerI">${agIcon}</span><span>Consultation AG</span>`;wire(b);const access=[...list.querySelectorAll('button')].find(x=>(x.textContent||'').toLowerCase().includes('gestion des accès')||(x.textContent||'').toLowerCase().includes('gestion des acces'));list.insertBefore(b,access||null)}document.querySelectorAll('[data-module="consultation-ag"],[data-permission="consultation_ag"]').forEach(wire)}
loadTransmission_();add();setTimeout(add,250);setTimeout(add,800);window.addEventListener('pageshow',()=>{add();loadTransmission_();setTimeout(()=>restoreAGAfterRefresh_(),100)});window.addEventListener('horticulture-users-synced',()=>{add();loadTransmission_();setTimeout(()=>restoreAGAfterRefresh_(),100)});setTimeout(()=>restoreAGAfterRefresh_(),140);
})();