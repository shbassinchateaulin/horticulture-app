(()=>{
'use strict';
if(window.__horticultureExclusiveNavigationV1)return;
window.__horticultureExclusiveNavigationV1=true;

const main=()=>document.querySelector('#appShell main.app');
const views=()=>[...(main()?.querySelectorAll(':scope > .view')||[])];
const adherents=()=>document.getElementById('adherentsAdmin');
const home=()=>document.getElementById('home');
const drawer=()=>document.getElementById('drawer');

function showOnly(target){
  if(!target)return;
  views().forEach(v=>v.classList.toggle('active',v===target));
  if(target===home()){
    document.querySelectorAll('#appShell .bottom .nav').forEach(n=>n.classList.toggle('active',n.dataset.go==='home'));
  }else{
    document.querySelectorAll('#appShell .bottom .nav').forEach(n=>n.classList.remove('active'));
  }
}

function closeDrawer(){drawer()?.classList.remove('open')}
function openDrawer(){
  const d=drawer();
  if(!d)return;
  d.classList.add('open');
  d.style.removeProperty('display');
}

function openHome(){
  try{sessionStorage.removeItem('horticulture-active-view-v1')}catch(_){ }
  document.querySelectorAll('.aa-modalBack,.aa-ir-back').forEach(x=>x.remove());
  showOnly(home());
  closeDrawer();
  scrollTo(0,0);
}

function openAdherents(){
  const fn=window.HorticultureAdherents?.open;
  if(typeof fn==='function')fn();
  const root=adherents();
  if(root){
    try{sessionStorage.setItem('horticulture-active-view-v1','adherents')}catch(_){ }
    showOnly(root);
    closeDrawer();
    scrollTo(0,0);
  }
}

function isAdherentsButton(el){
  const b=el?.closest?.('[data-permission="adherents"],button');
  if(!b)return false;
  if(String(b.dataset?.permission||'').toLowerCase()==='adherents')return true;
  return !!b.closest?.('.dlist') && /adh[eé]rents/i.test(b.textContent||'');
}

function isHomeLogo(el){
  const brand=el?.closest?.('.admBrand');
  if(brand)return true;
  const img=el?.closest?.('img');
  if(!img||!img.closest?.('#appShell'))return false;
  return /logo-admin/i.test(img.getAttribute('src')||'');
}

function isMenuButton(el){
  const b=el?.closest?.('#menu,.menuBtn');
  return !!b && !!b.closest?.('#appShell');
}

function wireDrawerAdherents(){
  const d=drawer();
  if(!d)return;
  const btn=[...d.querySelectorAll('.dlist button')].find(b=>/adh[eé]rents/i.test(b.textContent||''));
  if(!btn)return;
  btn.dataset.permission='adherents';
  btn.dataset.module='adherents';
}

// Gestion centralisée du menu et de la navigation Adhérents.
document.addEventListener('click',e=>{
  if(isMenuButton(e.target)){
    e.preventDefault();
    e.stopImmediatePropagation();
    const d=drawer();
    if(d?.classList.contains('open'))closeDrawer();else openDrawer();
    return;
  }
  if(isHomeLogo(e.target)){
    e.preventDefault();
    e.stopImmediatePropagation();
    openHome();
    return;
  }
  if(isAdherentsButton(e.target)){
    e.preventDefault();
    e.stopImmediatePropagation();
    openAdherents();
    return;
  }
  const go=e.target.closest?.('[data-go]');
  if(go && go.dataset.go==='home')queueMicrotask(openHome);
  const d=drawer();
  if(d && e.target===d)closeDrawer();
},true);

const style=document.createElement('style');
style.id='exclusive-navigation-style-v1';
style.textContent=`#appShell main.app:has(> #adherentsAdmin.active) > .view:not(#adherentsAdmin){display:none!important}#appShell main.app:has(> #home.active) > #adherentsAdmin{display:none!important}#drawer.open{display:block!important}`;
document.head.appendChild(style);

function repair(){
  wireDrawerAdherents();
  const a=adherents(),h=home();
  if(!a||!h)return;
  if(a.classList.contains('active')&&h.classList.contains('active')){
    let stored='';try{stored=sessionStorage.getItem('horticulture-active-view-v1')||''}catch(_){ }
    showOnly(stored==='adherents'?a:h);
  }
}

function observe(){
  const m=main();
  if(!m){setTimeout(observe,100);return}
  new MutationObserver(repair).observe(m,{subtree:false,attributes:true,attributeFilter:['class']});
  new MutationObserver(repair).observe(m,{childList:true,subtree:false});
  const d=drawer();
  if(d)new MutationObserver(wireDrawerAdherents).observe(d,{childList:true,subtree:true});
  repair();
}
observe();
window.addEventListener('pageshow',repair);
window.addEventListener('focus',repair);
})();
