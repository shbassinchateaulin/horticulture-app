(()=>{
const K='horticulture-admin-users-v2';
function getUsers(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function currentRole(){return document.querySelector('#role')?.textContent?.trim()||document.querySelector('#drole')?.textContent?.trim()||''}
function inject(){
  if(currentRole()!=='Super Admin')return;
  document.querySelectorAll('#access .userCard2').forEach(card=>{
    if(card.querySelector('[data-delete-permanent]'))return;
    const text=card.textContent||'';
    if(/Super Admin/.test(text))return;
    const username=[...card.querySelectorAll('small')].map(x=>x.textContent).find(x=>x.includes('Identifiant'))?.split(':').slice(1).join(':').trim();
    if(!username)return;
    const actions=card.querySelector('.userActions');
    if(!actions)return;
    const btn=document.createElement('button');
    btn.className='miniBtn danger';
    btn.dataset.deletePermanent=username;
    btn.textContent='Supprimer définitivement';
    btn.onclick=()=>{
      if(!confirm(`Supprimer définitivement ${username} ?\n\nCette personne disparaîtra de la liste et cette action est irréversible.`))return;
      const users=getUsers();
      const next=users.filter(u=>u.username!==username || u.id==='superadmin');
      localStorage.setItem(K,JSON.stringify(next));
      location.reload();
    };
    actions.appendChild(btn);
  });
}
new MutationObserver(inject).observe(document.body,{childList:true,subtree:true});
setInterval(inject,1000);
inject();
})();