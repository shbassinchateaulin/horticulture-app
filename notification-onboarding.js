(()=>{
function logged(){return !!(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1'))}
function supported(){return 'Notification' in window&&'serviceWorker' in navigator}
let armed=false,overlay=null;
function showOverlay(){
  if(overlay||!logged()||!supported()||Notification.permission!=='default')return;
  const wrap=document.createElement('div');
  wrap.id='horticulture-notification-hint';
  wrap.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:rgba(8,20,14,.18);backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px);';
  const card=document.createElement('div');
  card.style.cssText='position:fixed;top:18px;left:18px;max-width:min(360px,calc(100vw - 36px));background:#fff;color:#183126;border-radius:18px;padding:16px 18px 17px;box-shadow:0 18px 45px rgba(0,0,0,.2);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.35;';
  card.innerHTML='<div style="font-size:27px;line-height:1;margin-bottom:8px">↖</div><div style="font-size:16px;font-weight:750;margin-bottom:4px">Autorisez les notifications</div><div style="font-size:13.5px;color:#52645b">Merci d\'accepter les notifications afin d\'être tenu au courant des différentes informations de l\'association.</div><div style="margin-top:10px;font-size:12px;color:#75847c">Cliquez une fois dans l\'application pour continuer.</div>';
  wrap.appendChild(card);document.body.appendChild(wrap);overlay=wrap;
}
function hideOverlay(){if(overlay){overlay.remove();overlay=null}}
async function request(){
  if(!logged()||!supported()||Notification.permission!=='default'){hideOverlay();return}
  try{
    window.OneSignalDeferred=window.OneSignalDeferred||[];
    window.OneSignalDeferred.push(async OneSignal=>{
      try{await OneSignal.Notifications.requestPermission()}catch(e){console.warn('OneSignal permission',e)}finally{hideOverlay()}
    });
  }catch(e){hideOverlay();console.warn('Notification permission',e)}
}
function arm(){
  if(armed||!logged()||!supported()||Notification.permission!=='default')return;
  armed=true;showOverlay();
  const once=()=>{document.removeEventListener('pointerdown',once,true);document.removeEventListener('keydown',once,true);request()};
  document.addEventListener('pointerdown',once,true);
  document.addEventListener('keydown',once,true);
}
window.addEventListener('pageshow',arm);
window.addEventListener('horticulture-users-synced',arm);
setTimeout(arm,600);
})();
