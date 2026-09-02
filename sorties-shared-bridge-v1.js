(()=>{
'use strict';
if(window.__horticultureSortiesSharedBridgeV2)return;
window.__horticultureSortiesSharedBridgeV2=true;
const API='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const STORE='horticulture-sorties-safe-v2',CACHE='horticulture-sorties-attendance-cache';
let remoteSnapshot=[];
let applyingRemote=false;
let flushTimer=null;
let refreshing=false;
let attendanceSending=new Map();
const originalSetItem=Storage.prototype.setItem;
const originalRemoveItem=Storage.prototype.removeItem;
const post=async(action,payload={})=>{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload})});const j=await r.json();if(!r.ok)throw new Error(j?.error||('HTTP '+r.status));return j};
const get=async(action,params={})=>{const u=new URL(API);u.searchParams.set('action',action);Object.entries(params).forEach(([k,v])=>v!=null&&u.searchParams.set(k,String(v)));const r=await fetch(u,{cache:'no-store'});const j=await r.json();if(!r.ok)throw new Error(j?.error||('HTTP '+r.status));return j};
function ids(rows,key='id'){return new Set((rows||[]).map(x=>String(x[key]||'')))}
function validStatus(s){return ['pending','present','late','absent'].includes(String(s||''))}
function statusOf(p){if(validStatus(p?.attendanceStatus))return p.attendanceStatus;return p?.present===true?'present':'pending'}
function writeCache(rows){let c={};try{c=JSON.parse(localStorage.getItem(CACHE)||'{}')||{}}catch(_){}for(const s of rows||[]){const sid=String(s.id);c[sid]=c[sid]&&typeof c[sid]==='object'?c[sid]:{};(s.participants||[]).forEach(p=>{if(p?.id!=null&&validStatus(p.attendanceStatus))c[sid][p.id]=p.attendanceStatus})}try{originalSetItem.call(localStorage,CACHE,JSON.stringify(c))}catch(_){}}
async function enrichAttendance(j){if(!j?.ok||!Array.isArray(j.sorties))return j;await Promise.all(j.sorties.map(async s=>{try{const a=await get('listSortieAttendance',{sortieId:s.id});const m=new Map((a?.attendance||[]).map(x=>[String(x.participantId),String(x.status||'pending')]));(s.participants||[]).forEach(p=>{const st=m.get(String(p.id));if(validStatus(st)){p.attendanceStatus=st;p.present=st==='present'||st==='late';if(!p.present)p.presentAt=''}else if(!validStatus(p.attendanceStatus))p.attendanceStatus=p.present?'present':'pending'})}catch(_){(s.participants||[]).forEach(p=>{if(!validStatus(p.attendanceStatus))p.attendanceStatus=p.present?'present':'pending'})}}));return j}
function applyRemote(j){if(!j||!j.ok||!Array.isArray(j.sorties))return false;remoteSnapshot=j.sorties;writeCache(j.sorties);applyingRemote=true;originalSetItem.call(localStorage,STORE,JSON.stringify(j.sorties));applyingRemote=false;window.HorticultureSortiesSharedInfo={connected:true,lastHelloAssoSync:j.lastHelloAssoSync||''};window.dispatchEvent(new CustomEvent('horticulture-sorties-shared-updated',{detail:j}));document.dispatchEvent(new CustomEvent('horticulture-sorties-attendance-changed'));return true}
async function refresh(){if(refreshing)return null;refreshing=true;try{let j=await get('listSortiesAdmin');j=await enrichAttendance(j);if(applyRemote(j))return j;return j}catch(e){window.HorticultureSortiesSharedInfo={connected:false,lastHelloAssoSync:''};return null}finally{refreshing=false}}
async function setAttendance(sortieId,participantId,status){status=validStatus(status)?status:'pending';const key=String(sortieId)+'::'+String(participantId),seq=(attendanceSending.get(key)||0)+1;attendanceSending.set(key,seq);try{const j=await post('setSortieAttendance',{sortieId,participantId,status});if(attendanceSending.get(key)!==seq)return j;if(!j?.ok)throw new Error(j?.error||'Synchronisation du statut impossible');return j}finally{if(attendanceSending.get(key)===seq)attendanceSending.delete(key)}}
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
      for(const p of localPeople){
        const pj=await post('saveSortieParticipant',{participant:{...p,sortieId:s.id}});
        if(!pj||!pj.ok)throw new Error(pj&&pj.error||'saveSortieParticipant indisponible');
        const st=statusOf(p);
        try{await setAttendance(s.id,p.id,st)}catch(e){console.warn('[Sorties] Statut non synchronisé :',e&&e.message||e)}
      }
      for(const rp of remotePeople.values())if(!localPeopleIds.has(String(rp.id)))await post('deleteSortieParticipant',{id:rp.id});
    }
    for(const rs of remoteSnapshot||[])if(!localIds.has(String(rs.id)))await post('deleteSortieAdmin',{id:rs.id});
    await refresh();
  }catch(e){console.warn('[Sorties] Sauvegarde commune non disponible :',e&&e.message||e)}
}
function queueFromString(value){if(applyingRemote)return;clearTimeout(flushTimer);flushTimer=setTimeout(()=>{try{flush(JSON.parse(value||'[]'))}catch(_){}},500)}
Storage.prototype.setItem=function(key,value){const out=originalSetItem.apply(this,arguments);if(this===localStorage&&key===STORE)queueFromString(value);return out};
Storage.prototype.removeItem=function(key){const out=originalRemoveItem.apply(this,arguments);if(this===localStorage&&key===STORE)queueFromString('[]');return out};
document.addEventListener('horticulture-sorties-attendance-changed',e=>{const d=e?.detail;if(!d||d.sortieId==null||d.participantId==null||!validStatus(d.status))return;setAttendance(d.sortieId,d.participantId,d.status).catch(err=>console.warn('[Sorties] Synchronisation présence en attente :',err&&err.message||err))});
window.HorticultureSortiesSharedReady=(async()=>{const j=await refresh();if(j)return true;console.warn('[Sorties] Base commune non encore disponible');return false})();
window.HorticultureSortiesShared={refresh,setAttendance};
setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
window.addEventListener('focus',()=>refresh());
})();