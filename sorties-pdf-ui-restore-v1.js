(()=>{
'use strict';
if(window.__sortiesPdfUiRestoreV1)return;window.__sortiesPdfUiRestoreV1=true;
function clean(){
  const root=document.querySelector('#sortiesAdmin');
  if(!root)return;
  const modern=root.querySelector('[data-sfx-pdf]');
  if(!modern)return;
  root.querySelectorAll('[data-pdf]').forEach(b=>{if(b!==modern)b.remove()});
}
new MutationObserver(()=>requestAnimationFrame(clean)).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#sortiesAdmin [data-pdf]');
  if(!b)return;
  const modern=document.querySelector('#sortiesAdmin [data-sfx-pdf]');
  if(modern&&b!==modern){e.preventDefault();e.stopImmediatePropagation();modern.click()}
},true);
clean();
})();