(()=>{
const K='horticulture-admin-users-v2';
function currentUsers(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function visibleAccess(){const sec=document.querySelector('#access');return sec&&getComputedStyle(sec).display!=='none'}
function shownUsernames(){return new Set([...document.querySelectorAll('#access .userCard2 small')].map(x=>x.textContent).filter(x=>x.includes('Identifiant')).map(x=>x.split(':').slice(1).join(':').trim()))}
function refreshIfStructureChanged(list){
  if(!visibleAccess()||!Array.isArray(list))return;
  const remote=new Set(list.map(u=>u.username).filter(Boolean));
  const shown=shownUsernames();
  const expected=[...remote].filter(x=>x!=='superadmin');
  const missing=expected.some(x=>!shown.has(x));
  const removed=[...shown].some(x=>x!=='superadmin'&&!remote.has(x));
  if(!missing&&!removed)return;
  /* Re-open the current access view through its existing renderer, without page reload. */
  const accessButton=[...document.querySelectorAll('[data-permission="acces"],.dlist button')].find(b=>b.textContent.includes('Gestion des accès'));
  if(accessButton){accessButton.click();return}
  /* Fallback: the renderer keeps its own users variable; a lightweight custom event lets companion scripts reconcile. */
  window.dispatchEvent(new CustomEvent('horticulture-access-structure-changed',{detail:{users:list}}));
}
window.addEventListener('horticulture-users-synced',e=>refreshIfStructureChanged(e.detail?.users||currentUsers()));
})();