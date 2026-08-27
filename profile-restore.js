(()=>{
const PAGEKEY='horticulture-app-current-page';
if(localStorage.getItem(PAGEKEY)!=='profile')return;
let tries=0;
function restore(){
  if(localStorage.getItem(PAGEKEY)!=='profile')return;
  const candidates=[...document.querySelectorAll('.dlist button,.admProfile,.dashTile,.space,[data-go="profile"]')];
  const btn=candidates.find(x=>x.dataset?.go==='profile'||x.classList?.contains('admProfile')||(x.textContent||'').replace(/\s+/g,' ').trim().toLowerCase().includes('mon profil'));
  if(btn){btn.click();return;}
  if(++tries<12)setTimeout(restore,80);
}
setTimeout(restore,90);
})();