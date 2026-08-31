(()=>{
'use strict';
// Badges et polling de notifications internes désactivés.
// OneSignal continue de fonctionner via OneSignalSDK + onesignal-init.js.
function clean(){
  document.querySelectorAll('.pushBellBadge,.pushSugBadge').forEach(el=>el.remove());
}
clean();
window.addEventListener('pageshow',clean);
window.HorticultureLightBadges=undefined;
})();
