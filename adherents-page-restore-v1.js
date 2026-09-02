(()=>{
'use strict';
if(window.__horticultureAdherentsPageRestoreV2)return;
window.__horticultureAdherentsPageRestoreV2=true;
const KEY='horticulture-app-current-page';
let restoring=false;
function remember(id){try{localStorage.setItem(KEY,id)}catch(_){}}
function appVisible(){const app=document.getElementById('appShell');if(!app)return false;const s=getComputedStyle(app);return s.display!=='none'&&s.visibility!=='hidden'}
function hasAccess(permission){const tile=document.querySelector(`[data-permission="${permission}"]`);return !tile||getComputedStyle(tile).display!=='none'}
function restore(){if(restoring||!appVisible())return;let wanted='';try{wanted=localStorage.getItem(KEY)||''}catch(_){}
  if(wanted==='adherentsAdmin'&&hasAccess('adherents')&&typeof window.HorticultureAdherents?.open==='function'){
    if(document.getElementById('adherentsAdmin')?.classList.contains('active'))return;restoring=true;try{window.HorticultureAdherents.open()}finally{setTimeout(()=>restoring=false,250)};return;
  }
  if(wanted==='sortiesAdmin'&&hasAccess('sorties')&&typeof window.HorticultureSorties?.open==='function'){
    if(document.getElementById('sortiesAdmin')?.classList.contains('active'))return;restoring=true;try{window.HorticultureSorties.open()}finally{setTimeout(()=>restoring=false,250)};
  }
}
function observe(){const main=document.querySelector('#appShell main.app');if(!main||main.dataset.pageRestoreObserved)return false;main.dataset.pageRestoreObserved='1';const sync=()=>{const active=[...main.children].find(v=>v.classList?.contains('view')&&v.classList.contains('active'));if(active?.id)remember(active.id)};new MutationObserver(sync).observe(main,{subtree:false,attributes:true,attributeFilter:['class']});sync();return true}
document.addEventListener('click',e=>{
  if(e.target.closest?.('#adherentsAdmin [data-close], #adherentsAdmin .aa-back, #sortiesAdmin [data-home], #sortiesAdmin .sfs-back'))remember('home');
  if(e.target.closest?.('[data-permission="adherents"]'))remember('adherentsAdmin');
  if(e.target.closest?.('[data-permission="sorties"]'))remember('sortiesAdmin');
},true);
let tries=0;const timer=setInterval(()=>{tries++;observe();restore();if(tries>180)clearInterval(timer)},100);
window.addEventListener('pageshow',()=>setTimeout(restore,50));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(restore,50)});
})();