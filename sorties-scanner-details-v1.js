(()=>{
'use strict';
if(window.__sortiesScannerDetailsV1)return;window.__sortiesScannerDetailsV1=true;
const STORE='horticulture-sorties-safe-v2';
const TEST_VALID='HORTI-TEST-QR-VALID-2026-001',TEST_USED='HORTI-TEST-QR-USED-2026-001',TEST_BAD='HORTI-TEST-QR-INVALID-2026-001';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function vals(p){return[p?.qrCode,p?.ticketId,p?.helloassoItemId,p?.id].filter(Boolean).map(String)}
function findTicket(code){for(const s of rows()){for(const p of(s.participants||[])){if(vals(p).includes(String(code)))return{s,p}}}return null}
function currentSortie(){const title=document.querySelector('.sqr5-top b')?.textContent?.trim()||'';return rows().find(s=>String(s.title||s.name||'').trim()===title)||null}
function testMode(){return /test/i.test(document.querySelector('.sqr5-top b')?.textContent||'')}
function detailHtml(kind,title,sub){let name='',sortie='',places='',reason='';const cur=currentSortie(),raw=window.__lastScannedQrValue||'';
 if(testMode()){
  if(raw===TEST_VALID){name='Jean TEST';sortie=cur?.title||'Sortie test';places='1 billet';reason=kind==='used'?'Ce billet a déjà été scanné.':''}
  else if(raw===TEST_USED){name='Marie TEST';sortie=cur?.title||'Sortie test';places='2 billets';reason='Ce billet a déjà été scanné.'}
  else if(raw===TEST_BAD){reason='Ce billet ne correspond pas à cette sortie.'}
 }else{
  const hit=findTicket(raw);if(hit){name=[hit.p.firstName,hit.p.lastName].filter(Boolean).join(' ');sortie=hit.s.title||'Sortie';places=(Number(hit.p.places||1))+' billet'+(Number(hit.p.places||1)>1?'s':'');if(String(hit.s.id)!==String(cur?.id))reason='Ce billet correspond à une autre sortie : '+sortie+'.';else if(kind==='used')reason='Ce billet a déjà été scanné.'}
  else if(kind==='bad')reason='Billet inconnu : il ne correspond à aucune inscription connue pour cette sortie.';
 }
 if(kind==='bad'&&!reason)reason=sub||'Ce billet ne correspond pas à cette sortie.';
 const fields=[];if(name)fields.push(`<div><small>Participant</small><strong>${esc(name)}</strong></div>`);if(places)fields.push(`<div><small>Billets / places</small><strong>${esc(places)}</strong></div>`);if(sortie)fields.push(`<div><small>Sortie</small><strong>${esc(sortie)}</strong></div>`);if(reason)fields.push(`<div class="sqd-reason"><small>${kind==='bad'?'Raison du refus':'Information'}</small><strong>${esc(reason)}</strong></div>`);
 return `<div class="sqd-box">${fields.join('')}</div>`
}
function enhance(){const r=document.querySelector('.sqr5-result');if(!r||r.dataset.detailsDone)return;r.dataset.detailsDone='1';const kind=r.classList.contains('ok')?'ok':r.classList.contains('used')?'used':'bad',card=r.querySelector('.sqr5-card'),h=card?.querySelector('h2'),p=card?.querySelector('p'),btn=card?.querySelector('[data-sqr5-next]');if(!card||!btn)return;btn.insertAdjacentHTML('beforebegin',detailHtml(kind,h?.textContent||'',p?.textContent||''));if(p)p.style.display='none'}
const st=document.createElement('style');st.textContent='.sqd-box{margin:18px 0;text-align:left;background:#ffffff20;border:1px solid #ffffff55;border-radius:16px;padding:6px 16px}.sqd-box>div{padding:10px 0;border-bottom:1px solid #ffffff35}.sqd-box>div:last-child{border-bottom:0}.sqd-box small{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.06em;opacity:.82;margin-bottom:3px}.sqd-box strong{display:block;font-size:16px;line-height:1.3}.sqd-reason strong{font-size:15px}';document.head.appendChild(st);
const oldBD=window.BarcodeDetector;if(oldBD){try{const proto=oldBD.prototype,old=proto.detect;if(old&&!old.__sqd){const wrapped=async function(...args){const res=await old.apply(this,args);if(res?.[0]?.rawValue)window.__lastScannedQrValue=String(res[0].rawValue);return res};wrapped.__sqd=true;proto.detect=wrapped}}catch(_){}}
new MutationObserver(enhance).observe(document.documentElement,{subtree:true,childList:true});
})();