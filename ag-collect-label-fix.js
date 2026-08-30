(()=>{
'use strict';
function apply(){
  const root=document.querySelector('#agConsultation');
  if(!root)return;
  const tab=root.querySelector('[data-tab="collect"]');
  if(tab)tab.textContent='Ajouter un dépouillement papier';
}
setInterval(apply,700);
document.addEventListener('click',e=>{if(e.target.closest?.('#agConsultation'))setTimeout(apply,50)},true);
setTimeout(apply,250);
})();
