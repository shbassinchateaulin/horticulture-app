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
const icons={
 share:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L8 7m4-4 4 4M6 10H4.8A1.8 1.8 0 0 0 3 11.8v7.4A1.8 1.8 0 0 0 4.8 21h14.4a1.8 1.8 0 0 0 1.8-1.8v-7.4a1.8 1.8 0 0 0-1.8-1.8H18"/></svg>',
 more:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
 home:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5V20H5a1 1 0 0 1-1-1v-8.5Z"/><path d="M9 20v-6h6v6M12 8v6m-3-3h6"/></svg>',
 add:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
 app:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 15c2.5-5 5.5-6.5 8-7-1 4-3.2 7-7.5 8.5M10 13c1 .1 2 .5 3 1.2"/></svg>'
};
function icon(type){return '<span style="flex:0 0 34px;width:34px;height:34px;border-radius:9px;background:#f0f5f2;color:#24613e;display:flex;align-items:center;justify-content:center"><span style="display:block;width:21px;height:21px">'+icons[type].replace('<svg ','<svg style="width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round" ')+'</span></span>'}
function step(n,type,text){return '<div style="display:flex;gap:10px;margin-top:10px;align-items:center"><span style="flex:0 0 23px;height:23px;border-radius:50%;background:#244c36;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800">'+n+'</span>'+icon(type)+'<div style="font-size:13.5px;color:#33483e;line-height:1.32">'+text+'</div></div>'}
function showIOSInstall(){
 if(overlay||!logged()||!isIOS()||standalone())return;
 const chrome=isChromeIOS(),wrap=makeWrap(),card=document.createElement('div');card.style.cssText=cardStyle(490);
 let html='<div style="font-size:17px;font-weight:780;margin-bottom:5px">Activez les notifications sur iPhone</div><div style="font-size:13.5px;color:#52645b;margin-bottom:5px">Installez d’abord l’application sur votre écran d’accueil. Suivez simplement les icônes ci-dessous.</div>';
 if(chrome){html+=step(1,'share','Touchez <b>Partager</b>, en haut à droite dans Chrome.')+step(2,'more','Touchez <b>En savoir plus</b> dans le menu.')+step(3,'home','Descendez légèrement puis touchez <b>Ajouter à l’écran d’accueil</b>.')+step(4,'add','Touchez <b>Ajouter</b> sans modifier le nom ni les réglages.')+step(5,'app','Ouvrez l’application depuis sa nouvelle icône sur l’écran d’accueil.');}
 else{html+=step(1,'more','Dans Safari, ouvrez le menu depuis la barre en bas de l’écran.')+step(2,'share','Touchez <b>Partager</b>, puis <b>En savoir plus</b> si cette option apparaît.')+step(3,'home','Descendez légèrement puis touchez <b>Sur l’écran d’accueil</b>.')+step(4,'add','Touchez <b>Ajouter</b> sans modifier le nom ni les réglages.')+step(5,'app','Ouvrez l’application depuis sa nouvelle icône sur l’écran d’accueil.');}
 html+='<div style="margin-top:14px;padding:10px 11px;border-radius:12px;background:#f4f7f5;font-size:12.5px;color:#607068">Une fois l’application ouverte depuis son icône, elle vous proposera automatiquement d’autoriser les notifications.</div>';
 card.innerHTML=html;wrap.appendChild(card);document.body.appendChild(wrap);overlay=wrap;setTimeout(hideOverlay,22000)
}
function showPermissionOverlay(){if(overlay||!logged()||!supported()||Notification.permission!=='default')return;const wrap=makeWrap(),card=document.createElement('div');card.style.cssText=cardStyle(isIOS()?420:380);card.innerHTML='<div style="display:flex;gap:11px;align-items:center;margin-bottom:8px">'+icon('app')+'<div style="font-size:16px;font-weight:750">Autorisez les notifications</div></div><div style="font-size:13.5px;color:#52645b">Merci d\'accepter les notifications afin d\'être tenu au courant des différentes informations de l\'association.</div><div style="margin-top:10px;font-size:12px;color:#75847c">Touchez une fois dans l\'application pour continuer.</div>';wrap.appendChild(card);document.body.appendChild(wrap);overlay=wrap}
async function request(){if(!logged()||!supported()||Notification.permission!=='default'){hideOverlay();return}try{window.OneSignalDeferred=window.OneSignalDeferred||[];window.OneSignalDeferred.push(async OneSignal=>{try{await OneSignal.Notifications.requestPermission()}catch(e){console.warn('OneSignal permission',e)}finally{hideOverlay()}})}catch(e){hideOverlay();console.warn('Notification permission',e)}}
function arm(){if(armed||!logged())return;if(isIOS()&&!standalone()){armed=true;showIOSInstall();return}if(!supported()||Notification.permission!=='default')return;armed=true;showPermissionOverlay();const once=()=>{document.removeEventListener('pointerdown',once,true);document.removeEventListener('keydown',once,true);request()};document.addEventListener('pointerdown',once,true);document.addEventListener('keydown',once,true)}
window.addEventListener('pageshow',arm);window.addEventListener('horticulture-users-synced',arm);setTimeout(arm,600)
})();
