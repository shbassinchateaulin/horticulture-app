(()=>{
'use strict';
if(window.__sortiesScannerV6Loader)return;window.__sortiesScannerV6Loader=true;
function loadPresence(){
  if(document.getElementById('sortiesScannerAutoPresenceV1'))return;
  const p=document.createElement('script');p.id='sortiesScannerAutoPresenceV1';p.src='./sorties-scanner-auto-presence-v1.js?v=1';p.async=false;document.head.appendChild(p);
}
function loadDetails(){
  if(document.getElementById('sortiesScannerDetailsV1')){loadPresence();return;}
  const d=document.createElement('script');d.id='sortiesScannerDetailsV1';d.src='./sorties-scanner-details-v1.js?v=1';d.async=false;d.onload=loadPresence;d.onerror=loadPresence;document.head.appendChild(d);
}
function loadV6(){
  if(document.getElementById('sortiesScannerV6')){loadDetails();return;}
  const s=document.createElement('script');
  s.id='sortiesScannerV6';
  s.src='./sorties-scanner-v6.js?v=1';
  s.async=false;
  s.onload=loadDetails;s.onerror=loadDetails;
  document.head.appendChild(s);
}
loadV6();
})();