(()=>{
'use strict';
function loadSortiesSafe(){
  if(document.getElementById('sortiesSafeV1'))return;
  const loadDetails=()=>{if(document.getElementById('sortiesDetailsPlusV1'))return;const d=document.createElement('script');d.id='sortiesDetailsPlusV1';d.src='./sorties-details-plus-v1.js?v=1';d.async=false;document.head.appendChild(d)};
  const loadSimpleUi=()=>{if(document.getElementById('sortiesUiSimpleV1')){loadDetails();return;}const u=document.createElement('script');u.id='sortiesUiSimpleV1';u.src='./sorties-ui-simple-v1.js?v=1';u.async=false;u.onload=loadDetails;u.onerror=loadDetails;document.head.appendChild(u)};
  const loadEnhancements=()=>{if(document.getElementById('sortiesEnhancementsV1')){loadSimpleUi();return;}const e=document.createElement('script');e.id='sortiesEnhancementsV1';e.src='./sorties-enhancements-v1.js?v=2';e.async=false;e.onload=loadSimpleUi;e.onerror=loadSimpleUi;document.head.appendChild(e)};
  const loadAutoUi=()=>{if(document.getElementById('sortiesAutoUiV1')){loadEnhancements();return;}const a=document.createElement('script');a.id='sortiesAutoUiV1';a.src='./sorties-auto-ui-v1.js?v=1';a.async=false;a.onload=loadEnhancements;a.onerror=loadEnhancements;document.head.appendChild(a)};
  const startUi=()=>{if(document.getElementById('sortiesSafeV1'))return;const x=document.createElement('script');x.id='sortiesSafeV1';x.src='./sorties-safe-v1.js?v=3';x.async=false;x.onload=loadAutoUi;document.head.appendChild(x)};
  if(!document.getElementById('sortiesQrPolyfillV1')){const q=document.createElement('script');q.id='sortiesQrPolyfillV1';q.src='./sorties-qr-polyfill-v1.js?v=1';q.async=true;document.head.appendChild(q)}
  startUi();
  if(!document.getElementById('sortiesSharedBridgeV1')){const b=document.createElement('script');b.id='sortiesSharedBridgeV1';b.src='./sorties-shared-bridge-v1.js?v=2';b.async=true;document.head.appendChild(b)}
}
function loadPageRestore(){if(document.getElementById('adherentsPageRestoreV1')){loadSortiesSafe();return;}const r=document.createElement('script');r.id='adherentsPageRestoreV1';r.src='./adherents-page-restore-v1.js?v=1';r.async=false;r.onload=loadSortiesSafe;document.head.appendChild(r)}
function loadContactBridge(){if(document.getElementById('adherentsContactMenuV2')){loadPageRestore();return;}const c=document.createElement('script');c.id='adherentsContactMenuV2';c.src='./adherents-contact-menu-v2.js?v=1';c.async=false;c.onload=loadPageRestore;document.head.appendChild(c)}
if(window.HorticultureAdherents){loadContactBridge();return;}
const s=document.createElement('script');s.id='adherentsAdminRecoveredV2';s.src='https://cdn.jsdelivr.net/gh/shbassinchateaulin/horticulture-app@cc767ff41cfc5c1006330ae6547926db93fdbb54/adherents-admin-v2.js?v=20260831';s.async=false;s.onload=loadContactBridge;s.onerror=()=>{console.error('Impossible de charger le module Adhérents de secours.');loadSortiesSafe();};document.head.appendChild(s);
})();