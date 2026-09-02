(()=>{
'use strict';
if(window.__sortiesScannerV6Loader)return;window.__sortiesScannerV6Loader=true;
function loadV6(){
  if(document.getElementById('sortiesScannerV6'))return;
  const s=document.createElement('script');
  s.id='sortiesScannerV6';
  s.src='./sorties-scanner-v6.js?v=1';
  s.async=false;
  document.head.appendChild(s);
}
loadV6();
})();