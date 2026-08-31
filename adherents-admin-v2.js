(()=>{
'use strict';
function loadContactBridge(){
  if(document.getElementById('adherentsContactMenuV2'))return;
  const c=document.createElement('script');
  c.id='adherentsContactMenuV2';
  c.src='./adherents-contact-menu-v2.js?v=1';
  c.async=false;
  document.head.appendChild(c);
}
if(window.HorticultureAdherents){loadContactBridge();return;}
const s=document.createElement('script');
s.id='adherentsAdminRecoveredV2';
s.src='https://cdn.jsdelivr.net/gh/shbassinchateaulin/horticulture-app@cc767ff41cfc5c1006330ae6547926db93fdbb54/adherents-admin-v2.js?v=20260831';
s.async=false;
s.onload=loadContactBridge;
s.onerror=()=>console.error('Impossible de charger le module Adhérents de secours.');
document.head.appendChild(s);
})();