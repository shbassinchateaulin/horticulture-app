(()=>{
'use strict';
if(window.__iphoneUiBridgeV3)return;window.__iphoneUiBridgeV3=true;
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1',GEN='horticulture-session-generation-v1';
const isIOS=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(!isIOS())return;
let suppressClickUntil=0,repairing=null;
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
function resetView(v){if(!v)return;v.hidden=false;v.removeAttribute('hidden');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')}
function cleanModes(){document.body.classList.remove('agWorkspaceMode');try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}const ag=document.getElementById('agConsultation');if(ag)ag.classList.remove('active')}
function forceDocumentsVisible(){
  const d=document.getElementById('documentsCenter');if(!d)return false;
  cleanModes();
  document.querySelectorAll('#appShell main.app > .view').forEach(v=>{v.classList.toggle('active',v===d);if(v===d){resetView(v);v.style.display='block';v.style.visibility='visible';v.style.opacity='1';v.style.pointerEvents='auto'}else{v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')}});
  d.classList.add('active');d.hidden=false;
  document.getElementById('drawer')?.classList.remove('open');window.scrollTo(0,0);return true;
}
function openNow(){try{
  const api=window.HorticultureDocuments;
  if(api?.render)api.render('');
  if(api?.open)api.open();
  return forceDocumentsVisible();
}catch(e){console.error('Cloud Documents iPhone',e);return false}}
function showDocuments(){
  cleanModes();repairSession().then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{});
  if(openNow()){setTimeout(forceDocumentsVisible,0);setTimeout(forceDocumentsVisible,80);setTimeout(forceDocumentsVisible,240);return}
  let s=document.getElementById('documentsCenterIosLoaderV3');
  if(!s){['documentsCenterIosLoader','documentsCenterIosLoaderV2'].forEach(id=>document.getElementById(id)?.remove());s=document.createElement('script');s.id='documentsCenterIosLoaderV3';s.src='./documents-center-v1.js?v=7';s.async=false;s.onload=()=>{openNow();setTimeout(openNow,80);setTimeout(openNow,240)};document.head.appendChild(s)}else{setTimeout(openNow,30);setTimeout(openNow,120);setTimeout(openNow,260)}
}
function cloudButton(t){return t?.closest?.('[data-module="documents-center"]')||null}
window.addEventListener('pointerup',e=>{const b=cloudButton(e.target);if(!b)return;suppressClickUntil=Date.now()+1200;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showDocuments()},true);
window.addEventListener('touchend',e=>{const b=cloudButton(e.target);if(!b)return;if(Date.now()<suppressClickUntil)return;suppressClickUntil=Date.now()+1200;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showDocuments()},{capture:true,passive:false});
window.addEventListener('click',e=>{const b=cloudButton(e.target);if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();if(Date.now()>=suppressClickUntil)showDocuments()},true);
setTimeout(()=>repairSession(true).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}),700);
window.addEventListener('pageshow',()=>repairSession(true).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}));
window.addEventListener('focus',()=>repairSession(false).then(()=>window.HorticultureDocumentsCloud?.sync?.()).catch(()=>{}));
window.HorticultureIphoneUi={showDocuments,repairSession,forceDocumentsVisible};
})();