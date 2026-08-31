(()=>{
'use strict';
if(window.__horticultureExclusiveNavigationV1)return;
window.__horticultureExclusiveNavigationV1=true;

const main=()=>document.querySelector('#appShell main.app');
const allViews=()=>[...document.querySelectorAll('#appShell .view')];
const adherents=()=>document.getElementById('adherentsAdmin');
const home=()=>document.getElementById('home');
const drawer=()=>document.getElementById('drawer');

function showOnly(target){
  if(!target)return;
  allViews().forEach(v=>v.classList.toggle('active',v===target));
  if(target===home())document.querySelectorAll('#appShell .bottom .nav').forEach(n=>n.classList.toggle('active',n.dataset.go==='home'));
  else document.querySelectorAll('#appShell .bottom .nav').forEach(n=>n.classList.remove('active'));
}
function closeDrawer(){drawer()?.classList.remove('open')}
function openDrawer(){const d=drawer();if(!d)return;d.classList.add('open');d.style.removeProperty('display')}
function resetDynamicUi(){
  document.querySelectorAll('.aa-modalBack,.aa-ir-back,[class*="modalBack"],[class*="ModalBack"]').forEach(x=>x.remove());
  document.querySelectorAll('#appShell .view').forEach(v=>{if(v!==home())v.classList.remove('active')});
}
function openHome(){
  try{sessionStorage.removeItem('horticulture-active-view-v1')}catch(_){}
  resetDynamicUi();
  showOnly(home());
  closeDrawer();
  window.scrollTo(0,0);
}
function openAdherents(){
  resetDynamicUi();
  const fn=window.HorticultureAdherents?.open;
  if(typeof fn==='function')fn();
  const root=adherents();
  if(root){try{sessionStorage.setItem('horticulture-active-view-v1','adherents')}catch(_){}showOnly(root);closeDrawer();window.scrollTo(0,0)}
}
function isAdherentsButton(el){const b=el?.closest?.('[data-permission="adherents"],button');if(!b)return false;if(String(b.dataset?.permission||'').toLowerCase()==='adherents')return true;return !!b.closest?.('.dlist')&&/adh[eé]rents/i.test(b.textContent||'')}
function isHomeLogo(el){const brand=el?.closest?.('.admBrand');if(brand)return true;const img=el?.closest?.('img');return !!img?.closest?.('#appShell')&&/logo-admin/i.test(img.getAttribute('src')||'')}
function isMenuButton(el){const b=el?.closest?.('#menu,.menuBtn');return !!b&&!!b.closest?.('#appShell')}
function wireDrawerAdherents(){const d=drawer();if(!d)return;const btn=[...d.querySelectorAll('.dlist button')].find(b=>/adh[eé]rents/i.test(b.textContent||''));if(btn){btn.dataset.permission='adherents';btn.dataset.module='adherents'}}

document.addEventListener('click',e=>{
  if(isMenuButton(e.target)){e.preventDefault();e.stopImmediatePropagation();const d=drawer();d?.classList.contains('open')?closeDrawer():openDrawer();return}
  if(isHomeLogo(e.target)){e.preventDefault();e.stopImmediatePropagation();openHome();return}
  if(isAdherentsButton(e.target)){e.preventDefault();e.stopImmediatePropagation();openAdherents();return}
  const go=e.target.closest?.('[data-go]');if(go&&go.dataset.go==='home')queueMicrotask(openHome);
  const d=drawer();if(d&&e.target===d)closeDrawer();
},true);

const style=document.createElement('style');style.id='exclusive-navigation-style-v1';style.textContent=`#appShell .view:not(.active){display:none!important}#appShell #home.active{display:block!important}#appShell #adherentsAdmin.active{display:block!important}#drawer.open{display:block!important}`;document.head.appendChild(style);

function repair(){
  wireDrawerAdherents();
  const active=allViews().filter(v=>v.classList.contains('active'));
  if(active.length<=1)return;
  let stored='';try{stored=sessionStorage.getItem('horticulture-active-view-v1')||''}catch(_){}
  const wanted=stored==='adherents'?adherents():active.find(v=>v!==home())||home();
  showOnly(wanted||home());
}
function observe(){const shell=document.getElementById('appShell');if(!shell){setTimeout(observe,100);return}new MutationObserver(repair).observe(shell,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});repair()}
observe();window.addEventListener('pageshow',repair);window.addEventListener('focus',repair);
})();
