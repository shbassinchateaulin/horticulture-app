(()=>{
const K='horticulture-admin-users-v2';
function users(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function byId(id){return users().find(u=>String(u.id)===String(id))}
async function handle(btn){
  const id=btn.dataset.term;if(!id)return;
  const u=byId(id);if(!u||!window.HorticultureSharedUsers?.updateUser)return;
  btn.disabled=true;
  const next={...u,active:!u.active};
  try{
    await window.HorticultureSharedUsers.updateUser(next);
  }catch(e){
    console.error(e);alert('Impossible de mettre à jour le statut dans Google Sheets.');btn.disabled=false;
  }
}
document.addEventListener('click',e=>{
  const btn=e.target.closest?.('[data-term]');
  if(!btn)return;
  e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
  handle(btn);
},true);
})();