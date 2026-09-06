(()=>{
'use strict';
if(window.__horticultureDrawerIconsSanitizeV1)return;window.__horticultureDrawerIconsSanitizeV1=true;
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
function canonical(btn){
  const p=norm(btn.dataset?.permission),m=norm(btn.dataset?.module),g=norm(btn.dataset?.go),t=norm(btn.textContent);
  if(g==='home'||t.includes('accueil'))return'Accueil';
  if(p==='sorties'||t.includes('sortie'))return'Sorties';
  if(p==='adherents'||m==='adherents'||t.includes('adherent'))return'Adhérents';
  if(p==='comptabilite'||t.includes('comptabil')||t.includes('paiement'))return'Comptabilité';
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
  const only=btn.children.length===1&&btn.firstElementChild?.classList.contains('drawerCleanLabel')&&btn.firstElementChild.textContent===label;
  if(!only){const s=document.createElement('span');s.className='drawerCleanLabel';s.textContent=label;btn.replaceChildren(s)}
  btn.querySelectorAll('svg,img,i,.drawerI,[class*="icon"],[class*="Icon"]').forEach(x=>{if(!x.classList.contains('drawerCleanLabel'))x.remove()});
}
function apply(){document.querySelectorAll('#drawer .dlist button,#drawer .dlist a').forEach(cleanButton)}
const style=document.createElement('style');style.id='drawer-icons-sanitize-v1-style';style.textContent=`#drawer .dlist button,#drawer .dlist a{overflow:hidden!important}#drawer .drawerCleanLabel{display:block!important;font-size:inherit!important;line-height:1.2!important;color:inherit!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}#drawer .dlist button>svg,#drawer .dlist button>img,#drawer .dlist button>i,#drawer .dlist a>svg,#drawer .dlist a>img,#drawer .dlist a>i{display:none!important;max-width:0!important;max-height:0!important}`;document.head.appendChild(style);
apply();setTimeout(apply,80);setTimeout(apply,300);setTimeout(apply,900);
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}).observe(document.getElementById('drawer')||document.body,{subtree:true,childList:true});
})();