(()=>{
const PERM='consultation_ag';
const agIcon=`<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h3M8 12h3M8 16h3M14 8h2M14 12h2M14 16h2"/><path d="m8 8 .8.8L10.5 7"/></svg>`;
function add(){
 const grid=document.querySelector('#home .dashGrid');
 if(grid&&!grid.querySelector('[data-permission="'+PERM+'"]')){
  const b=document.createElement('button');b.className='dashTile';b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="dashIcon">${agIcon}</span><b>Consultation AG</b><small>Questionnaires, collecte<br>et dépouillement automatique</small>`;grid.insertBefore(b,grid.querySelector('#dashAccess')||null);
 }
 const list=document.querySelector('.dlist');
 if(list&&!list.querySelector('[data-permission="'+PERM+'"]')){
  const b=document.createElement('button');b.dataset.permission=PERM;b.dataset.module='consultation-ag';b.innerHTML=`<span class="drawerI">${agIcon}</span><span>Consultation AG</span>`;
  const access=[...list.querySelectorAll('button')].find(x=>(x.textContent||'').toLowerCase().includes('gestion des accès')||(x.textContent||'').toLowerCase().includes('gestion des acces'));
  list.insertBefore(b,access||null);
 }
}
add();setTimeout(add,400);window.addEventListener('pageshow',add);window.addEventListener('horticulture-users-synced',add);
})();