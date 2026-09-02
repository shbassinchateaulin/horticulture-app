(()=>{
'use strict';
if(window.__sortiesScannerV5Loader)return;window.__sortiesScannerV5Loader=true;
function loadV5(){
  if(document.getElementById('sortiesScannerV5'))return;
  const s=document.createElement('script');
  s.id='sortiesScannerV5';
  s.src='./sorties-scanner-v5.js?v=1';
  s.async=false;
  document.head.appendChild(s);
}
loadV5();
})();