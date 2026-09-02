(()=>{
'use strict';
if(window.__sortiesAttendanceCoherenceV1)return;window.__sortiesAttendanceCoherenceV1=true;
const STORE='horticulture-sorties-safe-v2',CACHE='horticulture-sorties-attendance-cache';
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function cache(){try{const x=JSON.parse(localStorage.getItem(CACHE)||'{}');return x&&typeof x==='object'?x:{}}catch(_){return{}}}
function valid(st){return ['present','late','absent','pending'].includes(st)}
function reconcile(){
  const all=rows(),c=cache();let changed=false;
  all.forEach(s=>{
    if(!s||s.id==null)return;
    const sid=String(s.id);c[sid]=c[sid]&&typeof c[sid]==='object'?c[sid]:{};
    (s.participants||[]).forEach(p=>{
      if(!p||p.id==null)return;
      let st='';
      if(valid(p.attendanceStatus))st=p.attendanceStatus;
      else if(p.present===true)st='present';
      if(!st)return;
      if(c[sid][p.id]!==st){c[sid][p.id]=st;changed=true;}
    });
  });
  if(changed)try{localStorage.setItem(CACHE,JSON.stringify(c))}catch(_){}
}
function reconcileBeforePdf(e){
  if(!e?.target?.closest?.('#sortiesAdmin [data-sfx-pdf]'))return;
  reconcile();
}
document.addEventListener('click',reconcileBeforePdf,true);
document.addEventListener('horticulture-sorties-attendance-changed',()=>setTimeout(reconcile,0));
window.addEventListener('storage',e=>{if(e.key===STORE)setTimeout(reconcile,0)});
reconcile();
})();