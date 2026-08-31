(()=>{
'use strict';
if(window.__horticultureQuickAddAdherentV1)return;
window.__horticultureQuickAddAdherentV1=true;

function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function isQuickAdd(btn){return !!btn?.closest?.('.quickGrid') && norm(btn.textContent)==='ajouter un adherent'}
function clickAddWhenReady(){
  let tries=0;
  const t=setInterval(()=>{
    tries++;
    const root=document.getElementById('adherentsAdmin');
    const add=root?.querySelector('[data-add]:not([disabled])');
    if(add){clearInterval(t);add.click();return}
    if(tries>80)clearInterval(t);
  },75);
}
function openForm(){
  try{sessionStorage.setItem('horticulture-active-view-v1','adherents')}catch(_){ }
  const api=window.HorticultureAdherents;
  if(api&&typeof api.open==='function')api.open();
  clickAddWhenReady();
}

document.addEventListener('click',e=>{
  const btn=e.target.closest?.('button');
  if(!isQuickAdd(btn))return;
  e.preventDefault();
  e.stopImmediatePropagation();
  openForm();
},true);
})();
