(()=>{
function logged(){return !!(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1'))}
function supported(){return 'Notification' in window&&'serviceWorker' in navigator}
let armed=false;
async function request(){
  if(!logged()||!supported()||Notification.permission!=='default')return;
  try{
    window.OneSignalDeferred=window.OneSignalDeferred||[];
    window.OneSignalDeferred.push(async OneSignal=>{
      try{await OneSignal.Notifications.requestPermission()}catch(e){console.warn('OneSignal permission',e)}
    });
  }catch(e){console.warn('Notification permission',e)}
}
function arm(){
  if(armed||!logged()||!supported()||Notification.permission!=='default')return;
  armed=true;
  const once=()=>{document.removeEventListener('pointerdown',once,true);document.removeEventListener('keydown',once,true);request()};
  document.addEventListener('pointerdown',once,true);
  document.addEventListener('keydown',once,true);
}
window.addEventListener('pageshow',arm);
window.addEventListener('horticulture-users-synced',arm);
setTimeout(arm,600);
})();
