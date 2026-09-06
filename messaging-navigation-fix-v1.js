(()=>{
'use strict';
if(window.__horticultureMessagingNavigationFixV1)return;window.__horticultureMessagingNavigationFixV1=true;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const views=()=>[...document.querySelectorAll('#appShell main.app > .view')];
function clearMessagingState(){
  document.body.classList.remove('m6MessagingActive','m6KeyboardOpen');
  document.documentElement.style.removeProperty('--m6-vtop');
  const m=document.getElementById('messaging');
  if(m)m.classList.remove('active');
}
function showHome(){
  clearMessagingState();
  const home=document.getElementById('home');
  if(!home)return false;
  views().forEach(v=>v.classList.toggle('active',v===home));
  home.hidden=false;
  home.style.removeProperty('display');home.style.removeProperty('visibility');home.style.removeProperty('opacity');home.style.removeProperty('pointer-events');
  document.getElementById('drawer')?.classList.remove('open');
  window.scrollTo(0,0);
  window.dispatchEvent(new CustomEvent('horticulture-home-restored'));
  return true;
}
function forceMessagingVisible(){
  const m=document.getElementById('messaging');if(!m)return false;
  views().forEach(v=>v.classList.toggle('active',v===m));
  m.hidden=false;m.style.removeProperty('display');m.style.removeProperty('visibility');m.style.removeProperty('opacity');m.style.removeProperty('pointer-events');
  document.body.classList.add('m6MessagingActive');
  document.getElementById('drawer')?.classList.remove('open');
  return true;
}
function openMessaging(){
  let tries=0;
  const run=()=>{
    tries++;
    try{window.HorticultureMessaging?.open?.()}catch(e){console.warn('Ouverture Messagerie',e)}
    if(forceMessagingVisible())return;
    if(tries<20)setTimeout(run,50);
  };
  run();
}
function isHomeControl(el){
  if(!el)return false;
  if(el.closest?.('#messaging .m6Home'))return true;
  const btn=el.closest?.('button,[data-go],[data-view],a');if(!btn)return false;
  const inNav=!!btn.closest?.('#drawer,.bottom,.bottomNav,.mobileNav,#appShell>.bottom');
  const go=norm(btn.dataset?.go||btn.dataset?.view||'');
  const label=norm(btn.textContent);
  return inNav&&(go==='home'||label==='accueil'||label.startsWith('accueil '));
}
function isMessagingControl(el){
  const btn=el?.closest?.('[data-module="messaging"],[data-permission="messaging"]');
  return btn&&btn.closest('#appShell')&&!btn.closest('#messaging');
}
document.addEventListener('click',e=>{
  if(isHomeControl(e.target)){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showHome();return;
  }
  if(isMessagingControl(e.target)){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMessaging();return;
  }
},true);
const style=document.createElement('style');style.id='messagingNavigationFixV1Style';style.textContent=`
#messaging .m6Home{width:auto!important;min-width:72px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:5px!important;padding:8px 10px 8px 7px!important}
#messaging .m6Home::after{content:'Retour';font-size:12px;font-weight:800;line-height:1;color:currentColor}
#messaging .m6Home svg{width:18px!important;height:18px!important;flex:0 0 18px!important;stroke-width:1.35!important}
`;
document.head.appendChild(style);
window.HorticultureMessagingNavigation={showHome,openMessaging,forceMessagingVisible,clearMessagingState};
})();