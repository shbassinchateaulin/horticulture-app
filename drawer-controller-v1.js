(()=>{
'use strict';
if(window.__horticultureDrawerControllerV1)return;
window.__horticultureDrawerControllerV1=true;

const drawer=()=>document.getElementById('drawer');
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

function open(){const d=drawer();if(!d)return;d.classList.add('open');d.style.setProperty('display','block','important')}
function close(){const d=drawer();if(!d)return;d.classList.remove('open');d.style.removeProperty('display')}
function toggle(){const d=drawer();if(!d)return;d.classList.contains('open')?close():open()}

function openAdherents(){
  close();
  const fn=window.HorticultureAdherents?.open;
  if(typeof fn==='function'){fn();return true}
  return false;
}

function clickMatchingHomeButton(source){
  const permission=String(source.dataset?.permission||'').toLowerCase();
  const label=norm(source.textContent);
  const candidates=[...document.querySelectorAll('#home button,.dashTile,.space')];
  let target=null;
  if(permission)target=candidates.find(b=>String(b.dataset?.permission||'').toLowerCase()===permission);
  if(!target)target=candidates.find(b=>norm(b.textContent).startsWith(label)||label.startsWith(norm(b.querySelector('b')?.textContent||'')));
  if(!target){
    const aliases={
      'actualites':'communication','actualite':'communication','sorties':'sorties','adherents':'adherents',
      'comptabilite':'comptabilite','suggestions':'suggestions','consultation ag':'ag','parametres':'parametres',
      'mon profil':'profil','gestion des acces':'acces','acces':'acces'
    };
    const key=Object.keys(aliases).find(k=>label.includes(k));
    if(key)target=candidates.find(b=>String(b.dataset?.permission||'').toLowerCase()===aliases[key]||norm(b.textContent).includes(key));
  }
  if(!target)return false;
  close();
  setTimeout(()=>target.click(),0);
  return true;
}

function routeDrawerButton(btn){
  const label=norm(btn.textContent);
  if(/adh[eé]rent/.test(btn.textContent||'')||label.includes('adherent'))return openAdherents();
  if(label.includes('accueil')){
    close();
    const brand=document.querySelector('.admBrand');
    if(brand){setTimeout(()=>brand.click(),0);return true}
    const homeBtn=document.querySelector('[data-go="home"]');
    if(homeBtn){setTimeout(()=>homeBtn.click(),0);return true}
  }
  return clickMatchingHomeButton(btn);
}

// Un seul contrôleur, enregistré avant les modules dynamiques.
document.addEventListener('click',e=>{
  const menu=e.target.closest?.('#menu,.menuBtn');
  if(menu&&menu.closest('#appShell')){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();toggle();return;
  }
  const d=drawer();
  if(!d)return;
  if(e.target===d){e.preventDefault();e.stopImmediatePropagation();close();return}
  const btn=e.target.closest?.('.dlist button');
  if(btn&&d.contains(btn)){
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(!routeDrawerButton(btn))console.warn('Navigation latérale non reliée:',btn.textContent?.trim());
  }
},true);

const style=document.createElement('style');style.id='drawer-controller-style-v1';style.textContent='#drawer.open{display:block!important}';document.head.appendChild(style);
window.HorticultureDrawer={open,close,toggle,openAdherents};
})();