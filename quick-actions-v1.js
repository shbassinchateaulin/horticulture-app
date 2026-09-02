(()=>{
'use strict';
if(window.__horticultureQuickActionsV3)return;window.__horticultureQuickActionsV3=true;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function waitFor(fn,tries=100,delay=80){let n=0;const t=setInterval(()=>{n++;try{if(fn()){clearInterval(t);return}}catch(_){}if(n>=tries)clearInterval(t)},delay)}
function openAdherentAdd(){if(window.HorticultureQuickAddAdherent?.open){window.HorticultureQuickAddAdherent.open();return}const s=document.createElement('script');s.src='./quick-add-adherent-v1.js?v=2';s.onload=()=>window.HorticultureQuickAddAdherent?.open?.();document.head.appendChild(s)}
function openSortieAdd(){
  const api=window.HorticultureSorties;
  if(api&&typeof api.open==='function')api.open();
  else document.querySelector('#home [data-permission="sorties"]')?.click();
  waitFor(()=>{
    const root=document.getElementById('sortiesAdmin');
    if(!root)return false;
    let add=root.querySelector('[data-new]:not([disabled])')||[...root.querySelectorAll('button')].find(b=>/ajouter une sortie|nouvelle sortie/i.test(b.textContent||''));
    if(add){add.click();return true}
    const back=root.querySelector('[data-back-list]')||[...root.querySelectorAll('button')].find(b=>/retour.*sorties|retour aux sorties/i.test(b.textContent||''));
    if(back){back.click();return false}
    return false;
  },120,50);
}
document.addEventListener('click',e=>{const b=e.target.closest?.('.quickGrid .quickBtn');if(!b)return;const t=norm(b.textContent);if(t==='ajouter un adherent'){e.preventDefault();e.stopImmediatePropagation();openAdherentAdd()}else if(t==='nouvelle sortie'){e.preventDefault();e.stopImmediatePropagation();openSortieAdd()}},true);
})();
