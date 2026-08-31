(()=>{
'use strict';
function loadSortiesSafe(){
  if(document.getElementById('sortiesSafeV1'))return;
  const startUi=()=>{
    if(document.getElementById('sortiesSafeV1'))return;
    const x=document.createElement('script');
    x.id='sortiesSafeV1';
    x.src='./sorties-safe-v1.js?v=2';
    x.async=false;
    document.head.appendChild(x);
  };
  if(window.HorticultureSortiesSharedReady){Promise.resolve(window.HorticultureSortiesSharedReady).finally(startUi);return;}
  if(document.getElementById('sortiesSharedBridgeV1')){setTimeout(startUi,800);return;}
  const b=document.createElement('script');
  b.id='sortiesSharedBridgeV1';
  b.src='./sorties-shared-bridge-v1.js?v=1';
  b.async=false;
  b.onload=()=>Promise.resolve(window.HorticultureSortiesSharedReady).finally(startUi);
  b.onerror=startUi;
  document.head.appendChild(b);
}
function loadPageRestore(){
  if(document.getElementById('adherentsPageRestoreV1')){loadSortiesSafe();return;}
  const r=document.createElement('script');
  r.id='adherentsPageRestoreV1';
  r.src='./adherents-page-restore-v1.js?v=1';
  r.async=false;
  r.onload=loadSortiesSafe;
  document.head.appendChild(r);
}
function loadContactBridge(){
  if(document.getElementById('adherentsContactMenuV2')){loadPageRestore();return;}
  const c=document.createElement('script');
  c.id='adherentsContactMenuV2';
  c.src='./adherents-contact-menu-v2.js?v=1';
  c.async=false;
  c.onload=loadPageRestore;
  document.head.appendChild(c);
}
if(window.HorticultureAdherents){loadContactBridge();return;}
const s=document.createElement('script');
s.id='adherentsAdminRecoveredV2';
s.src='https://cdn.jsdelivr.net/gh/shbassinchateaulin/horticulture-app@cc767ff41cfc5c1006330ae6547926db93fdbb54/adherents-admin-v2.js?v=20260831';
s.async=false;
s.onload=loadContactBridge;
s.onerror=()=>{console.error('Impossible de charger le module Adhérents de secours.');loadSortiesSafe();};
document.head.appendChild(s);
})();