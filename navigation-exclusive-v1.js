(()=>{
'use strict';
if(window.__horticultureExclusiveNavigationV1)return;
window.__horticultureExclusiveNavigationV1=true;

const main=()=>document.querySelector('#appShell main.app');
const views=()=>[...(main()?.querySelectorAll(':scope > .view')||[])];
const adherents=()=>document.getElementById('adherentsAdmin');
const home=()=>document.getElementById('home');

function showOnly(target){
  if(!target)return;
  views().forEach(v=>v.classList.toggle('active',v===target));
  if(target===home()){
    document.querySelectorAll('#appShell .bottom .nav').forEach(n=>n.classList.toggle('active',n.dataset.go==='home'));
  }else{
    document.querySelectorAll('#appShell .bottom .nav').forEach(n=>n.classList.remove('active'));
  }
  document.getElementById('drawer')?.classList.remove('open');
}

function openHome(){
  try{sessionStorage.removeItem('horticulture-active-view-v1')}catch(_){ }
  document.querySelectorAll('.aa-modalBack,.aa-ir-back').forEach(x=>x.remove());
  showOnly(home());
  scrollTo(0,0);
}

function openAdherents(){
  const fn=window.HorticultureAdherents?.open;
  if(typeof fn==='function')fn();
  const root=adherents();
  if(root){
    try{sessionStorage.setItem('horticulture-active-view-v1','adherents')}catch(_){ }
    showOnly(root);
    scrollTo(0,0);
  }
}

function isAdherentsButton(el){
  const b=el?.closest?.('[data-permission="adherents"],button');
  if(!b)return false;
  if(String(b.dataset?.permission||'').toLowerCase()==='adherents')return true;
  return b.closest?.('.dlist') && /adh[eé]rents/i.test(b.textContent||'');
}

function isHomeLogo(el){
  const brand=el?.closest?.('.admBrand');
  if(brand)return true;
  const img=el?.closest?.('img');
  if(!img||!img.closest?.('#appShell'))return false;
  return /logo-admin/i.test(img.getAttribute('src')||'');
}

// Capture avant les anciens gestionnaires : une vue ne peut jamais rester empilée sur une autre.
document.addEventListener('click',e=>{
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
  if(go && go.dataset.go==='home'){
    queueMicrotask(openHome);
  }
},true);

// Barrière CSS + réparation DOM : même si un ancien script remet deux .active, on corrige immédiatement.
const style=document.createElement('style');
style.id='exclusive-navigation-style-v1';
style.textContent=`#appShell main.app:has(> #adherentsAdmin.active) > .view:not(#adherentsAdmin){display:none!important}#appShell main.app:has(> #home.active) > #adherentsAdmin{display:none!important}`;
document.head.appendChild(style);

function repair(){
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
  repair();
}
observe();
window.addEventListener('pageshow',repair);
window.addEventListener('focus',repair);
})();
