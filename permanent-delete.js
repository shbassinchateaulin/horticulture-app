(()=>{
const K='horticulture-admin-users-v2';
function getUsers(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function currentRole(){return document.querySelector('#role')?.textContent?.trim()||document.querySelector('#drole')?.textContent?.trim()||''}
function usernameFromCard(card){return [...card.querySelectorAll('small')].map(x=>x.textContent).find(x=>x.includes('Identifiant'))?.split(':').slice(1).join(':').trim()||''}
function removeLocalById(id){const next=getUsers().filter(u=>String(u.id)!==String(id)||u.id==='superadmin');localStorage.setItem(K,JSON.stringify(next))}
function inject(){
  if(currentRole()!=='Super Admin')return;
  document.querySelectorAll('#access .userCard2').forEach(card=>{
    if(card.querySelector('[data-delete-permanent]'))return;
    const username=usernameFromCard(card);if(!username||username==='superadmin')return;
    const u=getUsers().find(x=>x.username===username);if(!u||u.id==='superadmin')return;
    const actions=card.querySelector('.userActions');if(!actions)return;
    const btn=document.createElement('button');
    btn.className='miniBtn danger';btn.dataset.deletePermanent=String(u.id);btn.textContent='Supprimer définitivement';
    btn.onclick=async()=>{
      if(btn.dataset.busy==='1')return;
      if(!confirm(`Supprimer définitivement ${username} ?\n\nCette personne sera supprimée du Google Sheet et de tous les appareils. Cette action est irréversible.`))return;
      if(!window.HorticultureSharedUsers?.deleteUser)return alert('La base partagée n’est pas disponible.');
      btn.dataset.busy='1';btn.disabled=true;btn.textContent='Suppression…';
      try{
        await window.HorticultureSharedUsers.deleteUser(u.id);
        removeLocalById(u.id);
        card.remove();
      }catch(e){console.error(e);btn.dataset.busy='0';btn.disabled=false;btn.textContent='Supprimer définitivement';alert('Impossible de supprimer cet utilisateur dans Google Sheets.');}
    };
    actions.appendChild(btn);
  });
}
/* When another device deletes somebody, silently remove their card here too. */
window.addEventListener('horticulture-users-synced',e=>{
  const list=e.detail?.users;if(!Array.isArray(list))return;
  const usernames=new Set(list.map(u=>u.username));
  document.querySelectorAll('#access .userCard2').forEach(card=>{
    const username=usernameFromCard(card);if(username&&username!=='superadmin'&&!usernames.has(username))card.remove();
  });
  inject();
});
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
setInterval(inject,1000);inject();
})();