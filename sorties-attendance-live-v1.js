(()=>{
'use strict';
if(window.__sortiesAttendanceLiveV1)return;window.__sortiesAttendanceLiveV1=true;
const STORE='horticulture-sorties-safe-v2',CACHE='horticulture-sorties-attendance-cache';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function statusLabel(st){return st==='present'?'Présent':st==='late'?'Retard':st==='absent'?'Absent':'—'}
function statusClass(st){return st==='present'?'sfs-presence-present':st==='late'?'sfs-presence-late':st==='absent'?'sfs-presence-absent':''}
function currentSortie(){const title=$('#sortiesAdmin .sfs-detailMain h2')?.textContent?.trim()||'';return rows().find(s=>String(s.title||'').trim()===title)||null}
function cacheMap(sid){try{return JSON.parse(localStorage.getItem(CACHE)||'{}')?.[sid]||{}}catch(_){return{}}}
function effectiveStatus(s,p){if(['present','late','absent','pending'].includes(p?.attendanceStatus))return p.attendanceStatus;if(p?.present===true)return'present';const c=cacheMap(s?.id);return ['present','late','absent','pending'].includes(c?.[p?.id])?c[p.id]:'pending'}
function paintOne(pid,status){const bt=$(`#sortiesAdmin [data-person="${CSS.escape(String(pid))}"]`);const row=bt?.closest('tr');if(!row)return;const cells=$$('td',row);const cell=cells[6];if(!cell)return;cell.textContent=statusLabel(status);cell.classList.remove('sfs-ok','sfs-presence-present','sfs-presence-late','sfs-presence-absent');const cls=statusClass(status);if(cls)cell.classList.add(cls);if(status==='present')cell.classList.add('sfs-ok')}
function paintAll(){const s=currentSortie();if(!s)return;(s.participants||[]).forEach(p=>paintOne(p.id,effectiveStatus(s,p)))}
function onChange(e){const d=e?.detail||{};if(d.participantId&&d.status){paintOne(d.participantId,d.status);requestAnimationFrame(()=>paintOne(d.participantId,d.status));setTimeout(()=>paintOne(d.participantId,d.status),80);return}requestAnimationFrame(paintAll)}
document.addEventListener('horticulture-sorties-attendance-changed',onChange);
new MutationObserver(()=>requestAnimationFrame(paintAll)).observe(document.body,{childList:true,subtree:true});
window.addEventListener('storage',e=>{if(e.key===STORE||e.key===CACHE)requestAnimationFrame(paintAll)});
paintAll();
})();