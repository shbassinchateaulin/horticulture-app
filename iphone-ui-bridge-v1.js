(()=>{
'use strict';
if(window.__iphoneUiBridgeV4)return;window.__iphoneUiBridgeV4=true;
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1',GEN='horticulture-session-generation-v1';
const isIOS=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(!isIOS())return;
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
  }catch(e){console.warn('Réparation session Cloud iPhone',e);return null}finally{repairing=null}})();
  return repairing;
}
function resetView(v){if(!v)return;v.hidden=false;v.removeAttribute('hidden');v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')}
function cleanModes(){document.body.classList.remove('agWorkspaceMode');try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}const ag=document.getElementById('agConsultation');if(ag)ag.classList.remove('active')}
function forceDocumentsVisible(){
  const d=document.getElementById('documentsCenter');if(!d)return false;
  cleanModes();
  const views=[...document.querySelectorAll('#appShell main.app > .view')];
  views.forEach(v=>{v.classList.remove('active');if(v!==d){v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')}});
  resetView(d);d.classList.add('active');
  document.getElementById('drawer')?.classList.remove('open');
  window.scrollTo(0,0);
  return true;
}
function openNow(){try{
  const api=window.HorticultureDocuments;
  if(!api)return false;
  if(typeof api.render==='function')api.render('');
  if(typeof api.open==='function')api.open();
  return forceDocumentsVisible();
}catch(e){console.error('Cloud Documents iPhone',e);return false}}
function showDocuments(){
  cleanModes();
  const opened=openNow();
  if(opened){requestAnimationFrame(forceDocumentsVisible);setTimeout(forceDocumentsVisible,40);setTimeout(forceDocumentsVisible,160)}
  else{
    let s=document.getElementById('documentsCenterIosLoaderV4');
    if(!s){['documentsCenterIosLoader','documentsCenterIosLoaderV2','documentsCenterIosLoaderV3'].forEach(id=>document.getElementById(id)?.remove());s=document.createElement('script');s.id='documentsCenterIosLoaderV4';s.src='./documents-center-v1.js?v=8';s.async=false;s.onload=()=>{openNow();requestAnimationFrame(forceDocumentsVisible);setTimeout(openNow,80)};document.head.appendChild(s)}else{setTimeout(openNow,20);setTimeout(openNow,100)}
  }
  repairSession().then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{});
}
function cloudButton(t){return t?.closest?.('[data-module="documents-center"]')||null}
/* Un seul gestionnaire click. L'ancien verrou pointerup/touchend pouvait ignorer
   le second clic Cloud juste après le retour à Accueil sur iPhone. */
window.addEventListener('click',e=>{
  const b=cloudButton(e.target);if(!b)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  showDocuments();
},true);
setTimeout(()=>repairSession(true).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}),700);
window.addEventListener('pageshow',()=>repairSession(true).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}));
window.addEventListener('focus',()=>repairSession(false).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}));
window.HorticultureIphoneUi={showDocuments,repairSession,forceDocumentsVisible};
})();