(()=>{
'use strict';
if(window.__horticultureMessagingSupabaseV2)return;window.__horticultureMessagingSupabaseV2=true;
const URL='https://zzlpdwbmibcstoshqabo.supabase.co';
const KEY='sb_publishable_BgB5yp3ibAaTVmmgZqGfIQ_MzCBVLqa';
const SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1';
let client=null,ready=false;
function me(){try{return JSON.parse(localStorage.getItem(PERSIST)||sessionStorage.getItem(SESSION)||'null')}catch{return null}}
function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}))}
async function boot(){
  if(client)return true;
  if(!window.supabase?.createClient)return false;
  client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'},realtime:{params:{eventsPerSecond:20}}});
  window.HorticultureSupabaseClient=client;
  client.auth.onAuthStateChange((event,session)=>emit('horticulture-supabase-auth',{event,session,userId:me()?.id||null}));
  ready=true;emit('horticulture-supabase-ready',{project:URL,userId:me()?.id||null});return true;
}
function status(){return{ready,project:URL,userId:me()?.id||null}}
window.HorticultureSupabaseMessaging={boot,status,get client(){return client}};
[0,120,350,900,1800].forEach(ms=>setTimeout(boot,ms));
})();