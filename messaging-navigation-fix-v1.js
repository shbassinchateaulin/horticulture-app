(()=>{
'use strict';
if(window.__horticultureMessagingNavigationFixV6)return;
window.__horticultureMessagingNavigationFixV6=true;

const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const views=()=>[...document.querySelectorAll('#appShell main.app > .view')];

function closeDrawer(){
  const d=document.getElementById('drawer');
  if(!d)return;
  d.classList.remove('open');
  d.style.removeProperty('display');
}

function cleanViewStyle(v){
  if(!v)return;
  v.hidden=false;
  v.removeAttribute('hidden');
  v.style.removeProperty('display');
  v.style.removeProperty('visibility');
  v.style.removeProperty('opacity');
  v.style.removeProperty('pointer-events');
}

function forceMessagingVisible(){
  const m=document.getElementById('messaging');
  if(!m)return false;
  views().forEach(v=>v.classList.toggle('active',v===m));
  cleanViewStyle(m);
  document.body.classList.add('m6MessagingActive','messaging-open');
  closeDrawer();
  window.scrollTo(0,0);
  return true;
}

function showHome(){
  const home=document.getElementById('home');
  if(!home)return false;
  const m=document.getElementById('messaging');
  views().forEach(v=>v.classList.toggle('active',v===home));
  cleanViewStyle(home);
  if(m){
    m.classList.remove('active');
    m.style.removeProperty('display');
    m.style.removeProperty('visibility');
    m.style.removeProperty('opacity');
    m.style.removeProperty('pointer-events');
  }
  document.body.classList.remove('m6MessagingActive','m6KeyboardOpen','messaging-open');
  closeDrawer();
  window.scrollTo(0,0);
  return true;
}

function openMessaging(){
  try{
    const fn=window.HorticultureMessaging?.open;
    if(typeof fn==='function'){
      const result=fn();
      /* Le rendu du module est synchrone avant sa requête réseau. */
      forceMessagingVisible();
      requestAnimationFrame(forceMessagingVisible);
      Promise.resolve(result).catch(e=>console.warn('Ouverture Messagerie',e));
      return true;
    }
  }catch(e){
    console.warn('Ouverture Messagerie',e);
  }
  return forceMessagingVisible();
}

function isMessagingControl(el){
  if(!el)return null;
  const direct=el.closest?.('[data-module="messaging"],[data-permission="messaging"]');
  if(direct&&direct.closest('#appShell')&&!direct.closest('#messaging'))return direct;
  const tile=el.closest?.('#home button,#home .space,#home .dashTile,#drawer .dlist button,.moduleTile,.dashboardTile');
  if(!tile||tile.closest('#messaging'))return null;
  return norm(tile.textContent).includes('messagerie')?tile:null;
}

/*
 * Un seul gestionnaire délégué, en capture.
 * Il est chargé avant le contrôleur du tiroir : aucun deuxième gestionnaire
 * ne peut voler le clic sur Mac/PC après un retour à l'accueil.
 */
document.addEventListener('click',e=>{
  const back=e.target.closest?.('#messaging .m6Home');
  if(back){
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    showHome();
    return;
  }
  const target=isMessagingControl(e.target);
  if(!target)return;
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  openMessaging();
},true);

['messagingNavigationFixV1Style','messagingNavigationFixV2Style','messagingNavigationFixV3Style','messagingNavigationFixV4Style','messagingNavigationFixV5Style']
  .forEach(id=>document.getElementById(id)?.remove());
const style=document.createElement('style');
style.id='messagingNavigationFixV6Style';
style.textContent=`
#messaging .m6Home{width:auto!important;min-width:78px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;padding:8px 11px 8px 7px!important}
#messaging .m6Home::after{content:'Retour';font-size:12px;font-weight:800;line-height:1;color:currentColor}
#messaging .m6Home svg{width:18px!important;height:18px!important;flex:0 0 18px!important;stroke-width:1.35!important}
`;
document.head.appendChild(style);

window.HorticultureMessagingNavigation={showHome,openMessaging,forceMessagingVisible};
})();