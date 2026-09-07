(()=>{
'use strict';
if(window.__horticultureMessagingDeviceSyncFixV1)return;
window.__horticultureMessagingDeviceSyncFixV1=true;
let refreshing=false,lastRefresh=0;
function messagingVisible(){const v=document.getElementById('messaging');return !!v?.classList.contains('active')}
function listMode(){const layout=document.querySelector('#messaging .m6Layout');return !layout||!layout.classList.contains('chatOpen')}
async function refresh(force=false){
  if(refreshing||!messagingVisible()||!listMode())return false;
  const now=Date.now();if(!force&&now-lastRefresh<1200)return false;
  const transport=window.HorticultureSupabaseTransport;
  if(!transport?.isActive?.())return false;
  const open=window.HorticultureMessaging?.open;
  if(typeof open!=='function')return false;
  refreshing=true;lastRefresh=now;
  try{await open();return true}catch(e){console.warn('Messaging device sync',e);return false}finally{refreshing=false}
}
window.addEventListener('horticulture-supabase-authenticated',()=>setTimeout(()=>refresh(true),30));
window.addEventListener('horticulture-realtime-status',e=>{if(String(e.detail?.status||'').toUpperCase()==='SUBSCRIBED')setTimeout(()=>refresh(true),30)});
window.addEventListener('horticulture-supabase-conversation-updated',()=>setTimeout(()=>refresh(false),40));
window.addEventListener('pageshow',()=>setTimeout(()=>refresh(true),120));
window.addEventListener('focus',()=>setTimeout(()=>refresh(false),120));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)setTimeout(()=>refresh(false),120)});
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-module="messaging"],.dlist button');if(!b)return;const label=String(b.textContent||'').toLowerCase();if(b.dataset?.module==='messaging'||label.includes('messagerie'))setTimeout(()=>refresh(true),220)},true);
window.HorticultureMessagingDeviceSync={refresh};
})();