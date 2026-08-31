(()=>{
'use strict';
if(window.HorticultureAdherents)return;
const s=document.createElement('script');
s.id='adherentsAdminRecoveredV2';
s.src='https://cdn.jsdelivr.net/gh/shbassinchateaulin/horticulture-app@cc767ff41cfc5c1006330ae6547926db93fdbb54/adherents-admin-v2.js?v=20260831';
s.async=false;
s.onerror=()=>console.error('Impossible de charger le module Adhérents de secours.');
document.head.appendChild(s);
})();