(()=>{
'use strict';
const PERM='consultation_ag';
const agIcon=`<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h3M8 12h3M8 16h3M14 8h2M14 12h2M14 16h2"/><path d="m8 8 .8.8L10.5 7"/></svg>`;
let opening=false;
function cleanup(){
 document.body.classList.remove('agWorkspaceMode');
 try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}
 try{localStorage.removeItem('horticulture-ag-route-v3')}catch(_){}
 const ag=document.getElementById('agConsultation');
 if(ag){ag.classList.remove('active');ag.style.removeProperty('display');ag.style.removeProperty('visibility');ag.style.removeProperty('opacity')}
 document.querySelectorAll('#appShell main.app > .view').forEach(v=>{v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity')});
}
function showAG(){
 const ag=document.getElementById('agConsultation');if(!ag)return false;
 document.querySelectorAll('#appShell main.app > .view').forEach(v=>v.classList.toggle('active',v===ag));
 ag.hidden=false;ag.style.removeProperty('display');ag.style.removeProperty('visibility');ag.style.removeProperty('opacity');
 document.getElementById('drawer')?.classList.remove('open');window.scrollTo(0,0);return true;
}
function open(){
 if(opening)return;opening=true;cleanup();
 const attempt=()=>{try{if(typeof window.HorticultureAG?.open==='function'){window.HorticultureAG.open();showAG();opening=false;return true}}catch(e){console.error('Consultation AG',e)}return false};
 if(attempt())return;[80,220,500,900].forEach((ms,i)=>setTimeout(()=>{if(attempt())return;if(i===3)opening=false},ms));
}
function isAGButton(el){return !!el?.closest?.('[data-module="consultation-ag"],[data-permission="consultation_ag"]')}
document.addEventListener('click',e=>{if(!isAGButton(e.target))return;e.preventDefault();e.stopPropagation();open()},false);
// AG no longer controls Home, Adherents or any other module. We only clean up
// stale AG workspace state before another route runs, without blocking that click.
document.addEventListener('click',e=>{const t=e.target?.closest?.('[data-go],[data-permission],[data-module],.admBrand,.welcome img,.dhead img');if(!t||isAGButton(t))return;if(document.body.classList.contains('agWorkspaceMode'))cleanup()},true);
function wire(){
 const grid=document.querySelector('#home .dashGrid,#home .grid');
 if(grid&&!grid.querySelector('[data-permission="'+PERM+'"]')){const b=document.createElement('button');b.className=grid.classList.contains('dashGrid')?'dashTile':'space';b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="dashIcon ico">${agIcon}</span><b>Consultation AG</b><small>Questionnaires, collecte<br>et dépouillement automatique</small>`;grid.insertBefore(b,grid.querySelector('#dashAccess')||null)}
 const list=document.querySelector('.dlist');
 if(list&&!list.querySelector('[data-permission="'+PERM+'"]')){const b=document.createElement('button');b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="drawerI">${agIcon}</span><span>Consultation AG</span>`;const access=[...list.querySelectorAll('button')].find(x=>(x.textContent||'').toLowerCase().includes('gestion des accès')||(x.textContent||'').toLowerCase().includes('gestion des acces'));list.insertBefore(b,access||null)}
}
wire();setTimeout(wire,250);setTimeout(wire,800);window.addEventListener('horticulture-users-synced',wire);
window.HorticultureAGNavigation={open,cleanup};
})();