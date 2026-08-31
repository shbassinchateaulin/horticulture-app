(()=>{
'use strict';
if(window.__horticultureRouteCoreV2)return;
window.__horticultureRouteCoreV2=true;
const STORE='horticulture-route-core-v2';
const AG_ACTIVE='horticulture-ag-active-v1';
const AG_ROUTE='horticulture-ag-route-v3';
let route='home',busy=false;
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const views=()=>[...document.querySelectorAll('#appShell main.app > .view')];
const drawer=()=>document.getElementById('drawer');
function clearAG(){try{sessionStorage.removeItem(AG_ACTIVE)}catch(_){}try{localStorage.removeItem(AG_ROUTE)}catch(_){}document.body.classList.remove('agWorkspaceMode')}
function save(r){route=r;try{sessionStorage.setItem(STORE,r)}catch(_){}}
function targetFor(r){const k=norm(r).replace(/[^a-z0-9]+/g,'');const ids={home:['home'],accueil:['home'],publish:['publish'],communication:['publish'],actualites:['publish'],check:['check'],verifier:['check'],access:['access'],acces:['access'],adherents:['adherentsAdmin'],adherent:['adherentsAdmin'],suggestions:['suggestionsAdmin','suggestions'],comptabilite:['comptabiliteAdmin','comptabilite'],parametres:['settings','parametres'],settings:['settings','parametres'],profil:['profile','profil'],profile:['profile','profil']}[k]||[r];for(const id of ids){const v=document.getElementById(id);if(v?.classList.contains('view'))return v}return null}
function displayOnly(target,r){if(!target)return false;busy=true;if(r!=='consultation-ag'&&r!=='consultation_ag')clearAG();for(const v of views()){const on=v===target;v.classList.toggle('active',on);v.hidden=false;v.style.setProperty('display',on?'block':'none','important');if(on){v.style.setProperty('visibility','visible','important');v.style.setProperty('opacity','1','important')}else{v.style.removeProperty('visibility');v.style.removeProperty('opacity')}}document.querySelectorAll('#appShell .bottom .nav').forEach(n=>n.classList.toggle('active',target.id==='home'&&n.dataset.go==='home'));save(r);busy=false;return true}
function closeDrawer(){drawer()?.classList.remove('open')}
function home(){document.querySelectorAll('.aa-modalBack,.aa-ir-back').forEach(x=>x.remove());displayOnly(document.getElementById('home'),'home');closeDrawer();scrollTo(0,0)}
function adherents(){clearAG();save('adherents');const show=()=>{const a=document.getElementById('adherentsAdmin');if(a)displayOnly(a,'adherents')};show();try{window.HorticultureAdherents?.open?.()}catch(e){console.warn(e)};[0,50,150,350,800,1500].forEach(ms=>setTimeout(()=>{if(route==='adherents'){clearAG();show()}},ms));closeDrawer();scrollTo(0,0)}
function addAdherent(){adherents();let n=0;const t=setInterval(()=>{n++;const b=document.querySelector('#adherentsAdmin [data-add]:not([disabled])');if(b){clearInterval(t);b.click()}else if(n>80)clearInterval(t)},75)}
function nativeGo(id){const r=norm(id);if(r==='home')return home();if(r==='adherents'||r==='adherent')return adherents();const t=targetFor(id);if(t){displayOnly(t,id);closeDrawer();scrollTo(0,0);return true}return false}
function buttonRoute(el){const b=el?.closest?.('button,a');if(!b||!b.closest('#appShell'))return'';if(b.closest('#adherentsAdmin,.aa-modalBack,.aa-ir-back'))return'';if(b.matches('#menu,.menuBtn'))return'__menu';if(b.closest('.quickGrid')&&norm(b.textContent).includes('ajouter un adherent'))return'__add';if(b.dataset.module==='consultation-ag'||b.dataset.permission==='consultation_ag')return'__ag';if(b.dataset.go)return b.dataset.go;if(b.dataset.permission)return b.dataset.permission;const t=norm(b.textContent);if(t.includes('accueil'))return'home';if(t.includes('adherent'))return'adherents';if(t.includes('suggestion'))return'suggestions';if(t.includes('comptabil'))return'comptabilite';if(t.includes('parametre'))return'parametres';if(t.includes('mon profil'))return'profil';return''}
window.addEventListener('click',e=>{const shell=document.getElementById('appShell');if(!shell?.contains(e.target))return;const brand=e.target.closest?.('.admBrand,.welcome img');if(brand){e.preventDefault();e.stopImmediatePropagation();home();return}const r=buttonRoute(e.target);if(!r)return;if(r==='__ag'){save('consultation-ag');return}if(r==='__menu'){e.preventDefault();e.stopImmediatePropagation();drawer()?.classList.toggle('open');return}if(r==='__add'){e.preventDefault();e.stopImmediatePropagation();addAdherent();return}if(r==='adherents'||r==='adherent'){e.preventDefault();e.stopImmediatePropagation();adherents();return}if(r==='home'||targetFor(r)){e.preventDefault();e.stopImmediatePropagation();nativeGo(r)}},true);
function repair(){if(busy||route==='consultation-ag')return;const t=targetFor(route);if(!t)return;const active=views().filter(v=>v.classList.contains('active'));const bad=active.length!==1||active[0]!==t||getComputedStyle(t).display==='none';if(bad)displayOnly(t,route)}
function boot(){window.go=nativeGo;const main=document.querySelector('#appShell main.app');if(!main){setTimeout(boot,100);return}new MutationObserver(()=>setTimeout(repair,0)).observe(main,{childList:true,subtree:false,attributes:true,attributeFilter:['class','style']});setInterval(repair,1000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.HorticultureNavigation={openHome:home,openAdherents:adherents,openAdherentForm:addAdherent,openRoute:nativeGo,repair,closeDrawer};
})();
