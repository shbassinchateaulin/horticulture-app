(()=>{
const USERS_KEY='horticulture-admin-users-v2';
const API_KEY='horticulture-admin-shared-api-url';
const DEFAULT_API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
/* Always use the deployed shared backend. An old URL saved on one device must not override it. */
const api=window.HORTICULTURE_SHARED_API_URL||DEFAULT_API;
if(localStorage.getItem(API_KEY)!==DEFAULT_API)localStorage.setItem(API_KEY,DEFAULT_API);
let syncing=false;
const nativeSet=Storage.prototype.setItem;
async function pushUsers(raw){
  if(syncing)return;
  try{
    const r=await fetch(api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'saveUsers',users:JSON.parse(raw||'[]')})});
    const j=await r.json().catch(()=>null);
    if(!r.ok||!j?.ok)throw new Error(j?.error||`HTTP ${r.status}`);
  }catch(e){console.warn('Shared users push failed',e)}
}
Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(this===localStorage&&k===USERS_KEY)pushUsers(v)};
async function pull(){
  try{
    const r=await fetch(api+'?action=listUsers&t='+Date.now(),{cache:'no-store'});
    const j=await r.json();
    if(!r.ok||!j.ok||!Array.isArray(j.users))return;
    const remote=JSON.stringify(j.users);
    const local=localStorage.getItem(USERS_KEY)||'[]';
    if(remote!==local){
      syncing=true;nativeSet.call(localStorage,USERS_KEY,remote);syncing=false;
      window.dispatchEvent(new CustomEvent('horticulture-users-synced',{detail:{users:j.users}}));
      if(sessionStorage.getItem('horticulture-shared-users-loaded')!=='1'){
        sessionStorage.setItem('horticulture-shared-users-loaded','1');
        location.reload();
      }
    }
  }catch(e){console.warn('Shared users pull failed',e)}
}
pull();
setInterval(pull,10000);
window.addEventListener('focus',pull);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pull()});
window.HorticultureSharedUsers={api,pull,setApi(){},clearApi(){}};
})();