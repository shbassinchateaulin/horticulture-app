(()=>{
'use strict';
if(window.__horticultureMessagingNoPollingV1)return;window.__horticultureMessagingNoPollingV1=true;
const native=window.setInterval.bind(window);
window.setInterval=function(fn,delay,...args){
  try{
    const src=typeof fn==='function'?Function.prototype.toString.call(fn):String(fn||'');
    if(Number(delay)===5000&&/refreshChat\s*\(/.test(src)&&/peer/.test(src)){
      console.info('Legacy messaging 5s redraw polling disabled');
      return 0;
    }
  }catch(_){ }
  return native(fn,delay,...args);
};
})();