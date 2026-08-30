(()=>{
let open=false;
function bell(){const top=document.querySelector('#appShell .top')||document.querySelector('.top');if(!top)return null;let b=top.querySelector('[data-notification-bell],.admBell');if(!b)return null;b.dataset.notificationBell='1';b.classList.add('admBell');b.type='button';b.setAttribute('aria-label','Notifications');b.setAttribute('title','Notifications');b.querySelector(':scope > em')?.remove();return b}
function closeTray(){open=false;document.querySelector('.notifCenterTray')?.remove()}
function renderTray(){document.querySelector('.notifCenterTray')?.remove();const d=document.createElement('div');d.className='notifCenterTray';d.style.cssText='position:fixed;right:18px;top:78px;width:min(390px,calc(100vw - 28px));background:#fff;border:1px solid #e1e7e3;border-radius:18px;box-shadow:0 18px 55px #001a1240;z-index:1000000;padding:16px;color:#173126';d.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><b style="font-size:18px">Notifications</b><button data-close style="border:0;background:transparent;font-size:24px;cursor:pointer">×</button></div><div style="padding:18px 4px 6px;color:#718078;font-size:13px;line-height:1.45">Les notifications système sont gérées par OneSignal. Ce panneau est volontairement allégé pour préserver la stabilité de l’application.</div>';document.body.appendChild(d);d.querySelector('[data-close]').onclick=closeTray}
function openTray(){open=true;renderTray()}
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-notification-bell],.admBell');if(!b)return;e.preventDefault();e.stopPropagation();if(open)closeTray();else openTray()},false);
setTimeout(()=>{bell()},300);
window.addEventListener('pageshow',()=>bell());
window.HorticultureNotificationCenter={refresh:async()=>[],getNotifications:()=>[],getUnread:()=>[],open:openTray};
})();