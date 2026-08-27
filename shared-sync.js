(()=>{
const USERS_KEY='horticulture-admin-users-v2';
const API_KEY='horticulture-admin-shared-api-url';
const api=localStorage.getItem(API_KEY)||window.HORTICULTURE_SHARED_API_URL||'';
if(!api)return;
let syncing=false;
const nativeSet=Storage.prototype.setItem;
async function pushUsers(raw){
  if(syncing)return;
  try{await fetch(api,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'saveUsers',users:JSON.parse(raw||'[]')})})}catch(e){console.warn('Shared users push failed',e)}
}
Storage.prototype.setItem=function(k,v){nativeSet.call(this,k,v);if(this===localStorage&&k===USERS_KEY)pushUsers(v)};
async function pull(){
  try{
    const r=await fetch(api+'?action=listUsers&t='+Date.now(),{cache:'no-store'});
    const j=await r.json();
    if(!j.ok||!Array.isArray(j.users))return;
    const remote=JSON.stringify(j.users);
    const local=localStorage.getItem(USERS_KEY)||'[]';
    if(remote!==local){
      syncing=true;nativeSet.call(localStorage,USERS_KEY,remote);syncing=false;
      if(sessionStorage.getItem('horticulture-shared-users-loaded')!=='1'){
        sessionStorage.setItem('horticulture-shared-users-loaded','1');
        location.reload();
      }
    }
  }catch(e){console.warn('Shared users pull failed',e)}
}
pull();
setInterval(pull,15000);
window.addEventListener('focus',pull);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pull()});
window.HorticultureSharedUsers={api,pull,setApi(url){localStorage.setItem(API_KEY,url);location.reload()},clearApi(){localStorage.removeItem(API_KEY);location.reload()}};
})();