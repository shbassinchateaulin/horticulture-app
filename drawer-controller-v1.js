(()=>{
'use strict';
if(window.__horticultureDrawerControllerV2)return;
window.__horticultureDrawerControllerV2=true;
const drawer=()=>document.getElementById('drawer');
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const views=()=>[...document.querySelectorAll('#appShell main.app > .view')];
function open(){const d=drawer();if(!d)return;d.classList.add('open');d.style.setProperty('display','block','important')}
function close(){const d=drawer();if(!d)return;d.classList.remove('open');d.style.removeProperty('display')}
function toggle(){const d=drawer();if(!d)return;d.classList.contains('open')?close():open()}
function neutralizeAG(){
 document.body.classList.remove('agWorkspaceMode');
 try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}
 try{localStorage.removeItem('horticulture-ag-route-v3')}catch(_){}
 const ag=document.getElementById('agConsultation');
 if(ag){ag.classList.remove('active');ag.hidden=true;ag.style.setProperty('display','none','important');ag.style.setProperty('visibility','hidden','important');ag.style.setProperty('pointer-events','none','important')}
}
function clearCurrent(){neutralizeAG();views().forEach(v=>{v.classList.remove('active');if(v.id!=='agConsultation'){v.hidden=false;v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')}})}
function activate(id){clearCurrent();const v=document.getElementById(id);if(!v)return false;v.hidden=false;v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events');v.classList.add('active');close();window.scrollTo(0,0);return true}
function home(){return activate('home')}
function openAdherents(){clearCurrent();close();const fn=window.HorticultureAdherents?.open;if(typeof fn==='function'){fn();setTimeout(()=>{const v=document.getElementById('adherentsAdmin');if(v){views().forEach(x=>x.classList.toggle('active',x===v));window.scrollTo(0,0)}},0);return true}return false}
function findHomeTarget(source){
 const permission=String(source.dataset?.permission||'').toLowerCase(),label=norm(source.textContent);
 const candidates=[...document.querySelectorAll('#home button,.dashTile,.space')];
 let target=null;
 if(permission)target=candidates.find(b=>String(b.dataset?.permission||'').toLowerCase()===permission);
 if(!target)target=candidates.find(b=>{const t=norm(b.textContent),h=norm(b.querySelector('b')?.textContent);return t===label||h===label||t.startsWith(label)||label.startsWith(h)});
 return target;
}
function route(btn){
 const label=norm(btn.textContent),go=btn.dataset?.go;
 if(label.includes('accueil')||go==='home')return home();
 if(label.includes('adherent'))return openAdherents();
 if(go&&document.getElementById(go))return activate(go);
 const target=findHomeTarget(btn);
 if(target){clearCurrent();close();setTimeout(()=>target.click(),0);return true}
 // Unknown/dynamic destination (Profile, Settings, etc.): remove AG, close drawer,
 // then let the button's original handler run normally.
 neutralizeAG();close();return false;
}
document.addEventListener('click',e=>{
 const menu=e.target.closest?.('#menu,.menuBtn');
 if(menu&&menu.closest('#appShell')){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();toggle();return}
 const d=drawer();if(!d)return;
 if(e.target===d){e.preventDefault();e.stopImmediatePropagation();close();return}
 const btn=e.target.closest?.('.dlist button');
 if(btn&&d.contains(btn)){
   const handled=route(btn);
   if(handled){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}
 }
},true);
// Never allow a second page to stay visible under/over the selected one.
const style=document.createElement('style');style.id='drawer-controller-style-v2';style.textContent='#drawer.open{display:block!important}#appShell main.app>.view:not(.active){display:none!important}';document.head.appendChild(style);
window.HorticultureDrawer={open,close,toggle,home,activate,openAdherents,neutralizeAG};
})();