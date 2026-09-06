(()=>{
'use strict';
if(window.__horticultureMessagingNavigationFixV7)return;
window.__horticultureMessagingNavigationFixV7=true;

const ROUTE_KEY='horticulture-messaging-route-v1';
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const views=()=>[...document.querySelectorAll('#appShell main.app > .view')];
let enforcing=false,opening=false,observer=null;

function wanted(){try{return sessionStorage.getItem(ROUTE_KEY)==='messaging'}catch(_){return false}}
function setWanted(on){try{on?sessionStorage.setItem(ROUTE_KEY,'messaging'):sessionStorage.removeItem(ROUTE_KEY)}catch(_){}}
function closeDrawer(){const d=document.getElementById('drawer');if(!d)return;d.classList.remove('open');d.style.removeProperty('display')}
function cleanViewStyle(v){if(!v)return;v.hidden=false;v.removeAttribute('hidden');v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')}

function syncExternalRoute(route){
  const nav=window.HorticultureNavigation;
  if(!nav)return;
  try{
    if(route==='messaging'&&typeof nav.openRoute==='function')nav.openRoute('messaging');
    else if(route==='home'&&typeof nav.openHome==='function')nav.openHome();
    else if(route==='home'&&typeof nav.home==='function')nav.home();
  }catch(e){console.warn('Synchronisation navigation Messagerie',e)}
}

function forceMessagingVisible(){
  const m=document.getElementById('messaging');
  if(!m)return false;
  enforcing=true;
  views().forEach(v=>v.classList.toggle('active',v===m));
  cleanViewStyle(m);
  document.body.classList.add('m6MessagingActive','messaging-open');
  closeDrawer();
  window.scrollTo(0,0);
  enforcing=false;
  return true;
}

function showHome(){
  setWanted(false);
  const home=document.getElementById('home');
  if(!home)return false;
  enforcing=true;
  const m=document.getElementById('messaging');
  views().forEach(v=>v.classList.toggle('active',v===home));
  cleanViewStyle(home);
  if(m){m.classList.remove('active');m.style.removeProperty('display');m.style.removeProperty('visibility');m.style.removeProperty('opacity');m.style.removeProperty('pointer-events')}
  document.body.classList.remove('m6MessagingActive','m6KeyboardOpen','messaging-open');
  closeDrawer();
  window.scrollTo(0,0);
  enforcing=false;
  syncExternalRoute('home');
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
  syncExternalRoute('messaging');
  [0,20,60,140,300,650,1200].forEach(ms=>setTimeout(()=>{if(wanted())forceMessagingVisible()},ms));
  Promise.resolve(result).catch(e=>console.warn('Ouverture Messagerie',e)).finally(()=>{opening=false});
  if(result===undefined)setTimeout(()=>{opening=false},250);
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
  if(home&&wanted()){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();showHome();return;
  }
  const target=isMessagingControl(e.target);
  if(target){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openMessaging();return;
  }
  if(isLeavingMessaging(e.target)){
    setWanted(false);
    document.body.classList.remove('m6MessagingActive','m6KeyboardOpen','messaging-open');
  }
},true);

function enforce(){
  if(!wanted()||enforcing)return;
  const m=document.getElementById('messaging');
  if(!m||!m.querySelector('.m6Shell')){
    if(typeof window.HorticultureMessaging?.open==='function')openMessaging();
    return;
  }
  const active=m.classList.contains('active')&&getComputedStyle(m).display!=='none';
  if(!active){forceMessagingVisible();syncExternalRoute('messaging')}
}

function observe(){
  const main=document.querySelector('#appShell main.app');
  if(!main){setTimeout(observe,100);return}
  if(observer)return;
  observer=new MutationObserver(()=>queueMicrotask(enforce));
  observer.observe(main,{subtree:false,childList:true,attributes:true,attributeFilter:['class','style','hidden']});
  enforce();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',observe,{once:true});else observe();
window.addEventListener('pageshow',enforce);window.addEventListener('focus',enforce);
setInterval(enforce,400);

['messagingNavigationFixV1Style','messagingNavigationFixV2Style','messagingNavigationFixV3Style','messagingNavigationFixV4Style','messagingNavigationFixV5Style','messagingNavigationFixV6Style'].forEach(id=>document.getElementById(id)?.remove());
const style=document.createElement('style');style.id='messagingNavigationFixV7Style';style.textContent=`
#messaging .m6Home{width:auto!important;min-width:78px!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;padding:8px 11px 8px 7px!important}
#messaging .m6Home::after{content:'Retour';font-size:12px;font-weight:800;line-height:1;color:currentColor}
#messaging .m6Home svg{width:18px!important;height:18px!important;flex:0 0 18px!important;stroke-width:1.35!important}
`;
document.head.appendChild(style);
window.HorticultureMessagingNavigation={showHome,openMessaging,forceMessagingVisible,enforce};
})();