(()=>{
'use strict';
if(window.__sortiesAttendanceLiveV2)return;window.__sortiesAttendanceLiveV2=true;
const STORE='horticulture-sorties-safe-v2',CACHE='horticulture-sorties-attendance-cache';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function cache(){try{const x=JSON.parse(localStorage.getItem(CACHE)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return{}}}
function valid(st){return ['present','late','absent','pending'].includes(st)}
function label(st){return st==='present'?'Présent':st==='late'?'Retard':st==='absent'?'Absent':'—'}
function cls(st){return st==='present'?'sfs-presence-present':st==='late'?'sfs-presence-late':st==='absent'?'sfs-presence-absent':''}
function effective(s,p,c){if(valid(p?.attendanceStatus))return p.attendanceStatus;if(p?.present===true)return'present';const st=c?.[String(s?.id)]?.[p?.id];return valid(st)?st:'pending'}
function currentSortie(all){const title=$('#sortiesAdmin .sfs-detailMain h2')?.textContent?.trim()||'';return all.find(s=>String(s.title||'').trim()===title)||null}
function presenceIndex(table){const heads=$$('thead th',table);let i=heads.findIndex(h=>/présence|presence|statut/i.test((h.textContent||'').trim()));return i>=0?i:6}
function rowForParticipant(p){const byId=p?.id!=null?$(`#sortiesAdmin [data-person="${CSS.escape(String(p.id))}"]`)?.closest('tr'):null;if(byId)return byId;const name1=[p?.lastName,p?.firstName].filter(Boolean).join(' ').trim(),name2=[p?.firstName,p?.lastName].filter(Boolean).join(' ').trim();return $$('#sortiesAdmin .sfs-table tbody tr').find(r=>{const t=(r.textContent||'').replace(/\s+/g,' ').trim();return (name1&&t.includes(name1))||(name2&&t.includes(name2))})||null}
function paintParticipant(p,st){const row=rowForParticipant(p);if(!row)return;const table=row.closest('table'),cells=$$('td',row),i=table?presenceIndex(table):6,cell=cells[i];if(!cell)return;cell.textContent=label(st);cell.classList.remove('sfs-ok','sfs-presence-present','sfs-presence-late','sfs-presence-absent');const k=cls(st);if(k)cell.classList.add(k);if(st==='present'||st==='late')cell.classList.add('sfs-ok')}
function paintDetail(all,c){const s=currentSortie(all);if(!s)return;(s.participants||[]).forEach(p=>paintParticipant(p,effective(s,p,c)))}
function paintCards(all,c){$$('#sortiesAdmin .sfs-list .sfs-row').forEach(card=>{const open=$('[data-open]',card);if(!open)return;const s=all.find(x=>String(x.id)===String(open.dataset.open));if(!s)return;let present=0;(s.participants||[]).forEach(p=>{const st=effective(s,p,c);if(st==='present'||st==='late')present++});const stats=$$('.sfs-stat b',card);if(stats[1])stats[1].textContent=present||'—'})}
function paintAll(){const all=rows(),c=cache();paintDetail(all,c);paintCards(all,c)}
function onChange(e){const d=e?.detail||{},all=rows(),c=cache(),s=d.sortieId!=null?all.find(x=>String(x.id)===String(d.sortieId)):currentSortie(all),p=s&&d.participantId!=null?(s.participants||[]).find(x=>String(x.id)===String(d.participantId)):null;if(p&&d.status)paintParticipant(p,d.status);paintCards(all,c);requestAnimationFrame(paintAll);setTimeout(paintAll,40);setTimeout(paintAll,150)}
document.addEventListener('horticulture-sorties-attendance-changed',onChange);
window.addEventListener('storage',e=>{if(e.key===STORE||e.key===CACHE)requestAnimationFrame(paintAll)});
new MutationObserver(()=>requestAnimationFrame(paintAll)).observe(document.body,{childList:true,subtree:true});
paintAll();
})();