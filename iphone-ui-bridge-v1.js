(()=>{
'use strict';
if(window.__iphoneUiBridgeV2)return;window.__iphoneUiBridgeV2=true;
const isIOS=()=>/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
if(!isIOS())return;
function resetView(v){if(!v)return;v.hidden=false;v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')}
function cleanModes(){document.body.classList.remove('agWorkspaceMode');try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}const ag=document.getElementById('agConsultation');if(ag){ag.classList.remove('active');resetView(ag)}}
function forceDocumentsVisible(){const d=document.getElementById('documentsCenter');if(!d)return false;document.querySelectorAll('#appShell main.app > .view').forEach(v=>{v.classList.toggle('active',v===d);if(v!==d)v.style.removeProperty('display')});resetView(d);d.classList.add('active');requestAnimationFrame(()=>{resetView(d);d.classList.add('active')});setTimeout(()=>{resetView(d);d.classList.add('active')},80);document.getElementById('drawer')?.classList.remove('open');window.scrollTo(0,0);return true}
function showDocuments(){cleanModes();const open=()=>{try{window.HorticultureDocuments?.open?.();return forceDocumentsVisible()}catch(e){console.error('Cloud Documents iPhone',e);return false}};if(open())return;let s=document.getElementById('documentsCenterIosLoaderV2');if(!s){document.getElementById('documentsCenterIosLoader')?.remove();s=document.createElement('script');s.id='documentsCenterIosLoaderV2';s.src='./documents-center-v1.js?v=6';s.async=false;s.onload=()=>{open();setTimeout(open,100)};document.head.appendChild(s)}else{setTimeout(open,30);setTimeout(open,120)}}
window.addEventListener('click',e=>{const b=e.target.closest?.('[data-module="documents-center"]');if(!b)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showDocuments()},true);
window.HorticultureIphoneUi={showDocuments};
})();