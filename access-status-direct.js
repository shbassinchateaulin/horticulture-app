(()=>{
const K='horticulture-admin-users-v2';
function users(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function saveLocal(list){localStorage.setItem(K,JSON.stringify(list))}
async function handle(btn){
  const id=btn.dataset.term;if(!id||btn.dataset.busy==='1')return;
  const list=users(),idx=list.findIndex(u=>String(u.id)===String(id));
  if(idx<0||!window.HorticultureSharedUsers?.updateUser)return;
  const old={...list[idx]},next={...old,active:!old.active};
  btn.dataset.busy='1';btn.disabled=true;
  /* Optimistic UI: the user sees the new state immediately. */
  list[idx]=next;saveLocal(list);
  btn.textContent=next.active?'Résilier l’accès':'Réactiver l’accès';
  const card=btn.closest('.userCard2');
  const pill=card?.querySelector('.pill');
  if(pill){pill.textContent=next.active?(next.firstLogin?'Première connexion':'Actif'):'Résilié';pill.classList.remove('ok','off','first');pill.classList.add(next.active?(next.firstLogin?'first':'ok'):'off')}
  try{
    await window.HorticultureSharedUsers.updateUser(next);
    btn.dataset.busy='0';btn.disabled=false;
  }catch(e){
    console.error(e);
    const rollback=users(),ri=rollback.findIndex(u=>String(u.id)===String(id));if(ri>=0){rollback[ri]=old;saveLocal(rollback)}
    btn.textContent=old.active?'Résilier l’accès':'Réactiver l’accès';
    if(pill){pill.textContent=old.active?(old.firstLogin?'Première connexion':'Actif'):'Résilié';pill.classList.remove('ok','off','first');pill.classList.add(old.active?(old.firstLogin?'first':'ok'):'off')}
    btn.dataset.busy='0';btn.disabled=false;
    alert('La modification n’a pas pu être enregistrée dans Google Sheets. Le statut précédent a été restauré.');
  }
}
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-term]');if(!btn)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();handle(btn);
},true);
})();