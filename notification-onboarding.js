(()=>{
function logged(){return !!(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1'))}
function supported(){return 'Notification' in window&&'serviceWorker' in navigator}
function isIOS(){return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function isChromeIOS(){return /CriOS/i.test(navigator.userAgent)}
function standalone(){return window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true}
let armed=false,overlay=null;
function hideOverlay(){if(overlay){overlay.remove();overlay=null}}
function makeWrap(){const wrap=document.createElement('div');wrap.id='horticulture-notification-hint';wrap.style.cssText='position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:rgba(8,20,14,.18);backdrop-filter:blur(1.5px);-webkit-backdrop-filter:blur(1.5px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;';return wrap}
function cardStyle(maxWidth){return 'position:relative;width:100%;max-width:'+maxWidth+'px;background:#fff;color:#183126;border-radius:20px;padding:19px 20px;box-shadow:0 18px 45px rgba(0,0,0,.22);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;line-height:1.42;box-sizing:border-box;text-align:left;'}
function step(n,text){return '<div style="display:flex;gap:10px;margin-top:9px;align-items:flex-start"><span style="flex:0 0 24px;height:24px;border-radius:50%;background:#edf4ef;color:#244c36;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800">'+n+'</span><div style="padding-top:2px;font-size:13.5px;color:#33483e">'+text+'</div></div>'}
function showIOSInstall(){
 if(overlay||!logged()||!isIOS()||standalone())return;
 const chrome=isChromeIOS(),wrap=makeWrap(),card=document.createElement('div');card.style.cssText=cardStyle(470);
 let html='<div style="font-size:17px;font-weight:780;margin-bottom:5px">Activez les notifications sur iPhone</div><div style="font-size:13.5px;color:#52645b;margin-bottom:4px">Apple demande d’abord d’installer l’application sur l’écran d’accueil. Ensuite, ouvrez-la depuis sa nouvelle icône pour autoriser les notifications.</div>';
 if(chrome){
   html+=step(1,'Dans Chrome, touchez l’icône <b>Partager</b> en haut à droite.')+step(2,'Dans le menu, touchez <b>En savoir plus</b>.')+step(3,'Descendez légèrement puis choisissez <b>Ajouter à l’écran d’accueil</b>.')+step(4,'Touchez <b>Ajouter</b>. Ne modifiez pas le nom ni les autres réglages.')+step(5,'Fermez Chrome et ouvrez l’application depuis l’icône ajoutée sur votre écran d’accueil.');
 }else{
   html+=step(1,'Dans Safari, touchez la barre d’adresse en bas puis le bouton de menu, et choisissez <b>Partager</b>.')+step(2,'Si nécessaire, touchez <b>En savoir plus</b> pour afficher toutes les actions.')+step(3,'Descendez légèrement puis choisissez <b>Sur l’écran d’accueil</b>.')+step(4,'Touchez <b>Ajouter</b>. Ne modifiez pas le nom ni les autres réglages.')+step(5,'Ouvrez ensuite l’application depuis l’icône ajoutée sur votre écran d’accueil.');
 }
 html+='<div style="margin-top:13px;padding:10px 11px;border-radius:12px;background:#f4f7f5;font-size:12.5px;color:#607068">Une fois dans l’application installée, la demande « Autoriser les notifications » apparaîtra automatiquement.</div>';
 card.innerHTML=html;wrap.appendChild(card);document.body.appendChild(wrap);overlay=wrap;setTimeout(hideOverlay,20000)
}
function showPermissionOverlay(){if(overlay||!logged()||!supported()||Notification.permission!=='default')return;const wrap=makeWrap(),card=document.createElement('div');card.style.cssText=cardStyle(isIOS()?420:380);card.innerHTML='<div style="font-size:16px;font-weight:750;margin-bottom:4px">Autorisez les notifications</div><div style="font-size:13.5px;color:#52645b">Merci d\'accepter les notifications afin d\'être tenu au courant des différentes informations de l\'association.</div><div style="margin-top:10px;font-size:12px;color:#75847c">Touchez une fois dans l\'application pour continuer.</div>';wrap.appendChild(card);document.body.appendChild(wrap);overlay=wrap}
async function request(){if(!logged()||!supported()||Notification.permission!=='default'){hideOverlay();return}try{window.OneSignalDeferred=window.OneSignalDeferred||[];window.OneSignalDeferred.push(async OneSignal=>{try{await OneSignal.Notifications.requestPermission()}catch(e){console.warn('OneSignal permission',e)}finally{hideOverlay()}})}catch(e){hideOverlay();console.warn('Notification permission',e)}}
function arm(){if(armed||!logged())return;if(isIOS()&&!standalone()){armed=true;showIOSInstall();return}if(!supported()||Notification.permission!=='default')return;armed=true;showPermissionOverlay();const once=()=>{document.removeEventListener('pointerdown',once,true);document.removeEventListener('keydown',once,true);request()};document.addEventListener('pointerdown',once,true);document.addEventListener('keydown',once,true)}
window.addEventListener('pageshow',arm);window.addEventListener('horticulture-users-synced',arm);setTimeout(arm,600)
})();
