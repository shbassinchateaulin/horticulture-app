(()=>{
'use strict';
const main=()=>document.querySelector('#appShell main.app');
function normalize(){
 document.body.classList.remove('agWorkspaceMode');
 const shell=document.getElementById('appShell');
 if(shell){shell.style.removeProperty('visibility');shell.style.removeProperty('opacity')}
 const m=main();if(m){m.style.removeProperty('display');m.style.removeProperty('visibility');m.style.removeProperty('opacity')}
 document.querySelectorAll('#appShell main.app > .view').forEach(v=>{v.style.removeProperty('display');v.style.removeProperty('visibility');v.style.removeProperty('opacity')});
}
function show(id){
 normalize();
 document.querySelectorAll('#appShell main.app > .view').forEach(v=>v.classList.toggle('active',v.id===id));
 document.querySelectorAll('.bottom .nav').forEach(n=>n.classList.toggle('active',n.dataset.go===id));
 document.getElementById('drawer')?.classList.remove('open');
 window.scrollTo(0,0);
}
function home(){
 try{sessionStorage.removeItem('horticulture-ag-active-v1')}catch(_){}
 try{localStorage.removeItem('horticulture-ag-route-v3')}catch(_){}
 show('home');
}
function openAdherents(){
 normalize();
 try{window.HorticultureAdherents?.open?.();setTimeout(()=>{const a=document.getElementById('adherentsAdmin');if(a){document.querySelectorAll('#appShell main.app > .view').forEach(v=>v.classList.toggle('active',v===a));window.scrollTo(0,0)}},0)}catch(e){console.error('Navigation Adhérents',e)}
}
document.addEventListener('click',e=>{
 const homeTarget=e.target.closest?.('[data-go="home"],.admBrand,.admBrand img,.welcome img,.dhead img');
 if(homeTarget){e.preventDefault();e.stopPropagation();home();return}
 const adh=e.target.closest?.('[data-permission="adherents"],[data-module="adherents"]');
 if(adh){e.preventDefault();e.stopPropagation();openAdherents()}
},true);
window.HorticultureNavigation={show,home,openAdherents,normalize};
})();