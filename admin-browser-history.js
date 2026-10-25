/* History-based admin routing. Safari gestures use real same-document history entries. */
(()=>{
 const root=document.querySelector('main.app');if(!root)return;
 const isView=id=>!!id&&document.getElementById(id)?.classList.contains('view');
 const active=()=>root.querySelector('.view.active')?.id||'home';
 const urlFor=id=>{const u=new URL(location.href);if(id==='home')u.searchParams.delete('adminView');else u.searchParams.set('adminView',id);return u.pathname+u.search+u.hash};
 let current=active(),restoring=false;
 function display(id){
  if(!isView(id))id='home';
  root.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',v.id===id));
  document.querySelectorAll('.nav').forEach(n=>n.classList.toggle('active',n.dataset.go===id));
  document.getElementById('drawer')?.classList.remove('open');
  if(id==='home')document.getElementById('hortiPublicationFrame')?.contentWindow?.postMessage({type:'horti-publication-list-drafts'},location.origin);
  window.scrollTo(0,0);current=id;
 }
 function navigate(id,{replace=false}={}){
  if(!isView(id))return;
  if(id===current){display(id);return;}
  if(!restoring){const method=replace?'replaceState':'pushState';history[method]({...history.state,hortiAdminView:id},'',urlFor(id))}
  display(id);
 }
 window.hortiNavigate=navigate;
 const originalGo=window.go;
 if(typeof originalGo==='function')window.go=function(id){navigate(id)};
 // Dynamic modules invoke their own goTo; observe class changes as a fallback.
 let queued=false;
 new MutationObserver(()=>{
  if(queued||restoring)return;queued=true;
  queueMicrotask(()=>{queued=false;if(restoring)return;const id=active();if(id!==current&&isView(id)){history.pushState({...history.state,hortiAdminView:id},'',urlFor(id));current=id}});
 }).observe(root,{subtree:true,attributes:true,attributeFilter:['class']});
 const initial=new URL(location.href).searchParams.get('adminView');
 history.replaceState({...history.state,hortiAdminView:isView(initial)?initial:current},'',urlFor(isView(initial)?initial:current));
 if(isView(initial))display(initial);
 addEventListener('popstate',e=>{
  const fromUrl=new URL(location.href).searchParams.get('adminView');
  const id=isView(e.state?.hortiAdminView)?e.state.hortiAdminView:isView(fromUrl)?fromUrl:'home';
  restoring=true;display(id);queueMicrotask(()=>{restoring=false});
 });
 // In iOS standalone mode there is no Safari chrome; offer edge-swipe back.
 const standalone=matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
 if(standalone){let start=null;document.addEventListener('touchstart',e=>{
  if(e.touches.length!==1)return;const t=e.touches[0];start=t.clientX<=24?{x:t.clientX,y:t.clientY}:null;
 },{passive:true});document.addEventListener('touchend',e=>{
  if(!start||e.changedTouches.length!==1)return;const t=e.changedTouches[0],dx=t.clientX-start.x,dy=t.clientY-start.y;start=null;
  if(dx>85&&Math.abs(dy)<Math.abs(dx)*.65&&history.length>1)history.back();
 },{passive:true});document.addEventListener('touchcancel',()=>{start=null},{passive:true})}
})();