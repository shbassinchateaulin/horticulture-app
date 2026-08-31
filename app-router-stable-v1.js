(()=>{
'use strict';
if(window.__horticultureStableRouterV1)return;
window.__horticultureStableRouterV1=true;

let current='home';
let repairing=false;
const STORE='horticulture-active-view-v1';

function appShell(){return document.getElementById('appShell')}
function drawer(){return document.getElementById('drawer')}
function home(){return document.getElementById('home')}
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function uniq(a){return [...new Set(a.filter(Boolean))]}
function views(){return uniq([...document.querySelectorAll('#appShell .view')])}
function setStore(v){try{v&&v!=='home'?sessionStorage.setItem(STORE,v):sessionStorage.removeItem(STORE)}catch(_){}}
function getStore(){try{return sessionStorage.getItem(STORE)||''}catch(_){return''}}
function isInsideModuleContent(el){return !!el?.closest?.('#adherentsAdmin,.aa-modalBack,.aa-ir-back')&&!el.closest?.('#drawer,.bottom,.top')}

function routeCandidates(route){
 const r=norm(route).replace(/[^a-z0-9]+/g,'');
 const map={home:['home'],accueil:['home'],publish:['publish'],publication:['publish'],actualites:['publish'],communication:['publish'],sorties:['publish'],check:['check'],verifier:['check'],verification:['check'],access:['access'],acces:['access'],gestiondesacces:['access'],adherents:['adherentsAdmin','adherents','adherentsView'],suggestions:['suggestionsAdmin','suggestions','suggestionsView'],comptabilite:['comptabiliteAdmin','comptabilite','accounting'],consultationag:['agAdmin','consultationAg','consultationAG','ag','consultation'],parametres:['settings','parametres','settingsAdmin'],settings:['settings','parametres','settingsAdmin'],profil:['profile','profil','monProfil'],profile:['profile','profil','monProfil']};
 return map[r]||[route,r,`${r}Admin`,`${r}View`];
}
function findView(route){for(const id of routeCandidates(route)){const el=document.getElementById(id);if(el?.classList?.contains('view'))return el}const wanted=norm(route);return views().find(v=>norm(v.id)===wanted||norm(v.dataset?.view)===wanted||norm(v.getAttribute('aria-label'))===wanted)||null}
function closeDrawer(){const d=drawer();if(!d)return;d.classList.remove('open');d.style.removeProperty('display')}
function openDrawer(){const d=drawer();if(!d)return;d.classList.add('open');d.style.removeProperty('display')}
function toggleDrawer(){const d=drawer();if(!d)return;d.classList.contains('open')?closeDrawer():openDrawer()}
function cleanOverlays(){document.querySelectorAll('.aa-modalBack,.aa-ir-back,[class*="modalBack"],[class*="ModalBack"]').forEach(x=>x.remove())}

function showOnly(target,route=''){
 if(!target)return false;
 repairing=true;
 views().forEach(v=>v.classList.toggle('active',v===target));
 document.querySelectorAll('#appShell .bottom .nav').forEach(n=>{const go=n.dataset?.go||'';n.classList.toggle('active',target.id==='home'&&go==='home'||target.id===go)});
 current=route||target.id||'home';setStore(current);repairing=false;return true;
}
function openHome(){cleanOverlays();current='home';setStore('home');showOnly(home(),'home');closeDrawer();window.scrollTo(0,0)}
function forceAdherentsVisible(){
 const a=document.getElementById('adherentsAdmin');
 if(!a)return false;
 showOnly(a,'adherents');
 closeDrawer();
 return true;
}
function openAdherents(){
 cleanOverlays();current='adherents';setStore('adherents');
 // Si la vue existe déjà (cas après clic sur le logo), on l'affiche immédiatement
 // avant de laisser le module rafraîchir son contenu.
 forceAdherentsVisible();
 const api=window.HorticultureAdherents;
 try{if(api&&typeof api.open==='function')api.open()}catch(e){console.warn('Ouverture Adhérents',e)}
 [0,40,120,300,700].forEach(ms=>setTimeout(()=>{current='adherents';setStore('adherents');forceAdherentsVisible();if(ms===0)window.scrollTo(0,0)},ms));
 return true;
}
function openAdherentForm(){openAdherents();let tries=0;const timer=setInterval(()=>{tries++;const add=document.querySelector('#adherentsAdmin [data-add]:not([disabled])');if(add){clearInterval(timer);add.click()}if(tries>80)clearInterval(timer)},75)}
function openRoute(route){const r=norm(route);if(!r||r==='home'||r==='accueil')return openHome(),true;if(r==='adherents'||r==='adherent')return openAdherents();const v=findView(route);if(v){cleanOverlays();showOnly(v,route);closeDrawer();window.scrollTo(0,0);return true}return false}

function routeFromButton(el){const b=el?.closest?.('button,a,[data-go],[data-permission],[data-module]');if(!b||!b.closest?.('#appShell'))return null;const go=b.dataset?.go||b.dataset?.module||b.dataset?.permission||'';if(go)return go;const t=norm(b.textContent);if(t.includes('accueil'))return'home';if(t.includes('adherent'))return'adherents';if(t.includes('suggestion'))return'suggestions';if(t.includes('comptabil'))return'comptabilite';if(t.includes('consultation')||t.includes('assemblee')||t==='ag')return'consultationag';if(t.includes('parametre'))return'parametres';if(t.includes('profil'))return'profil';if(t.includes('verifier'))return'check';return null}
function isQuickAdd(el){const b=el?.closest?.('button');const t=norm(b?.textContent);return !!b?.closest?.('.quickGrid')&&t.includes('ajouter')&&t.includes('adherent')}
function isMenuButton(el){const b=el?.closest?.('#menu,.menuBtn,[data-menu]');return !!b&&!!b.closest?.('#appShell')}
function isHomeLogo(el){if(el?.closest?.('.admBrand'))return true;const img=el?.closest?.('img');if(!img||!img.closest?.('#appShell'))return false;const src=img.getAttribute('src')||'';return /logo-admin|transparent/i.test(src)}
function markDrawerButtons(){const d=drawer();if(!d)return;d.querySelectorAll('button').forEach(b=>{const route=routeFromButton(b);if(route&&!b.dataset.module&&!b.dataset.go&&!b.dataset.permission)b.dataset.module=route})}

function repair(){if(repairing)return;markDrawerButtons();const active=views().filter(v=>v.classList.contains('active'));if(active.length===0){if(current==='adherents'&&forceAdherentsVisible())return;if(home())showOnly(home(),'home');return}if(active.length===1){if(current==='adherents'&&active[0].id!=='adherentsAdmin')forceAdherentsVisible();return}let target=null;const stored=getStore();if(stored==='adherents')target=document.getElementById('adherentsAdmin');if(!target&&current&&current!=='home')target=findView(current);if(!target&&current==='home')target=home();if(!target)target=active.find(v=>v.id!=='home')||home()||active[active.length-1];showOnly(target,current||target.id)}
function scheduleRepair(){setTimeout(repair,0);setTimeout(repair,80);setTimeout(repair,250)}

document.addEventListener('click',e=>{
 const shell=appShell();if(!shell||!shell.contains(e.target))return;const d=drawer();
 if(isMenuButton(e.target)){e.preventDefault();e.stopImmediatePropagation();toggleDrawer();return}
 if(d&&e.target===d){e.preventDefault();e.stopImmediatePropagation();closeDrawer();return}
 if(isHomeLogo(e.target)){e.preventDefault();e.stopImmediatePropagation();openHome();return}
 if(isQuickAdd(e.target)){e.preventDefault();e.stopImmediatePropagation();openAdherentForm();return}
 if(isInsideModuleContent(e.target)){scheduleRepair();return}
 const route=routeFromButton(e.target);if(!route){scheduleRepair();return}
 const insideDrawer=!!e.target.closest?.('#drawer');const r=norm(route);
 if(r==='home'||r==='accueil'||r==='adherents'||r==='adherent'||findView(route)){e.preventDefault();e.stopImmediatePropagation();openRoute(route);return}
 if(insideDrawer)closeDrawer();current=route;setStore(route);scheduleRepair();
},true);

const style=document.createElement('style');style.id='stable-router-style-v1';style.textContent=`#appShell .view:not(.active){display:none!important}#drawer.open{display:block!important}`;document.head.appendChild(style);
function boot(){markDrawerButtons();repair();const s=appShell();if(!s){setTimeout(boot,100);return}new MutationObserver(scheduleRepair).observe(s,{subtree:true,childList:true,attributes:true,attributeFilter:['class']})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();window.addEventListener('pageshow',scheduleRepair);window.addEventListener('focus',scheduleRepair);window.HorticultureNavigation={openHome,openAdherents,openAdherentForm,openRoute,repair,closeDrawer,openDrawer};
})();
