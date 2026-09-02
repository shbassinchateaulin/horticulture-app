(()=>{
'use strict';
if(window.__sortiesPresenceFixV3)return;window.__sortiesPresenceFixV3=true;
const STORE='horticulture-sorties-safe-v2',CACHE='horticulture-sorties-attendance-cache';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const checkSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.4 2.5 4.8-5.2"/></svg>';
const trashSvg='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>';
function rows(){try{const a=JSON.parse(localStorage.getItem(STORE)||'[]');return Array.isArray(a)?a:[]}catch(_){return[]}}
function saveRows(a){try{localStorage.setItem(STORE,JSON.stringify(a))}catch(_){}}
function current(){const title=$('#sortiesAdmin .sfs-detailMain h2')?.textContent?.trim()||'';return rows().find(s=>String(s.title||'').trim()===title)||null}
function statusOf(s,p){try{const c=JSON.parse(localStorage.getItem(CACHE)||'{}');if(c?.[s.id]?.[p.id])return c[s.id][p.id]}catch(_){}return p.attendanceStatus||(p.present?'present':'pending')}
function setStatus(s,p,status){
  if(!s||!p||!['pending','present','late','absent'].includes(status))return false;
  p.attendanceStatus=status;
  p.present=status==='present'||status==='late';
  p.presentAt=p.present?new Date().toISOString():'';
  const a=rows(),ss=a.find(x=>String(x.id)===String(s.id)),pp=ss?.participants?.find(x=>String(x.id)===String(p.id));
  if(pp){
    pp.attendanceStatus=status;
    pp.present=p.present;
    pp.presentAt=p.presentAt;
    ss.history=ss.history||[];
    const action=status==='present'?'Présence validée':status==='late'?'Retard enregistré':status==='absent'?'Absence enregistrée':'Présence annulée';
    ss.history.unshift({date:new Date().toISOString(),text:action+' : '+[pp.firstName,pp.lastName].filter(Boolean).join(' ')});
    saveRows(a);
  }
  try{const c=JSON.parse(localStorage.getItem(CACHE)||'{}');c[s.id]=c[s.id]||{};c[s.id][p.id]=status;localStorage.setItem(CACHE,JSON.stringify(c))}catch(_){}
  document.dispatchEvent(new CustomEvent('horticulture-sorties-attendance-changed',{detail:{sortieId:s.id,participantId:p.id,status}}));
  return true;
}
function setStatusById(sortieId,participantId,status){
  const a=rows(),s=a.find(x=>String(x.id)===String(sortieId)),p=s?.participants?.find(x=>String(x.id)===String(participantId));
  if(!s||!p)return false;
  return setStatus(s,p,status);
}
window.HorticultureSortiesPresence={setStatusById,statusOf:(sortieId,participantId)=>{const a=rows(),s=a.find(x=>String(x.id)===String(sortieId)),p=s?.participants?.find(x=>String(x.id)===String(participantId));return s&&p?statusOf(s,p):'pending'}};
function closeModal(b){b?.remove();setTimeout(()=>document.dispatchEvent(new CustomEvent('horticulture-sorties-attendance-changed')),0)}
function modalFor(s,p){const old=$('[data-spf-modal]');if(old)old.remove();const st=statusOf(s,p),isPresent=st==='present';const b=document.createElement('div');b.className='sfs-modalBack spf-back';b.dataset.spfModal='1';b.innerHTML=`<div class="sfs-modal spf-modal"><h2>${esc(([p.firstName,p.lastName].filter(Boolean).join(' '))||'Participant')}</h2><div class="sfs-pick"><button class="sfs-pickBtn spf-present" data-spf-present><span><b>${isPresent?'Annuler la présence':'Marquer présent'}</b><small>Contrôle manuel</small></span><span class="spf-icon">${checkSvg}</span></button>${p.email?`<a class="sfs-pickBtn" href="mailto:${esc(p.email)}"><span><b>E-mail</b><small>${esc(p.email)}</small></span></a>`:''}${p.phone?`<a class="sfs-pickBtn" href="tel:${esc(p.phone)}"><span><b>Appeler</b><small>${esc(p.phone)}</small></span></a>`:''}<button class="sfs-pickBtn spf-remove" data-spf-remove><span><b>Retirer de la sortie</b><small>Cette action retire uniquement cette inscription.</small></span><span class="spf-icon">${trashSvg}</span></button></div><div class="sfs-modalActions"><button class="sfs-btn" data-spf-close>Fermer</button></div></div>`;document.body.appendChild(b);b.addEventListener('click',e=>{if(e.target===b||e.target.closest('[data-spf-close]'))closeModal(b)});$('[data-spf-present]',b).onclick=()=>{setStatus(s,p,isPresent?'pending':'present');closeModal(b)};$('[data-spf-remove]',b).onclick=()=>{if(!confirm('Retirer cette personne de la sortie ?'))return;const a=rows(),ss=a.find(x=>String(x.id)===String(s.id));if(ss){ss.participants=(ss.participants||[]).filter(x=>String(x.id)!==String(p.id));ss.history=ss.history||[];ss.history.unshift({date:new Date().toISOString(),text:'Participant retiré : '+[p.firstName,p.lastName].filter(Boolean).join(' ')});saveRows(a)}closeModal(b)};}
function injectCss(){if($('#spfStyleV3'))return;const s=document.createElement('style');s.id='spfStyleV3';s.textContent=`.spf-modal .sfs-pickBtn{min-height:60px}.spf-modal .spf-icon{width:32px;height:32px;border-radius:50%;background:#edf6f1;color:#07583f;display:grid;place-items:center;flex:0 0 32px}.spf-modal .spf-icon svg{width:17px!important;height:17px!important;min-width:17px!important;max-width:17px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}.spf-modal .spf-remove{color:#b42318}.spf-modal .spf-remove .spf-icon{background:#fff0ee;color:#b42318}`;document.head.appendChild(s)}
document.addEventListener('click',e=>{const bt=e.target.closest('#sortiesAdmin [data-person]');if(!bt)return;const s=current(),p=s?.participants?.find(x=>String(x.id)===String(bt.dataset.person));if(!s||!p)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();modalFor(s,p)},true);
injectCss();
})();