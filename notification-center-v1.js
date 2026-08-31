(()=>{
let open=false;
function bell(){const top=document.querySelector('#appShell .top')||document.querySelector('.top');if(!top)return null;const b=top.querySelector('[data-notification-bell],.admBell');if(!b)return null;b.dataset.notificationBell='1';b.classList.add('admBell');b.type='button';b.setAttribute('aria-label','Notifications');b.setAttribute('title','Notifications');b.querySelector(':scope > em')?.remove();return b}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function items(){return window.HorticultureLightBadges?.getItems?.()||[]}
function closeTray(){open=false;document.querySelector('.notifCenterTray')?.remove()}
function ago(v){const d=Date.parse(v);if(!d)return'';const m=Math.max(0,Math.floor((Date.now()-d)/60000));if(m<1)return'À l’instant';if(m<60)return'Il y a '+m+' min';const h=Math.floor(m/60);if(h<24)return'Il y a '+h+' h';return new Date(d).toLocaleDateString('fr-FR')}
function openNotification(n){
  if(!n)return;
  const type=String(n.type||'').toLowerCase(),data=(n.data&&typeof n.data==='object')?n.data:{};
  window.HorticultureLightBadges?.markItemRead?.(String(n.id||''));
  closeTray();
  try{
    if(type==='helloasso-membership'||String(data.view||'').toLowerCase()==='adherents'){
      if(typeof window.HorticultureAdherents?.open==='function')window.HorticultureAdherents.open();
      else window.dispatchEvent(new CustomEvent('horticulture-notification-click',{detail:{type:type,data:{...data,view:'adherents'}}}));
      return;
    }
    if(type==='suggestion'){
      if(typeof window.HorticultureSuggestions?.show==='function')window.HorticultureSuggestions.show();
      return;
    }
  }catch(e){console.warn('Ouverture notification impossible',e)}
}
function renderTray(){document.querySelector('.notifCenterTray')?.remove();const list=items(),d=document.createElement('div');d.className='notifCenterTray';d.style.cssText='position:fixed;right:18px;top:78px;width:min(410px,calc(100vw - 28px));max-height:calc(100vh - 98px);overflow:auto;background:#fff;border:1px solid #e1e7e3;border-radius:18px;box-shadow:0 18px 55px #001a1240;z-index:1000000;padding:16px;color:#173126';d.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><div><b style="font-size:18px">Notifications</b><div style="font-size:12px;color:#718078;margin-top:2px">${list.length?list.length+' non lue'+(list.length>1?'s':''):'Aucune notification non lue'}</div></div><button data-close style="border:0;background:transparent;font-size:24px;cursor:pointer">×</button></div>${list.length?'<div data-list></div><button data-clear-all style="width:100%;margin-top:12px;border:1px solid #dfe6e2;background:#fff;border-radius:10px;padding:10px;color:#5f6e67;font-weight:700;cursor:pointer">Tout marquer comme lu</button>':'<div style="padding:22px 8px;color:#718078;font-size:13px;text-align:center">Aucune notification.</div>'}`;document.body.appendChild(d);if(list.length){const wrap=d.querySelector('[data-list]');wrap.innerHTML=list.map((n,i)=>`<button data-item="${i}" style="display:block;width:100%;text-align:left;border:0;border-top:1px solid #edf0ee;background:#f1f8f3;padding:13px 10px;cursor:pointer;color:#173126"><b style="font-size:14px">${esc(n.title||'Notification')}</b><div style="font-size:12px;color:#5f6e67;margin-top:3px;line-height:1.4">${esc(n.message||'')}</div><small style="color:#8a9690">${esc(ago(n.createdAt))} · toucher pour ouvrir</small></button>`).join('');wrap.querySelectorAll('[data-item]').forEach(btn=>btn.onclick=()=>openNotification(list[Number(btn.dataset.item)]));d.querySelector('[data-clear-all]').onclick=()=>{window.HorticultureLightBadges?.clearAll?.();if(open)renderTray()}}d.querySelector('[data-close]').onclick=closeTray}
function openTray(){open=true;renderTray()}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-notification-bell],.admBell');if(!b)return;e.preventDefault();e.stopPropagation();if(open)closeTray();else openTray()},false);
window.addEventListener('horticulture-light-badges-updated',()=>{if(open)renderTray()});
setTimeout(()=>bell(),300);window.addEventListener('pageshow',()=>bell());
window.HorticultureNotificationCenter={refresh:async()=>{window.HorticultureLightBadges?.render?.();return items()},getNotifications:()=>items(),getUnread:()=>items(),markSuggestionRead:id=>window.HorticultureLightBadges?.markSuggestionRead?.(id),open:openTray};
})();