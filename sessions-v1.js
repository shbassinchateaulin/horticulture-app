(()=>{
const API=window.HorticultureSharedUsers?.api||'https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SK='horticulture-admin-session-v1',PK='horticulture-admin-persistent-session-v1',GK='horticulture-session-generation-v1',FK='horticulture-fresh-login-v1';
let busy=false,stopped=false;
function session(){try{return JSON.parse(localStorage.getItem(PK)||sessionStorage.getItem(SK)||'null')}catch{return null}}
function generation(){const persistent=!!localStorage.getItem(PK);return persistent?(localStorage.getItem(GK)||''):(sessionStorage.getItem(GK)||'')}
function saveGeneration(v){if(!v)return;const persistent=!!localStorage.getItem(PK);if(persistent){localStorage.setItem(GK,v);sessionStorage.removeItem(GK)}else{sessionStorage.setItem(GK,v);localStorage.removeItem(GK)}}
function clearGeneration(){localStorage.removeItem(GK);sessionStorage.removeItem(GK)}
function clearSession(){localStorage.removeItem(PK);sessionStorage.removeItem(SK);clearGeneration();sessionStorage.removeItem(FK)}
function forceLogout(msg){if(stopped)return;stopped=true;clearSession();try{localStorage.setItem('horticulture-session-message-v1',msg||'Votre session a été déconnectée depuis un autre appareil.')}catch{}location.reload()}
function isFreshLogin(){return sessionStorage.getItem(FK)==='1'}
function finishFreshLogin(){sessionStorage.removeItem(FK)}
async function state(){const s=session();if(!s?.id||busy||stopped)return null;busy=true;try{const r=await fetch(API+'?action=getSessionState&userId='+encodeURIComponent(s.id)+'&t='+Date.now(),{cache:'no-store'}),j=await r.json();if(!j?.ok)return null;const local=generation();if(!local||isFreshLogin()){saveGeneration(j.generation);finishFreshLogin();return j}if(String(local)!==String(j.generation)){forceLogout('Votre session a été déconnectée depuis un autre appareil.');return null}return j}catch(e){return null}finally{busy=false}}
async function disconnectOthers(){const s=session();if(!s?.id)throw new Error('Aucune session active.');if(!generation())await state();const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'disconnectOtherSessions',userId:s.id,currentGeneration:generation()})}),j=await r.json();if(!j?.ok){if(j?.sessionExpired)forceLogout('Cette session n’est plus valide.');throw new Error(j?.error||'Impossible de déconnecter les autres appareils.')}saveGeneration(j.generation);return j}
// Une saisie manuelle du mot de passe crée une nouvelle session légitime :
// on rebinde alors cette session sur la génération serveur courante.
document.addEventListener('submit',e=>{if(e.target?.id!=='loginForm')return;sessionStorage.setItem(FK,'1');clearGeneration();setTimeout(state,900)},true);
setTimeout(state,500);setInterval(state,60000);window.addEventListener('focus',state);document.addEventListener('visibilitychange',()=>{if(!document.hidden)state()});window.HorticultureSessions={check:state,disconnectOthers,logout:()=>{clearSession();location.reload()}};
})();