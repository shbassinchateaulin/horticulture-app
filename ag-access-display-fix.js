(()=>{
const LABEL='Consultation AG';
function fix(){
  const cards=[...document.querySelectorAll('#access .userCard2')];
  for(const card of cards){
    const username=[...card.querySelectorAll('small')].find(x=>(x.textContent||'').includes('Identifiant'))?.textContent||'';
    if(!username.toLowerCase().includes('superadmin'))continue;
    const line=[...card.querySelectorAll('small')].find(x=>(x.textContent||'').trim().startsWith('Accès :'));
    if(!line||line.textContent.includes(LABEL))continue;
    const current=line.textContent.replace(/^Accès\s*:\s*/,'').trim();
    line.textContent='Accès : '+(current&&current!=='Aucun'?current+', ':'')+LABEL;
  }
}
let queued=false;
new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;fix()})}).observe(document.documentElement,{childList:true,subtree:true});
window.addEventListener('pageshow',fix);
window.addEventListener('horticulture-users-synced',fix);
setTimeout(fix,0);setTimeout(fix,400);
})();