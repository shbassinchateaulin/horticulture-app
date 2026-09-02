(()=>{
'use strict';
if(window.__horticulturePageRestoreV3)return;
window.__horticulturePageRestoreV3=true;
const KEY='horticulture-app-current-page';
let restoring=false,observing=false,bootUntil=Date.now()+2500;
function get(){try{return localStorage.getItem(KEY)||''}catch(_){return''}}
function remember(id){try{localStorage.setItem(KEY,id)}catch(_){}}
function appVisible(){const app=document.getElementById('appShell');if(!app)return false;const s=getComputedStyle(app);return s.display!=='none'&&s.visibility!=='hidden'}
function hasAccess(permission){const tile=document.querySelector(`[data-permission="${permission}"]`);return !tile||getComputedStyle(tile).display!=='none'}
function restore(){if(restoring||!appVisible())return false;const wanted=get();if(wanted==='adherentsAdmin'&&hasAccess('adherents')&&typeof window.HorticultureAdherents?.open==='function'){if(document.getElementById('adherentsAdmin')?.classList.contains('active'))return true;restoring=true;try{window.HorticultureAdherents.open()}finally{setTimeout(()=>restoring=false,250)};return true}if(wanted==='sortiesAdmin'&&hasAccess('sorties')&&typeof window.HorticultureSorties?.open==='function'){if(document.getElementById('sortiesAdmin')?.classList.contains('active'))return true;restoring=true;try{window.HorticultureSorties.open()}finally{setTimeout(()=>restoring=false,250)};return true}return false}
function observe(){const main=document.querySelector('#appShell main.app');if(!main||observing)return;observing=true;new MutationObserver(()=>{const active=[...main.children].find(v=>v.classList?.contains('view')&&v.classList.contains('active'));if(!active?.id)return;const wanted=get();if(Date.now()<bootUntil&&active.id==='home'&&(wanted==='sortiesAdmin'||wanted==='adherentsAdmin'))return;remember(active.id)}).observe(main,{subtree:false,attributes:true,attributeFilter:['class']})}
document.addEventListener('click',e=>{if(e.target.closest?.('[data-permission="adherents"]'))remember('adherentsAdmin');if(e.target.closest?.('[data-permission="sorties"]'))remember('sortiesAdmin');if(e.target.closest?.('#adherentsAdmin [data-close],#adherentsAdmin .aa-back,#sortiesAdmin [data-home],#sortiesAdmin .sfs-back'))remember('home')},true);
let tries=0;const timer=setInterval(()=>{tries++;restore();observe();if(tries>180)clearInterval(timer)},100);window.addEventListener('pageshow',()=>setTimeout(restore,50));document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(restore,50)});
})();