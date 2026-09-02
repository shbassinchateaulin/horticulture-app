(()=>{
'use strict';
if(window.__sortiesScannerAutoPresenceV1)return;window.__sortiesScannerAutoPresenceV1=true;
const STORE='horticulture-sorties-safe-v2',CACHE='horticulture-sorties-attendance-cache';
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function save(a){try{localStorage.setItem(STORE,JSON.stringify(a))}catch(_){}}
function currentSortie(all){const title=document.querySelector('.sqr5-top b')?.textContent?.trim()||'';return all.find(s=>String(s.title||s.name||'').trim()===title)||null}
function matches(p,code){return[p?.qrCode,p?.ticketId,p?.helloassoItemId,p?.id].filter(Boolean).some(v=>String(v)===String(code))}
function markPresent(){
 const ok=document.querySelector('.sqr5-result.ok');if(!ok||ok.dataset.autoPresenceDone)return;ok.dataset.autoPresenceDone='1';
 const code=String(window.__lastScannedQrValue||'').trim();if(!code)return;
 const all=rows(),s=currentSortie(all);if(!s)return;
 const p=(s.participants||[]).find(x=>matches(x,code));if(!p)return;
 const now=new Date().toISOString();p.present=true;p.presentAt=p.presentAt||now;p.attendanceStatus='present';
 s.history=s.history||[];if(!s.history.some(h=>String(h.text||h.label||'').includes('Présence validée par QR')&&String(h.text||h.label||'').includes([p.firstName,p.lastName].filter(Boolean).join(' '))))s.history.unshift({date:now,text:'Présence validée par QR : '+[p.firstName,p.lastName].filter(Boolean).join(' ')});
 save(all);
 try{const c=JSON.parse(localStorage.getItem(CACHE)||'{}');c[s.id]=c[s.id]||{};c[s.id][p.id]='present';localStorage.setItem(CACHE,JSON.stringify(c))}catch(_){}
 document.dispatchEvent(new CustomEvent('horticulture-sorties-attendance-changed',{detail:{sortieId:s.id,participantId:p.id,status:'present'}}));
 try{window.HorticultureSortiesShared?.setAttendance?.(s.id,p.id,'present')}catch(_){}
 try{window.HorticultureSorties?.refresh?.()}catch(_){}
}
new MutationObserver(markPresent).observe(document.documentElement,{subtree:true,childList:true});
})();