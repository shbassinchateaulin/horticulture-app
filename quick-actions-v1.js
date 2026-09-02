(()=>{
'use strict';
if(window.__horticultureQuickActionsV1)return;window.__horticultureQuickActionsV1=true;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
function waitFor(fn,tries=100,delay=80){let n=0;const t=setInterval(()=>{n++;try{if(fn()){clearInterval(t);return}}catch(_){}if(n>=tries)clearInterval(t)},delay)}
function openAdherentAdd(){const tile=document.querySelector('#home [data-permission="adherents"]');if(tile)tile.click();else window.HorticultureAdherents?.open?.();waitFor(()=>{const root=document.getElementById('adherentsAdmin');if(!root)return false;const add=root.querySelector('[data-add]:not([disabled])')||[...root.querySelectorAll('button')].find(b=>/ajouter.*adhérent|nouvel.*adhérent/i.test(b.textContent||''));if(!add)return false;add.click();return true})}
function openSortieAdd(){const tile=document.querySelector('#home [data-permission="sorties"]');if(tile)tile.click();else window.HorticultureSorties?.open?.();waitFor(()=>{const root=document.getElementById('sortiesAdmin');if(!root)return false;const add=root.querySelector('[data-new]:not([disabled])')||[...root.querySelectorAll('button')].find(b=>/ajouter une sortie|nouvelle sortie/i.test(b.textContent||''));if(!add)return false;add.click();return true})}
document.addEventListener('click',e=>{const b=e.target.closest?.('.quickGrid .quickBtn');if(!b)return;const t=norm(b.textContent);if(t==='ajouter un adherent'){e.preventDefault();e.stopImmediatePropagation();openAdherentAdd()}else if(t==='nouvelle sortie'){e.preventDefault();e.stopImmediatePropagation();openSortieAdd()}},true);
})();
