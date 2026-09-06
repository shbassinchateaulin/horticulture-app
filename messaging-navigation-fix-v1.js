(()=>{
'use strict';
if(window.__horticultureMessagingNavigationFixV10)return;
window.__horticultureMessagingNavigationFixV10=true;

const ROUTE_KEY='horticulture-messaging-route-v1';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const views=()=>[...document.querySelectorAll('#appShell main.app > .view')];
let opening=false;

function wanted(){try{return sessionStorage.getItem(ROUTE_KEY)==='messaging'}catch(_){return false}}
function setWanted(on){try{on?sessionStorage.setItem(ROUTE_KEY,'messaging'):sessionStorage.removeItem(ROUTE_KEY)}catch(_){}}
function closeDrawer(){const d=document.getElementById('drawer');if(!d)return;d.classList.remove('open');d.style.removeProperty('display')}
function clearLegacyInline(v){if(!v)return;['display','visibility','opacity','pointer-events'].forEach(p=>v.style.removeProperty(p));v.hidden=false;v.removeAttribute('hidden')}

function activate(target){
  if(!target)return false;
  for(const v of views()){
    const on=v===target;
    v.classList.toggle('active',on);
    clearLegacyInline(v);
  }
  return true;
}

function forceMessagingVisible(){
  const m=document.getElementById('messaging');
  if(!m)return false;
  activate(m);
  document.body.classList.add('m6MessagingActive','messaging-open');
  closeDrawer();
  window.scrollTo(0,0);
  return true;
}

function forceHomeVisible(){
  const home=document.getElementById('home');
  if(!home)return false;
  activate(home);
  const m=document.getElementById('messaging');
  if(m){m.classList.remove('active');clearLegacyInline(m)}
  document.body.classList.remove('m6MessagingActive','m6KeyboardOpen','messaging-open');
  closeDrawer();
  window.scrollTo(0,0);
  return true;
}

function showHome(){
  setWanted(false);
  opening=false;
  forceHomeVisible();
  requestAnimationFrame(forceHomeVisible);
  setTimeout(forceHomeVisible,60);
  return true;
}

function openMessaging(){
  setWanted(true);
  if(opening){forceMessagingVisible();return true}
  opening=true;
  let result;
  try{
    const fn=window.HorticultureMessaging?.open;
    if(typeof fn==='function')result=fn();
  }catch(e){console.warn('Ouverture Messagerie',e)}
  forceMessagingVisible();
  requestAnimationFrame(()=>{if(wanted())forceMessagingVisible()});
  [60,180,450].forEach(ms=>setTimeout(()=>{if(wanted())forceMessagingVisible()},ms));
  Promise.resolve(result).catch(e=>console.warn('Ouverture Messagerie',e)).finally(()=>{opening=false});
  if(result===undefined)setTimeout(()=>{opening=false},180);
  return true;
}

function isMessagingControl(el){
  if(!el)return null;
  const direct=el.closest?.('[data-module="messaging"],[data-permission="messaging"]');
  if(direct&&direct.closest('#appShell')&&!direct.closest('#messaging'))return direct;
  const tile=el.closest?.('#home button,#home .space,#home .dashTile,#drawer .dlist button,.moduleTile,.dashboardTile');
  if(!tile||tile.closest('#messaging'))return null;
  return norm(tile.textContent).includes('messagerie')?tile:null;
}

function isHomeControl(el){
  if(!el)return null;
  const back=el.closest?.('#messaging .m6Home');if(back)return back;
  const brand=el.closest?.('.admBrand');if(brand&&brand.closest('#appShell'))return brand;
  const btn=el.closest?.('[data-go="home"],#drawer .dlist button,.bottom .nav');
  if(!btn||!btn.closest('#appShell'))return null;
  const go=norm(btn.dataset?.go||''),label=norm(btn.textContent);
  return go==='home'||label==='accueil'||label.startsWith('accueil ')?btn:null;
}

function isLeavingMessaging(el){
  if(!wanted()||!el)return false;
  if(isMessagingControl(el)||el.closest?.('#menu,.menuBtn,#messaging'))return false;
  return !!el.closest?.('#drawer .dlist button,.bottom .nav,[data-go],[data-module],[data-permission],.admBrand');
}

document.addEventListener('click',e=>{
  const home=isHomeControl(e.target);
  if(home){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showHome();return;
  }
  const target=isMessagingControl(e.target);
  if(target){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMessaging();return;
  }
  if(isLeavingMessaging(e.target)){
    setWanted(false);
    const m=document.getElementById('messaging');if(m)m.classList.remove('active');
    document.body.classList.remove('m6MessagingActive','m6KeyboardOpen','messaging-open');
  }
},true);

function restore(){
  if(!wanted())return false;
  const m=document.getElementById('messaging');
  if(m?.querySelector('.m6Shell')){forceMessagingVisible();return true}
  if(typeof window.HorticultureMessaging?.open==='function'&&!opening){openMessaging();return true}
  return false;
}

function bootRestore(){
  if(!wanted())return;
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(!wanted()||restore()||tries>=12)clearInterval(timer);
  },80);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootRestore,{once:true});else bootRestore();
window.addEventListener('pageshow',()=>{if(wanted())restore()},{once:true});

['messagingNavigationFixV1Style','messagingNavigationFixV2Style','messagingNavigationFixV3Style','messagingNavigationFixV4Style','messagingNavigationFixV5Style','messagingNavigationFixV6Style','messagingNavigationFixV7Style','messagingNavigationFixV8Style','messagingNavigationFixV9Style'].forEach(id=>document.getElementById(id)?.remove());
const style=document.createElement('style');style.id='messagingNavigationFixV10Style';style.textContent=`
#messaging .m6Home{width:auto!important;min-width:78px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;padding:8px 11px 8px 7px!important}
#messaging .m6Home::after{content:'Retour';font-size:12px;font-weight:800;line-height:1;color:currentColor}
#messaging .m6Home svg{width:18px!important;height:18px!important;flex:0 0 18px!important;stroke-width:1.35!important}
#messaging.view:not(.active){display:none!important;pointer-events:none!important}
#home.view.active~#messaging.view{display:none!important;pointer-events:none!important}
`;
document.head.appendChild(style);
window.HorticultureMessagingNavigation={showHome,openMessaging,forceMessagingVisible,forceHomeVisible,restore};
})();