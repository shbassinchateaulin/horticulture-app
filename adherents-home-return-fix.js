(()=>{
'use strict';
if(window.__adherentsHomeReturnFix)return;
window.__adherentsHomeReturnFix=true;
function forceAdherents(){
  const open=()=>{
    try{window.HorticultureAdherents?.open?.()}catch(e){console.warn('Adherents open',e)}
    const a=document.getElementById('adherentsAdmin');
    if(!a)return false;
    document.body.classList.remove('agWorkspaceMode');
    document.querySelectorAll('#appShell main.app > .view').forEach(v=>{
      const on=v===a;
      v.classList.toggle('active',on);
      v.hidden=false;
      v.style.setProperty('display',on?'block':'none','important');
      if(on){v.style.removeProperty('visibility');v.style.removeProperty('opacity')}
    });
    document.getElementById('drawer')?.classList.remove('open');
    return true;
  };
  open();
  [0,40,120,300,700].forEach(ms=>setTimeout(open,ms));
}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('[data-permission="adherents"],button');
  if(!b||!b.closest?.('#appShell'))return;
  const t=String(b.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  if(b.dataset?.permission!=='adherents'&&t!=='adherents'&&!t.startsWith('adherents '))return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation?.();
  forceAdherents();
},true);
window.HorticultureAdherentsReopen=forceAdherents;
})();
