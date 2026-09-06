(()=>{
'use strict';
if(window.__horticultureMessagingNavigationFixV3)return;window.__horticultureMessagingNavigationFixV3=true;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const views=()=>[...document.querySelectorAll('#appShell main.app > .view')];
let lockUntil=0,enforcing=false;
function clearMessagingState(){
  document.body.classList.remove('m6MessagingActive','m6KeyboardOpen');
  document.documentElement.style.removeProperty('--m6-vtop');
  const m=document.getElementById('messaging');
  if(m){m.classList.remove('active');m.style.removeProperty('display');m.style.removeProperty('visibility');m.style.removeProperty('opacity');m.style.removeProperty('pointer-events')}
}
function showHome(){
  lockUntil=0;
  clearMessagingState();
  const home=document.getElementById('home');if(!home)return false;
  views().forEach(v=>v.classList.toggle('active',v===home));
  home.hidden=false;home.removeAttribute('hidden');
  home.style.removeProperty('display');home.style.removeProperty('visibility');home.style.removeProperty('opacity');home.style.removeProperty('pointer-events');
  document.getElementById('drawer')?.classList.remove('open');
  window.scrollTo(0,0);
  requestAnimationFrame(()=>window.dispatchEvent(new CustomEvent('horticulture-home-restored')));
  return true;
}
function forceMessagingVisible(){
  const m=document.getElementById('messaging');if(!m)return false;
  views().forEach(v=>v.classList.toggle('active',v===m));
  m.hidden=false;m.removeAttribute('hidden');
  m.style.removeProperty('display');m.style.removeProperty('visibility');m.style.removeProperty('opacity');m.style.removeProperty('pointer-events');
  document.body.classList.add('m6MessagingActive');
  document.getElementById('drawer')?.classList.remove('open');
  window.scrollTo(0,0);
  return true;
}
function openMessaging(){
  lockUntil=Date.now()+950;
  const existed=forceMessagingVisible();
  try{
    const result=window.HorticultureMessaging?.open?.();
    Promise.resolve(result).catch(e=>console.warn('Ouverture Messagerie',e));
  }catch(e){console.warn('Ouverture Messagerie',e)}
  [0,20,60,120,250,500,850].forEach(ms=>setTimeout(()=>{if(Date.now()<=lockUntil)forceMessagingVisible()},ms));
  if(!existed){
    let tries=0;
    const wait=()=>{
      if(forceMessagingVisible())return;
      if(++tries<30)setTimeout(wait,40)
    };
    wait();
  }
  return true;
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
  if(btn&&btn.closest('#appShell')&&!btn.closest('#messaging'))return btn;
  const tile=el?.closest?.('#home button,#home .space,#home .dashTile,#drawer .dlist button');
  if(!tile)return null;
  return norm(tile.textContent).includes('messagerie')?tile:null;
}
document.addEventListener('click',e=>{
  if(isHomeControl(e.target)){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showHome();return;
  }
  if(isMessagingControl(e.target)){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMessaging();return;
  }
},true);
new MutationObserver(()=>{
  if(Date.now()>lockUntil||enforcing)return;
  const m=document.getElementById('messaging');
  if(!m||m.classList.contains('active'))return;
  enforcing=true;
  requestAnimationFrame(()=>{forceMessagingVisible();enforcing=false})
}).observe(document.getElementById('appShell')||document.body,{subtree:true,attributes:true,attributeFilter:['class','hidden']});
['messagingNavigationFixV1Style','messagingNavigationFixV2Style'].forEach(id=>document.getElementById(id)?.remove());
const style=document.createElement('style');style.id='messagingNavigationFixV3Style';style.textContent=`
#messaging .m6Home{width:auto!important;min-width:76px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;padding:8px 11px 8px 7px!important}
#messaging .m6Home::after{content:'Retour';font-size:12px;font-weight:800;line-height:1;color:currentColor}
#messaging .m6Home svg{width:18px!important;height:18px!important;flex:0 0 18px!important;stroke-width:1.35!important}
`;
document.head.appendChild(style);
window.HorticultureMessagingNavigation={showHome,openMessaging,forceMessagingVisible,clearMessagingState};
})();