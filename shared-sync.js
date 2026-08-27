(()=>{
const USERS_KEY='horticulture-admin-users-v2';
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
let syncing=false,ready=false,queue=Promise.resolve();
const nativeSet=Storage.prototype.setItem;
const nativeRemove=Storage.prototype.removeItem;
function request(body){return fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)}).then(async r=>{const j=await r.json().catch(()=>null);if(!r.ok||!j?.ok)throw new Error(j?.error||`HTTP ${r.status}`);return j})}
function remoteById(arr,id){return (arr||[]).find(u=>String(u.id)===String(id))}
async function listRemote(){const r=await fetch(API+'?action=listUsers&t='+Date.now(),{cache:'no-store'});const j=await r.json();if(!r.ok||!j?.ok||!Array.isArray(j.users))throw new Error(j?.error||'Lecture impossible');return j.users}
function writeLocal(users){syncing=true;nativeSet.call(localStorage,USERS_KEY,JSON.stringify(users));syncing=false;window.dispatchEvent(new CustomEvent('horticulture-users-synced',{detail:{users}}))}
async function pull(reload=false){try{const users=await listRemote();writeLocal(users);ready=true;if(reload&&sessionStorage.getItem('horticulture-shared-users-loaded')!=='1'){sessionStorage.setItem('horticulture-shared-users-loaded','1');location.reload()}return users}catch(e){console.warn('Shared users pull failed',e);return null}}
async function syncChange(oldUsers,newUsers){
  const oldMap=new Map((oldUsers||[]).map(u=>[String(u.id),u])),newMap=new Map((newUsers||[]).map(u=>[String(u.id),u]));
  for(const [id,u] of newMap){const old=oldMap.get(id);if(!old)await request({action:'createUser',user:u});else if(JSON.stringify(old)!==JSON.stringify(u))await request({action:'updateUser',user:u})}
  for(const [id] of oldMap)if(!newMap.has(id))await request({action:'deleteUser',id});
  await pull(false);
}
Storage.prototype.setItem=function(k,v){
  if(this!==localStorage||k!==USERS_KEY||syncing)return nativeSet.call(this,k,v);
  let oldUsers=[],newUsers=[];try{oldUsers=JSON.parse(localStorage.getItem(USERS_KEY)||'[]');newUsers=JSON.parse(v||'[]')}catch{return nativeSet.call(this,k,v)}
  nativeSet.call(this,k,v);
  if(!ready)return;
  queue=queue.then(()=>syncChange(oldUsers,newUsers)).catch(async e=>{console.warn('Shared users write failed',e);await pull(false)});
};
Storage.prototype.removeItem=function(k){if(this===localStorage&&k===USERS_KEY&&!syncing){const old=localStorage.getItem(k);nativeRemove.call(this,k);if(ready&&old){let a=[];try{a=JSON.parse(old)}catch{};queue=queue.then(async()=>{for(const u of a)await request({action:'deleteUser',id:u.id});await pull(false)}).catch(e=>console.warn(e))}return}return nativeRemove.call(this,k)};
/* Google Sheets is authoritative: load it before allowing local edits to propagate. */
pull(true);
setInterval(()=>pull(false),10000);
window.addEventListener('focus',()=>pull(false));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)pull(false)});
window.HorticultureSharedUsers={api:API,pull};
})();