(()=>{
'use strict';
const q=s=>document.querySelector(s), qa=s=>[...document.querySelectorAll(s)];
function views(){return qa('#appShell main.app > .view')}
function drawerClose(){q('#drawer')?.classList.remove('open')}
function resetAG(){document.body.classList.remove('agWorkspaceMode');try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}try{localStorage.removeItem('horticulture-ag-route-v3')}catch(_){}const ag=q('#agConsultation');if(ag){ag.classList.remove('active');ag.hidden=true;ag.style.setProperty('display','none','important');ag.style.setProperty('visibility','hidden','important');ag.style.setProperty('pointer-events','none','important')}}
function cleanViews(exceptAG=false){views().forEach(v=>{if(exceptAG&&v.id==='agConsultation')return;v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')})}
function show(id){resetAG();cleanViews(true);views().forEach(v=>v.classList.toggle('active',v.id===id));qa('.bottom .nav').forEach(n=>n.classList.toggle('active',n.dataset.go===id));drawerClose();window.scrollTo(0,0)}
function leaveAG(){resetAG();cleanViews(true)}
function home(){show('home')}
// IMPORTANT: do not intercept feature buttons. Their own modules keep ownership of
// Suggestions, Adherents, Profile, Settings, quick actions, etc. We only make sure
// AG is completely gone before those handlers execute.
document.addEventListener('click',e=>{
 const t=e.target.closest?.('button,[data-go],[data-permission],[data-module],.admBrand,.welcome img,.dhead img');if(!t)return;
 const isAG=!!t.closest?.('[data-module="consultation-ag"],[data-permission="consultation_ag"]');
 if(isAG)return;
 const isHome=!!t.closest?.('[data-go="home"],.admBrand,.welcome img,.dhead img');
 const ag=q('#agConsultation');if(ag?.classList.contains('active')||document.body.classList.contains('agWorkspaceMode'))leaveAG();
 if(isHome){e.preventDefault();home()}
},true);
// Last-resort invariant: never allow AG and another page to be visible together.
const enforce=()=>{const ag=q('#agConsultation');if(!ag)return;const other=views().some(v=>v!==ag&&v.classList.contains('active'));if(other)resetAG()};
const obs=new MutationObserver(enforce);const boot=()=>{const m=q('#appShell main.app');if(m)obs.observe(m,{subtree:true,attributes:true,attributeFilter:['class'],childList:true});else setTimeout(boot,100)};boot();
window.HorticultureNavigation={show,home,leaveAG,resetAG};
})();