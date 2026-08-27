(()=>{
const K='horticulture-admin-users-v2';
function getUsers(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function currentRole(){return document.querySelector('#role')?.textContent?.trim()||document.querySelector('#drole')?.textContent?.trim()||''}
function usernameFromCard(card){return [...card.querySelectorAll('small')].map(x=>x.textContent).find(x=>x.includes('Identifiant'))?.split(':').slice(1).join(':').trim()||''}
function writeLocalSilently(list){const raw=JSON.stringify(list);Storage.prototype.setItem.call(localStorage,K,raw)}
function removeLocalById(id){const next=getUsers().filter(u=>String(u.id)!==String(id)||u.id==='superadmin');writeLocalSilently(next);return next}
function inject(){
  if(currentRole()!=='Super Admin')return;
  document.querySelectorAll('#access .userCard2').forEach(card=>{
    if(card.querySelector('[data-delete-permanent]'))return;
    const username=usernameFromCard(card);if(!username||username==='superadmin')return;
    const u=getUsers().find(x=>x.username===username);if(!u||u.id==='superadmin')return;
    const actions=card.querySelector('.userActions');if(!actions)return;
    const btn=document.createElement('button');btn.className='miniBtn danger';btn.dataset.deletePermanent=String(u.id);btn.textContent='Supprimer définitivement';
    btn.onclick=async()=>{
      if(btn.dataset.busy==='1')return;
      if(!confirm(`Supprimer définitivement ${username} ?\n\nCette personne sera supprimée du Google Sheet et de tous les appareils. Cette action est irréversible.`))return;
      if(!window.HorticultureSharedUsers?.deleteUser)return alert('La base partagée n’est pas disponible.');
      const previous=getUsers();
      /* Optimistic delete: disappear immediately on this device. */
      btn.dataset.busy='1';removeLocalById(u.id);card.remove();
      try{
        await window.HorticultureSharedUsers.deleteUser(u.id);
        window.dispatchEvent(new CustomEvent('horticulture-user-deleted',{detail:{id:u.id,username}}));
      }catch(e){
        console.error(e);writeLocalSilently(previous);alert('Impossible de supprimer cet utilisateur dans Google Sheets. La personne a été restaurée.');
        window.dispatchEvent(new CustomEvent('horticulture-users-synced',{detail:{users:previous}}));
      }
    };actions.appendChild(btn);
  });
}
function reconcile(list){
  if(!Array.isArray(list))return;
  const ids=new Set(list.map(u=>String(u.id))),usernames=new Set(list.map(u=>u.username));
  document.querySelectorAll('#access .userCard2').forEach(card=>{
    const del=card.querySelector('[data-delete-permanent]');const username=usernameFromCard(card);
    if(username&&username!=='superadmin'&&!usernames.has(username))card.remove();
    else if(del&&!ids.has(String(del.dataset.deletePermanent)))card.remove();
  });inject();
}
window.addEventListener('horticulture-users-synced',e=>reconcile(e.detail?.users));
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});setInterval(inject,1000);inject();
})();