(()=>{
'use strict';
const KEY='horticulture-active-view-v1';
const VIEW='adherents';
let restoring=false;
function setView(v){try{if(v)sessionStorage.setItem(KEY,v);else sessionStorage.removeItem(KEY)}catch(_){}}
function getView(){try{return sessionStorage.getItem(KEY)||''}catch(_){return''}}
function isAdherentsTrigger(el){if(!el)return false;const p=String(el.dataset?.permission||'').toLowerCase();const txt=String(el.textContent||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();return p==='adherents'||txt==='adherents'}
function openAdherents(){if(restoring)return;const fn=window.HorticultureAdherents?.open;if(typeof fn!=='function')return;restoring=true;setView(VIEW);try{fn()}finally{setTimeout(()=>{restoring=false},250)}}
function canRestore(){const shell=document.getElementById('appShell');if(!shell)return false;const style=getComputedStyle(shell);return style.display!=='none'&&style.visibility!=='hidden'}
function restoreLater(){if(getView()!==VIEW)return;let n=0;const timer=setInterval(()=>{n++;if(getView()!==VIEW){clearInterval(timer);return}if(window.HorticultureAdherents?.open&&canRestore()){clearInterval(timer);openAdherents();return}if(n>80)clearInterval(timer)},125)}
document.addEventListener('click',e=>{const b=e.target.closest?.('button,[data-permission],[data-go],.nav');if(!b)return;if(isAdherentsTrigger(b)){setView(VIEW);return}if(b.closest?.('#adherentsAdmin')&&b.matches?.('[data-close],.aa-back')){setView('');return}if(b.dataset?.go||b.classList?.contains('nav'))setView('')},true);
window.addEventListener('horticulture-notification-click',e=>{const d=e.detail?.data||e.detail||{};if(d.view===VIEW||d.type==='helloasso-membership'){setView(VIEW);openAdherents()}});
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',e=>{const m=e.data||{},d=m.data||{};if(m.type==='horticulture-notification-click'&&(d.view===VIEW||d.type==='helloasso-membership')){setView(VIEW);openAdherents()}});
window.addEventListener('pageshow',restoreLater);document.readyState==='loading'?document.addEventListener('DOMContentLoaded',restoreLater,{once:true}):restoreLater();
})();