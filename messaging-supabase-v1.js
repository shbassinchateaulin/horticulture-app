(()=>{
'use strict';
if(window.__horticultureMessagingSupabaseV4)return;window.__horticultureMessagingSupabaseV4=true;
const URL='https://zzlpdwbmibcstoshqabo.supabase.co';
const KEY='sb_publishable_BgB5yp3ibAaTVmmgZqGfIQ_MzCBVLqa';
const SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1';
let client=null,ready=false;
function me(){try{return JSON.parse(localStorage.getItem(PERSIST)||sessionStorage.getItem(SESSION)||'null')}catch{return null}}
function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}))}
function loadDeviceSync(){if(document.getElementById('messagingDeviceSyncFixV1'))return;const s=document.createElement('script');s.id='messagingDeviceSyncFixV1';s.src='./messaging-device-sync-fix-v1.js?v=1';s.async=false;document.head.appendChild(s)}
async function boot(){loadDeviceSync();if(client)return true;if(!window.supabase?.createClient)return false;client=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}});window.HorticultureSupabaseClient=client;ready=true;emit('horticulture-supabase-ready',{project:URL,userId:me()?.id||null});return true}
function setRealtimeToken(token){if(!client||!token)return false;client.realtime.setAuth(token);return true}
function status(){return{ready,project:URL,userId:me()?.id||null}}
window.HorticultureSupabaseMessaging={boot,setRealtimeToken,status,url:URL,key:KEY,get client(){return client}};
loadDeviceSync();[0,120,350,900,1800].forEach(ms=>setTimeout(boot,ms));
})();
