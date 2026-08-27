(()=>{
const K='horticulture-admin-users-v2';
function users(){try{return JSON.parse(localStorage.getItem(K)||'[]')}catch{return[]}}
function notify(msg,ok=true){let n=document.getElementById('permSyncNotice');if(!n){n=document.createElement('div');n.id='permSyncNotice';n.style.cssText='position:fixed;right:18px;bottom:18px;z-index:99999;padding:10px 14px;border-radius:12px;background:#fff;box-shadow:0 8px 30px #0002;font:600 13px system-ui;transition:.2s';document.body.appendChild(n)}n.textContent=msg;n.style.opacity='1';n.style.color=ok?'#185b42':'#a32626';clearTimeout(n._t);n._t=setTimeout(()=>n.style.opacity='0',1800)}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('[data-save]');if(!b)return;
 const id=String(b.dataset.save||'');
 /* Let the existing Super Admin handler first update localStorage, then push that exact updated user to Google Sheets. */
 setTimeout(async()=>{
  const u=users().find(x=>String(x.id)===id);if(!u)return;
  try{
   if(!window.HorticultureSharedUsers?.updateUser)throw new Error('Synchronisation indisponible');
   await window.HorticultureSharedUsers.updateUser(u);
   notify('Accès synchronisés');
  }catch(err){console.warn('Permission cloud sync failed',err);notify('Erreur de synchronisation',false)}
 },0);
},true);
})();