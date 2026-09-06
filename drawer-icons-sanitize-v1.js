(()=>{
'use strict';
if(window.__horticultureDrawerIconsSanitizeV3)return;
window.__horticultureDrawerIconsSanitizeV3=true;

const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

function canonical(btn){
  const p=norm(btn.dataset?.permission),m=norm(btn.dataset?.module),g=norm(btn.dataset?.go),t=norm(btn.textContent);
  if(g==='home'||t.includes('accueil'))return'Accueil';
  if(m==='messaging'||p==='messaging'||t.includes('messagerie'))return'Messagerie';
  if(p==='communication'||t.includes('actualit'))return'Actualités';
  if(p==='sorties'||m==='sorties'||t.includes('sortie'))return'Sorties';
  if(p==='adherents'||m==='adherents'||t.includes('adherent'))return'Adhérents';
  if(p==='comptabilite'||m==='comptabilite'||t.includes('comptabil')||t.includes('paiement'))return'Comptabilité';
  if(p==='suggestions'||m==='suggestions'||t.includes('suggestion'))return'Suggestions';
  if(m.includes('ag')||p.includes('ag')||t.includes('consultation ag')||t.includes('questionnaire'))return'Consultation AG';
  if(m.includes('documents')||t.includes('cloud')||t.includes('document'))return'Cloud Documents';
  if(p==='acces'||g==='access'||t.includes('gestion des acces'))return'Gestion des accès';
  if(t.includes('param'))return'Paramètres';
  if(t.includes('profil'))return'Mon profil';
  if(t.includes('deconn'))return'Déconnexion';
  return String(btn.textContent||'').replace(/^[^A-Za-zÀ-ÿ0-9]+\s*/,'').replace(/\s+/g,' ').trim();
}

function cleanButton(btn){
  const label=canonical(btn);if(!label)return;
  const only=btn.children.length===1&&btn.firstElementChild?.classList.contains('drawerCleanLabel')&&btn.firstElementChild.textContent===label&&[...btn.childNodes].every(n=>n.nodeType!==3||!n.textContent.trim());
  if(!only){
    const span=document.createElement('span');span.className='drawerCleanLabel';span.textContent=label;btn.replaceChildren(span);
  }
  btn.dataset.drawerSanitized='1';
}

function apply(){
  const list=document.querySelector('#drawer .dlist');if(!list)return;
  list.querySelectorAll(':scope > svg,:scope > img,:scope > i,:scope > .drawerI').forEach(x=>x.remove());
  list.querySelectorAll('button,a').forEach(cleanButton);
}

['drawer-icons-sanitize-v1-style','drawer-icons-sanitize-v2-style','drawer-icons-sanitize-v3-style','drawer-icons-style'].forEach(id=>document.getElementById(id)?.remove());
const style=document.createElement('style');style.id='drawer-icons-sanitize-v3-style';style.textContent=`
#drawer .dlist{overflow-y:auto!important;overflow-x:hidden!important}
#drawer .dlist button,#drawer .dlist a{position:relative!important;width:100%!important;height:52px!important;min-height:52px!important;max-height:52px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;overflow:hidden!important;padding-top:0!important;padding-bottom:0!important;white-space:nowrap!important}
#drawer .drawerCleanLabel{display:block!important;min-width:0!important;margin:0!important;padding:0!important;font-size:inherit!important;line-height:1.2!important;color:inherit!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
#drawer .dlist button>svg,#drawer .dlist button>img,#drawer .dlist button>i,#drawer .dlist a>svg,#drawer .dlist a>img,#drawer .dlist a>i,#drawer .dlist .drawerI{display:none!important;width:0!important;height:0!important;max-width:0!important;max-height:0!important}
#drawer .dlist button::after,#drawer .dlist a::after{content:none!important;display:none!important}
`;
document.head.appendChild(style);

apply();
[80,250,700,1600].forEach(ms=>setTimeout(apply,ms));
document.addEventListener('click',e=>{if(e.target.closest?.('#menu,.menuBtn'))setTimeout(apply,0)},true);
window.addEventListener('pageshow',()=>setTimeout(apply,0));
window.addEventListener('focus',()=>setTimeout(apply,0));
window.addEventListener('horticulture-users-synced',()=>setTimeout(apply,30));
})();