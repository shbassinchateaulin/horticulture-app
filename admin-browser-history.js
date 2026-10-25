/* Native Safari/macOS/iOS browser back/forward for dynamically switched admin views. */
(()=>{
 const root=document.querySelector('main.app');
 if(!root)return;
 const active=()=>root.querySelector('.view.active')?.id||'home';
 const valid=id=>!!id&&!!document.getElementById(id)?.classList.contains('view');
 const makeUrl=id=>{const url=new URL(location.href);if(id==='home')url.searchParams.delete('adminView');else url.searchParams.set('adminView',id);return url.pathname+url.search+url.hash};
 const initial=new URL(location.href).searchParams.get('adminView');
 let current=active(),restoring=false,scheduled=false;
 const show=id=>{
   if(!valid(id))id='home';
   root.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
   document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.go===id));
   document.getElementById('drawer')?.classList.remove('open');
   if(id==='home')document.getElementById('hortiPublicationFrame')?.contentWindow?.postMessage({type:'horti-publication-list-drafts'},location.origin);
   window.scrollTo({top:0,left:0,behavior:'instant'});
   current=id;
 };
 // Preserve an existing browser history entry and allow direct links to a view.
 history.replaceState({...history.state,hortiAdminView:valid(initial)?initial:current},'',makeUrl(valid(initial)?initial:current));
 if(valid(initial)){restoring=true;show(initial);restoring=false}
 const observe=new MutationObserver(()=>{
   if(scheduled)return;
   scheduled=true;
   queueMicrotask(()=>{
     scheduled=false;
     if(restoring)return;
     const next=active();
     if(next===current)return;
     current=next;
     history.pushState({...history.state,hortiAdminView:next},'',makeUrl(next));
   });
 });
 observe.observe(root,{subtree:true,attributes:true,attributeFilter:['class']});
 addEventListener('popstate',event=>{
   const urlView=new URL(location.href).searchParams.get('adminView');
   const id=valid(event.state?.hortiAdminView)?event.state.hortiAdminView:valid(urlView)?urlView:'home';
   restoring=true;show(id);
   queueMicrotask(()=>{restoring=false});
 });
})();