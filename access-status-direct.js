(()=>{
const K='horticulture-admin-users-v2';
function users(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function saveLocal(list){localStorage.setItem(K,JSON.stringify(list))}
function applyStatusToCard(id,u){
  const btn=document.querySelector(`[data-term="${CSS.escape(String(id))}"]`);
  if(!btn||!u)return;
  btn.textContent=u.active?'Résilier l’accès':'Réactiver l’accès';
  const card=btn.closest('.userCard2');
  const pill=card?.querySelector('.pill');
  if(pill){
    pill.textContent=u.active?(u.firstLogin?'Première connexion':'Actif'):'Résilié';
    pill.classList.remove('ok','off','first');
    pill.classList.add(u.active?(u.firstLogin?'first':'ok'):'off');
  }
}
async function handle(btn){
  const id=btn.dataset.term;if(!id||btn.dataset.busy==='1')return;
  const list=users(),idx=list.findIndex(u=>String(u.id)===String(id));
  if(idx<0||!window.HorticultureSharedUsers?.updateUser)return;
  const old={...list[idx]},next={...old,active:!old.active};
  btn.dataset.busy='1';btn.disabled=true;
  list[idx]=next;saveLocal(list);applyStatusToCard(id,next);
  try{
    await window.HorticultureSharedUsers.updateUser(next);
    btn.dataset.busy='0';btn.disabled=false;
  }catch(e){
    console.error(e);
    const rollback=users(),ri=rollback.findIndex(u=>String(u.id)===String(id));if(ri>=0){rollback[ri]=old;saveLocal(rollback)}
    applyStatusToCard(id,old);
    btn.dataset.busy='0';btn.disabled=false;
    alert('La modification n’a pas pu être enregistrée dans Google Sheets. Le statut précédent a été restauré.');
  }
}
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-term]');if(!btn)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();handle(btn);
},true);
/* When another device changes a user's status, shared-sync emits this event.
   Update the visible buttons/badges in place: no page reload, no flash. */
window.addEventListener('horticulture-users-synced',e=>{
  const list=e.detail?.users;if(!Array.isArray(list))return;
  for(const u of list)applyStatusToCard(u.id,u);
});
})();