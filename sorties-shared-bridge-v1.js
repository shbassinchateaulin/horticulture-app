(()=>{
'use strict';
if(window.__horticultureSortiesSharedBridgeV1)return;
window.__horticultureSortiesSharedBridgeV1=true;
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const STORE='horticulture-sorties-safe-v2';
let remoteSnapshot=[];
let applyingRemote=false;
let flushTimer=null;
let refreshing=false;
const originalSetItem=Storage.prototype.setItem;
const originalRemoveItem=Storage.prototype.removeItem;
const post=async(action,payload={})=>{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});return r.json()};
const get=async(action)=>{const u=new URL(API);u.searchParams.set('action',action);const r=await fetch(u,{cache:'no-store'});return r.json()};
function ids(rows,key='id'){return new Set((rows||[]).map(x=>String(x[key]||'')))}
function applyRemote(j){if(!j||!j.ok||!Array.isArray(j.sorties))return false;remoteSnapshot=j.sorties;applyingRemote=true;originalSetItem.call(localStorage,STORE,JSON.stringify(j.sorties));applyingRemote=false;window.HorticultureSortiesSharedInfo={connected:true,lastHelloAssoSync:j.lastHelloAssoSync||''};window.dispatchEvent(new CustomEvent('horticulture-sorties-shared-updated',{detail:j}));return true}
async function refresh(){if(refreshing)return null;refreshing=true;try{const j=await get('listSortiesAdmin');if(applyRemote(j))return j;return j}catch(e){window.HorticultureSortiesSharedInfo={connected:false,lastHelloAssoSync:''};return null}finally{refreshing=false}}
async function flush(local){
  if(applyingRemote||!Array.isArray(local))return;
  try{
    const remoteById=new Map((remoteSnapshot||[]).map(s=>[String(s.id),s]));
    const localIds=ids(local);
    for(const s of local){
      const clean={...s,participants:undefined,history:undefined,localOnly:undefined};
      const rs=remoteById.get(String(s.id));
      const j=await post('saveSortieAdmin',{sortie:clean});
      if(!j||!j.ok)throw new Error(j&&j.error||'saveSortieAdmin indisponible');
      const remotePeople=new Map(((rs&&rs.participants)||[]).map(p=>[String(p.id),p]));
      const localPeople=s.participants||[];
      const localPeopleIds=ids(localPeople);
      for(const p of localPeople){const pj=await post('saveSortieParticipant',{participant:{...p,sortieId:s.id}});if(!pj||!pj.ok)throw new Error(pj&&pj.error||'saveSortieParticipant indisponible')}
      for(const rp of remotePeople.values())if(!localPeopleIds.has(String(rp.id)))await post('deleteSortieParticipant',{id:rp.id});
    }
    for(const rs of remoteSnapshot||[])if(!localIds.has(String(rs.id)))await post('deleteSortieAdmin',{id:rs.id});
    await refresh();
  }catch(e){console.warn('[Sorties] Sauvegarde commune non disponible :',e&&e.message||e)}
}
function queueFromString(value){if(applyingRemote)return;clearTimeout(flushTimer);flushTimer=setTimeout(()=>{try{flush(JSON.parse(value||'[]'))}catch(_){}},500)}
Storage.prototype.setItem=function(key,value){const out=originalSetItem.apply(this,arguments);if(this===localStorage&&key===STORE)queueFromString(value);return out};
Storage.prototype.removeItem=function(key){const out=originalRemoveItem.apply(this,arguments);if(this===localStorage&&key===STORE)queueFromString('[]');return out};
window.HorticultureSortiesSharedReady=(async()=>{const j=await refresh();if(j)return true;console.warn('[Sorties] Base commune non encore disponible');return false})();
window.HorticultureSortiesShared={refresh};
setInterval(()=>{if(document.visibilityState==='visible')refresh()},60000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
})();
