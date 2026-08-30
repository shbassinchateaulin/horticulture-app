(()=>{
'use strict';
const LABEL='Ajouter un dépouillement papier';
let observed=null;
let observer=null;
function bind(){
  const tab=document.querySelector('#agConsultation [data-tab="collect"]');
  if(!tab)return;
  if(tab.textContent!==LABEL)tab.textContent=LABEL;
  if(tab===observed)return;
  if(observer)observer.disconnect();
  observed=tab;
  observer=new MutationObserver(()=>{
    if(tab.textContent!==LABEL)tab.textContent=LABEL;
  });
  observer.observe(tab,{childList:true,characterData:true,subtree:true});
}
const rootObserver=new MutationObserver(bind);
rootObserver.observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('click',()=>queueMicrotask(bind),true);
bind();
})();