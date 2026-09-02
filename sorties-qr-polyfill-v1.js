(()=>{
'use strict';
if(window.BarcodeDetector||window.__sortiesQrPolyfillLoading)return;
window.__sortiesQrPolyfillLoading=true;
let resolveReady;const ready=new Promise(r=>resolveReady=r);
class PolyfillBarcodeDetector{
  constructor(){this.canvas=document.createElement('canvas');this.ctx=this.canvas.getContext('2d',{willReadFrequently:true})}
  static async getSupportedFormats(){return['qr_code']}
  async detect(source){try{await Promise.race([ready,new Promise(r=>setTimeout(r,2500))]);if(!window.jsQR)return[];const w=source.videoWidth||source.naturalWidth||source.width||0,h=source.videoHeight||source.naturalHeight||source.height||0;if(!w||!h)return[];const max=720,scale=Math.min(1,max/Math.max(w,h)),cw=Math.max(1,Math.round(w*scale)),ch=Math.max(1,Math.round(h*scale));this.canvas.width=cw;this.canvas.height=ch;this.ctx.drawImage(source,0,0,cw,ch);const im=this.ctx.getImageData(0,0,cw,ch),r=window.jsQR(im.data,cw,ch,{inversionAttempts:'attemptBoth'});return r&&r.data?[{rawValue:r.data,format:'qr_code'}]:[]}catch(_){return[]}}
}
window.BarcodeDetector=PolyfillBarcodeDetector;
const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';s.async=true;s.onload=()=>{window.__sortiesQrPolyfillReady=true;resolveReady();document.dispatchEvent(new Event('sorties-qr-polyfill-ready'))};s.onerror=()=>{window.__sortiesQrPolyfillFailed=true;resolveReady()};document.head.appendChild(s);
})();