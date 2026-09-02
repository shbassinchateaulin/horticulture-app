(()=>{
'use strict';
if(window.__sortiesScannerV5Loader)return;window.__sortiesScannerV5Loader=true;
function loadAudio(){
  if(document.getElementById('sortiesScannerAudioV1'))return;
  const a=document.createElement('script');
  a.id='sortiesScannerAudioV1';
  a.src='./sorties-scanner-audio-v1.js?v=1';
  a.async=false;
  document.head.appendChild(a);
}
function loadV5(){
  if(document.getElementById('sortiesScannerV5')){loadAudio();return;}
  const s=document.createElement('script');
  s.id='sortiesScannerV5';
  s.src='./sorties-scanner-v5.js?v=1';
  s.async=false;
  s.onload=loadAudio;
  s.onerror=loadAudio;
  document.head.appendChild(s);
}
loadV5();
})();