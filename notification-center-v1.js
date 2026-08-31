(()=>{
'use strict';
// Notifications internes désactivées. OneSignal reste le seul système de notifications.
document.querySelectorAll('.notifCenterTray,.pushBellBadge,.pushSugBadge').forEach(el=>el.remove());
function clean(){
  document.querySelectorAll('.notifCenterTray,.pushBellBadge,.pushSugBadge').forEach(el=>el.remove());
  const bell=document.querySelector('.admBell,[data-notification-bell]');
  if(bell){
    bell.removeAttribute('data-notification-bell');
    bell.style.display='none';
  }
}
clean();
setTimeout(clean,300);
setTimeout(clean,1000);
window.addEventListener('pageshow',clean);
window.HorticultureNotificationCenter=undefined;
})();
