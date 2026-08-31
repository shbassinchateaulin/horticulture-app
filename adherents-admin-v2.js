(()=>{
'use strict';
function loadSortiesSafe(){
  if(document.getElementById('sortiesSafeV1'))return;
  const loadEnhancements=()=>{
    if(document.getElementById('sortiesEnhancementsV1'))return;
    const e=document.createElement('script');e.id='sortiesEnhancementsV1';e.src='./sorties-enhancements-v1.js?v=1';e.async=false;document.head.appendChild(e);
  };
  const loadAutoUi=()=>{
    if(document.getElementById('sortiesAutoUiV1')){loadEnhancements();return;}
    const a=document.createElement('script');
    a.id='sortiesAutoUiV1';
    a.src='./sorties-auto-ui-v1.js?v=1';
    a.async=false;
    a.onload=loadEnhancements;
    a.onerror=loadEnhancements;
    document.head.appendChild(a);
  };
  const startUi=()=>{
    if(document.getElementById('sortiesSafeV1'))return;
    const x=document.createElement('script');
    x.id='sortiesSafeV1';
    x.src='./sorties-safe-v1.js?v=2';
    x.async=false;
    x.onload=loadAutoUi;
    document.head.appendChild(x);
  };
  if(window.HorticultureSortiesSharedReady){Promise.resolve(window.HorticultureSortiesSharedReady).finally(startUi);return;}
  if(document.getElementById('sortiesSharedBridgeV1')){setTimeout(startUi,800);return;}
  const b=document.createElement('script');
  b.id='sortiesSharedBridgeV1';
  b.src='./sorties-shared-bridge-v1.js?v=2';
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