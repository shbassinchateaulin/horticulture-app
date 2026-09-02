(()=>{
'use strict';
if(window.__sortiesScannerTestCompatV1)return;window.__sortiesScannerTestCompatV1=true;
const STORE='horticulture-sorties-safe-v2';
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function isTestSortie(s){const t=String(s?.title||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();return /(^|\s|[-_])test(\s|$|[-_])/.test(t)||t.includes('test qr')}
function selectedFromButton(bt){const id=bt?.dataset?.sqrPick;if(id!=null){const s=rows().find(x=>String(x.id)===String(id));if(s)return s}const title=bt?.querySelector('b')?.textContent?.trim()||'';return rows().find(x=>String(x.title||'').trim()===title)||null}
document.addEventListener('click',e=>{
  const bt=e.target.closest?.('[data-sqr-pick]');if(!bt)return;
  const s=selectedFromButton(bt);if(!isTestSortie(s))return;
  const scanner=window.HorticultureSortiesScanner;if(!scanner?.test)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  bt.closest('.sfs-modalBack')?.remove();
  scanner.test();
},true);
})();