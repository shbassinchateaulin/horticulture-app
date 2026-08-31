(()=>{
'use strict';
if(window.__horticultureAdherentsPageRestoreV1)return;
window.__horticultureAdherentsPageRestoreV1=true;

const KEY='horticulture-app-current-page';
const PAGE='adherentsAdmin';
let restoring=false;

function remember(id){try{localStorage.setItem(KEY,id)}catch(_){}}
function appVisible(){
  const app=document.getElementById('appShell');
  if(!app)return false;
  const s=getComputedStyle(app);
  return s.display!=='none'&&s.visibility!=='hidden';
}
function hasAdherentAccess(){
  const tile=document.querySelector('[data-permission="adherents"]');
  if(!tile)return true;
  return getComputedStyle(tile).display!=='none';
}
function restore(){
  if(restoring)return;
  let wanted='';try{wanted=localStorage.getItem(KEY)||''}catch(_){}
  if(wanted!==PAGE||!appVisible()||!hasAdherentAccess()||typeof window.HorticultureAdherents?.open!=='function')return;
  const root=document.getElementById(PAGE);
  if(root?.classList.contains('active'))return;
  restoring=true;
  try{window.HorticultureAdherents.open()}finally{setTimeout(()=>{restoring=false},250)}
}

// Mémorise la page réellement affichée sans toucher à la navigation existante.
const observe=()=>{
  const main=document.querySelector('#appShell main.app');
  if(!main)return false;
  const sync=()=>{
    const active=[...main.children].find(v=>v.classList?.contains('view')&&v.classList.contains('active'));
    if(active?.id)remember(active.id);
  };
  new MutationObserver(sync).observe(main,{subtree:false,attributes:true,attributeFilter:['class']});
  sync();
  return true;
};

// Le bouton Retour des adhérents doit mémoriser Accueil.
document.addEventListener('click',e=>{
  if(e.target.closest?.('#adherentsAdmin [data-close], #adherentsAdmin .aa-back'))remember('home');
  if(e.target.closest?.('[data-permission="adherents"]'))remember(PAGE);
},true);

let tries=0;
const timer=setInterval(()=>{
  tries++;
  observe();
  restore();
  if(tries>120)clearInterval(timer);
},100);
window.addEventListener('pageshow',()=>setTimeout(restore,50));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(restore,50)});
})();
