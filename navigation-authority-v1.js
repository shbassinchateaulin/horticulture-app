(()=>{
'use strict';
const main=()=>document.querySelector('#appShell main.app');
function hideAG(){
 document.body.classList.remove('agWorkspaceMode');
 try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}
 try{localStorage.removeItem('horticulture-ag-route-v3')}catch(_){}
 const ag=document.getElementById('agConsultation');
 if(ag){ag.classList.remove('active');ag.hidden=true;ag.style.setProperty('display','none','important');ag.style.setProperty('visibility','hidden','important');ag.style.setProperty('pointer-events','none','important')}
}
function normalize(){
 hideAG();
 const shell=document.getElementById('appShell');if(shell){shell.style.removeProperty('visibility');shell.style.removeProperty('opacity')}
 const m=main();if(m){m.style.removeProperty('display');m.style.removeProperty('visibility');m.style.removeProperty('opacity')}
 document.querySelectorAll('#appShell main.app > .view').forEach(v=>{if(v.id==='agConsultation')return;v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity');v.style.removeProperty('pointer-events')});
}
function show(id){normalize();document.querySelectorAll('#appShell main.app > .view').forEach(v=>v.classList.toggle('active',v.id===id));document.querySelectorAll('.bottom .nav').forEach(n=>n.classList.toggle('active',n.dataset.go===id));document.getElementById('drawer')?.classList.remove('open');window.scrollTo(0,0)}
function home(){show('home')}
function openAdherents(){normalize();try{window.HorticultureAdherents?.open?.();setTimeout(()=>{const a=document.getElementById('adherentsAdmin');if(a){document.querySelectorAll('#appShell main.app > .view').forEach(v=>v.classList.toggle('active',v===a));hideAG();document.getElementById('drawer')?.classList.remove('open');window.scrollTo(0,0)}},0)}catch(e){console.error('Navigation Adhérents',e)}}
document.addEventListener('click',e=>{
 const homeTarget=e.target.closest?.('[data-go="home"],.admBrand,.admBrand img,.welcome img,.dhead img');if(homeTarget){e.preventDefault();e.stopImmediatePropagation();home();return}
 const adh=e.target.closest?.('[data-permission="adherents"],[data-module="adherents"]');if(adh){e.preventDefault();e.stopImmediatePropagation();openAdherents();return}
 const route=e.target.closest?.('#drawer [data-permission],#drawer [data-module],#drawer [data-go]');if(route&&!route.matches('[data-module="consultation-ag"],[data-permission="consultation_ag"]')){normalize();setTimeout(hideAG,0);setTimeout(hideAG,80);setTimeout(hideAG,250)}
},true);
const observer=new MutationObserver(()=>{const ag=document.getElementById('agConsultation');if(!ag)return;const other=[...document.querySelectorAll('#appShell main.app > .view.active')].some(v=>v!==ag);if(other)hideAG()});
const startObserver=()=>{const m=main();if(m)observer.observe(m,{subtree:false,attributes:true,attributeFilter:['class'],childList:true});else setTimeout(startObserver,100)};startObserver();
window.HorticultureNavigation={show,home,openAdherents,normalize,hideAG};
})();