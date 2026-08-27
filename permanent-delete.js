(()=>{
const K='horticulture-admin-users-v2';
function getUsers(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function currentRole(){return document.querySelector('#role')?.textContent?.trim()||document.querySelector('#drole')?.textContent?.trim()||''}
function usernameFromCard(card){return [...card.querySelectorAll('small')].map(x=>x.textContent).find(x=>x.includes('Identifiant'))?.split(':').slice(1).join(':').trim()||''}
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
      btn.dataset.busy='1';
      const parent=card.parentNode,nextSibling=card.nextSibling;
      /* Immediate local feedback: no waiting for Apps Script. */
      card.remove();
      try{
        await window.HorticultureSharedUsers.deleteUser(u.id);
        await window.HorticultureSharedUsers.pull();
      }catch(e){
        console.error(e);
        if(parent){if(nextSibling&&nextSibling.parentNode===parent)parent.insertBefore(card,nextSibling);else parent.appendChild(card)}
        btn.dataset.busy='0';
        alert('Impossible de supprimer cet utilisateur dans Google Sheets. La personne a été restaurée.');
      }
    };
    actions.appendChild(btn);
  });
}
function reconcile(list){
  if(!Array.isArray(list))return;
  const ids=new Set(list.map(u=>String(u.id))),usernames=new Set(list.map(u=>u.username));
  document.querySelectorAll('#access .userCard2').forEach(card=>{
    const username=usernameFromCard(card);if(!username||username==='superadmin')return;
    const del=card.querySelector('[data-delete-permanent]');
    if(!usernames.has(username)||(del&&!ids.has(String(del.dataset.deletePermanent))))card.remove();
  });
  inject();
}
window.addEventListener('horticulture-users-synced',e=>reconcile(e.detail?.users));
window.addEventListener('focus',()=>window.HorticultureSharedUsers?.pull?.());
document.addEventListener('visibilitychange',()=>{if(!document.hidden)window.HorticultureSharedUsers?.pull?.()});
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
setInterval(inject,1000);inject();
})();