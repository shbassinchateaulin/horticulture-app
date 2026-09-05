(()=>{
'use strict';
if(window.__cloudUiBridgeV5)return;window.__cloudUiBridgeV5=true;
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1',GEN='horticulture-session-generation-v1';
let repairing=null;
function currentSession(){try{return JSON.parse(localStorage.getItem(PERSIST)||sessionStorage.getItem(SESSION)||'null')}catch{return null}}
async function repairSession(force=false){
  if(repairing)return repairing;
  const s=currentSession();if(!s?.id)return null;
  const existing=localStorage.getItem(GEN)||sessionStorage.getItem(GEN)||'';
  if(existing&&!force){localStorage.setItem(GEN,existing);sessionStorage.setItem(GEN,existing);return existing}
  repairing=(async()=>{try{
    const r=await fetch(API+'?action=getSessionState&userId='+encodeURIComponent(String(s.id))+'&t='+Date.now(),{cache:'no-store'}),j=await r.json();
    if(j?.ok&&j.generation){const g=String(j.generation);localStorage.setItem(GEN,g);sessionStorage.setItem(GEN,g);return g}
    return null;
  }catch(e){console.warn('Réparation session Cloud',e);return null}finally{repairing=null}})();
  return repairing;
}
function resetView(v){if(!v)return;v.hidden=false;v.removeAttribute('hidden');v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events');v.style.removeProperty('transform');v.style.removeProperty('scale')}
function cleanModes(){
  document.body.classList.remove('agWorkspaceMode');
  try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}
  const ag=document.getElementById('agConsultation');if(ag)ag.classList.remove('active');
}
function forceDocumentsVisible(){
  const d=document.getElementById('documentsCenter');if(!d)return false;
  cleanModes();
  const views=[...document.querySelectorAll('#appShell main.app > .view')];
  views.forEach(v=>{
    const active=v===d;
    v.classList.toggle('active',active);
    if(active){resetView(v);v.style.setProperty('display','block','important');v.style.setProperty('visibility','visible','important');v.style.setProperty('opacity','1','important');v.style.setProperty('pointer-events','auto','important')}
    else{v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events');v.style.removeProperty('transform');v.style.removeProperty('scale')}
  });
  d.classList.add('active');d.hidden=false;
  const drawer=document.getElementById('drawer');if(drawer){drawer.classList.remove('open');drawer.style.removeProperty('display')}
  window.scrollTo(0,0);
  return true;
}
function openNow(){try{
  const api=window.HorticultureDocuments;
  if(!api)return false;
  if(typeof api.render==='function')api.render('');
  if(typeof api.open==='function')api.open();
  window.HorticultureDrawer?.activate?.('documentsCenter');
  return forceDocumentsVisible();
}catch(e){console.error('Cloud Documents',e);return false}}
function showDocuments(){
  cleanModes();
  const opened=openNow();
  if(opened){requestAnimationFrame(forceDocumentsVisible);setTimeout(forceDocumentsVisible,30);setTimeout(forceDocumentsVisible,120);setTimeout(forceDocumentsVisible,300)}
  else{
    let s=document.getElementById('documentsCenterUniversalLoaderV5');
    if(!s){['documentsCenterIosLoader','documentsCenterIosLoaderV2','documentsCenterIosLoaderV3','documentsCenterIosLoaderV4'].forEach(id=>document.getElementById(id)?.remove());s=document.createElement('script');s.id='documentsCenterUniversalLoaderV5';s.src='./documents-center-v1.js?v=9';s.async=false;s.onload=()=>{openNow();requestAnimationFrame(forceDocumentsVisible);setTimeout(openNow,80);setTimeout(forceDocumentsVisible,220)};document.head.appendChild(s)}else{setTimeout(openNow,20);setTimeout(forceDocumentsVisible,100);setTimeout(forceDocumentsVisible,260)}
  }
  repairSession().then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{});
}
function cloudButton(t){return t?.closest?.('[data-module="documents-center"]')||null}
window.addEventListener('click',e=>{
  const b=cloudButton(e.target);if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  showDocuments();
},true);
setTimeout(()=>repairSession(true).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}),700);
window.addEventListener('pageshow',()=>repairSession(true).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}));
window.addEventListener('focus',()=>repairSession(false).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}));
window.HorticultureCloudUi={showDocuments,repairSession,forceDocumentsVisible};
window.HorticultureIphoneUi=window.HorticultureCloudUi;
})();