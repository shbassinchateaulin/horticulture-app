(()=>{
'use strict';
if(window.__iphoneUiBridgeV1)return;window.__iphoneUiBridgeV1=true;
const isIOS=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(!isIOS())return;
function cleanModes(){document.body.classList.remove('agWorkspaceMode');try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}const ag=document.getElementById('agConsultation');if(ag){ag.classList.remove('active');ag.style.removeProperty('display')}}
function showDocuments(){cleanModes();const open=()=>{try{window.HorticultureDocuments?.open?.();const d=document.getElementById('documentsCenter');if(d){document.querySelectorAll('#appShell main.app > .view').forEach(v=>v.classList.toggle('active',v===d));d.hidden=false;d.style.removeProperty('display');window.scrollTo(0,0);return true}}catch(e){console.error('Cloud Documents iPhone',e)}return false};if(open())return;let s=document.getElementById('documentsCenterIosLoader');if(!s){s=document.createElement('script');s.id='documentsCenterIosLoader';s.src='./documents-center-v1.js?v=5';s.async=false;s.onload=()=>open();document.head.appendChild(s)}else setTimeout(open,30)}
window.addEventListener('click',e=>{const b=e.target.closest?.('[data-module="documents-center"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showDocuments()},true);
})();