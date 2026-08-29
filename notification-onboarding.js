(()=>{
function logged(){return !!(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1'))}
function supported(){return 'Notification' in window&&'serviceWorker' in navigator}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function standalone(){return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
let armed=false,overlay=null;
function hideOverlay(){if(overlay){overlay.remove();overlay=null}}
function makeWrap(){
  const wrap=document.createElement('div');
  wrap.id='horticulture-notification-hint';
  wrap.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:rgba(8,20,14,.18);backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';
  return wrap;
}
function cardStyle(maxWidth){return 'position:relative;width:100%;max-width:'+maxWidth+'px;background:#fff;color:#183126;border-radius:20px;padding:18px 20px;box-shadow:0 18px 45px rgba(0,0,0,.22);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.4;box-sizing:border-box;text-align:left;'}
function showIOSInstall(){
  if(overlay||!logged()||!isIOS()||standalone())return;
  const wrap=makeWrap();
  const card=document.createElement('div');
  card.style.cssText=cardStyle(460);
  card.innerHTML='<div style="font-size:16px;font-weight:760;margin-bottom:5px">Activez les notifications sur iPhone</div><div style="font-size:13.5px;color:#52645b">Pour recevoir les notifications, ajoutez d’abord l’application à votre écran d’accueil.</div><div style="margin-top:10px;font-size:13px;color:#33483e"><b>1.</b> Touchez <span style="font-size:18px;vertical-align:-1px">⇧</span> <b>Partager</b><br><b>2.</b> Choisissez <b>Sur l’écran d’accueil</b><br><b>3.</b> Ouvrez ensuite l’application depuis son icône.</div><div style="margin-top:10px;font-size:12px;color:#75847c">La demande d’autorisation des notifications apparaîtra ensuite dans l’application.</div>';
  wrap.appendChild(card);document.body.appendChild(wrap);overlay=wrap;
  setTimeout(hideOverlay,12000);
}
function showPermissionOverlay(){
  if(overlay||!logged()||!supported()||Notification.permission!=='default')return;
  const wrap=makeWrap();
  const card=document.createElement('div');
  card.style.cssText=cardStyle(isIOS()?420:380);
  card.innerHTML='<div style="font-size:16px;font-weight:750;margin-bottom:4px">Autorisez les notifications</div><div style="font-size:13.5px;color:#52645b">Merci d\'accepter les notifications afin d\'être tenu au courant des différentes informations de l\'association.</div><div style="margin-top:10px;font-size:12px;color:#75847c">Touchez une fois dans l\'application pour continuer.</div>';
  wrap.appendChild(card);document.body.appendChild(wrap);overlay=wrap;
}
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
  if(armed||!logged())return;
  if(isIOS()&&!standalone()){armed=true;showIOSInstall();return}
  if(!supported()||Notification.permission!=='default')return;
  armed=true;showPermissionOverlay();
  const once=()=>{document.removeEventListener('pointerdown',once,true);document.removeEventListener('keydown',once,true);request()};
  document.addEventListener('pointerdown',once,true);
  document.addEventListener('keydown',once,true);
}
window.addEventListener('pageshow',arm);
window.addEventListener('horticulture-users-synced',arm);
setTimeout(arm,600);
})();
