(()=>{
'use strict';
// Recovery loader: the working Adherents module is loaded from the last known-good revision.
// This keeps the live file non-empty after an accidental overwrite while preserving the existing module API.
if(window.HorticultureAdherents)return;
const s=document.createElement('script');
s.id='adherentsAdminRecoveredV2';
s.src='https://cdn.jsdelivr.net/gh/shbassinchateaulin/horticulture-app@cc767ff41cfc5c1006330ae6547926db93fdbb54/adherents-admin-v2.js';
s.async=false;
s.onerror=()=>console.error('Impossible de charger le module Adhérents de secours.');
document.head.appendChild(s);
})();
