(()=>{
'use strict';
if(window.__horticultureDrawerControllerV1)return;
window.__horticultureDrawerControllerV1=true;
let lockUntil=0;
const drawer=()=>document.getElementById('drawer');
function norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function forceOpen(){const d=drawer();if(!d)return;lockUntil=Date.now()+500;d.classList.add('open');d.style.setProperty('display','block','important');setTimeout(()=>{if(Date.now()<lockUntil){d.classList.add('open');d.style.setProperty('display','block','important')}},30);setTimeout(()=>{if(Date.now()<lockUntil){d.classList.add('open');d.style.setProperty('display','block','important')}},120);setTimeout(()=>{if(d.classList.contains('open'))d.style.removeProperty('display')},550)}
function close(){const d=drawer();if(!d)return;lockUntil=0;d.classList.remove('open');d.style.removeProperty('display')}
function openAdherents(){close();const nav=window.HorticultureNavigation;if(nav?.openAdherents){nav.openAdherents();return}const fn=window.HorticultureAdherents?.open;if(typeof fn==='function')fn()}
function bindMenu(){const b=document.getElementById('menu');if(!b||b.dataset.drawerController==='1')return;b.dataset.drawerController='1';b.onclick=null;b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();forceOpen()},true)}
function bindDrawer(){const d=drawer();if(!d)return;d.addEventListener('click',e=>{if(e.target===d&&Date.now()>=lockUntil)close()},true);const buttons=[...d.querySelectorAll('.dlist button')];for(const b of buttons){if(/adh[eé]rents/i.test(norm(b.textContent))){if(b.dataset.drawerAdherents==='1')continue;b.dataset.drawerAdherents='1';b.dataset.permission='adherents';b.onclick=null;b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openAdherents()},true)}}}
function bind(){bindMenu();bindDrawer()}
const style=document.createElement('style');style.id='drawer-controller-style-v1';style.textContent='#drawer.open{display:block!important}';document.head.appendChild(style);
bind();new MutationObserver(bind).observe(document.getElementById('appShell')||document.body,{childList:true,subtree:true});
window.HorticultureDrawer={open:forceOpen,close,openAdherents};
})();