(()=>{
const API_PART='AKfycbx3w-MandZA_YuSt8L17hgaS7Ws7dkdlpiKHuVTM3T4gD-28v053rVSja0UAdH4kyAvMA';
const nativeFetch=window.fetch.bind(window);
const CACHE_MS=12000;
const TIMEOUT_MS=8000;
let lastText='',lastAt=0,inFlight=null;
function isListSuggestions(input){try{const u=new URL(typeof input==='string'?input:input.url,location.href);return u.href.includes(API_PART)&&u.searchParams.get('action')==='listSuggestions'}catch{return false}}
function jsonResponse(text){return new Response(text,{status:200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})}
async function load(input,init){
  if(lastText&&Date.now()-lastAt<CACHE_MS)return jsonResponse(lastText);
  if(inFlight)return jsonResponse(await inFlight);
  inFlight=(async()=>{
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),TIMEOUT_MS);
    try{
      const r=await nativeFetch(input,{...(init||{}),cache:'no-store',signal:controller.signal});
      const text=await r.text();
      let j=null;try{j=JSON.parse(text)}catch{}
      if(!j||typeof j!=='object'){
        if(lastText)return lastText;
        return JSON.stringify({ok:false,error:'API Suggestions temporairement indisponible. Réessayez dans quelques secondes.'});
      }
      lastText=text;lastAt=Date.now();return text;
    }catch(e){
      if(lastText)return lastText;
      return JSON.stringify({ok:false,error:e?.name==='AbortError'?'Le chargement des suggestions a expiré. Réessayez.':'Impossible de charger les suggestions.'});
    }finally{clearTimeout(timer)}
  })();
  try{return jsonResponse(await inFlight)}finally{inFlight=null}
}
window.fetch=function(input,init){return isListSuggestions(input)?load(input,init):nativeFetch(input,init)};
function throttleNotif(){const n=window.HorticultureNotificationCenter;if(!n||n.__suggestionsGuard)return false;const orig=n.refresh?.bind(n);if(!orig)return false;let last=0;n.refresh=(render=true)=>{const now=Date.now();if(now-last<12000)return Promise.resolve();last=now;return orig(render)};n.__suggestionsGuard=true;return true}
if(!throttleNotif()){let tries=0;const t=setInterval(()=>{tries++;if(throttleNotif()||tries>20)clearInterval(t)},250)}
})();