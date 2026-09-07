(()=>{
'use strict';
if(window.__horticultureMessagingSupabaseV1)return;window.__horticultureMessagingSupabaseV1=true;
const URL='https://zzlpdwbmibcstoshqabo.supabase.co';
const KEY='sb_publishable_BgB5yp3ibAaTVmmgZqGfIQ_MzCBVLqa';
const SESSION='horticulture-admin-session-v1',PERSIST='horticulture-admin-persistent-session-v1';
let client=null,channel=null,ready=false;
function me(){try{return JSON.parse(localStorage.getItem(PERSIST)||sessionStorage.getItem(SESSION)||'null')}catch{return null}}
function emit(name,detail){window.dispatchEvent(new CustomEvent(name,{detail}))}
async function boot(){
  if(!window.supabase?.createClient)return false;
  if(client)return true;
  client=window.supabase.createClient(URL,KEY,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:20}}});
  window.HorticultureSupabaseClient=client;
  // Do not subscribe anonymously to private message rows. The publishable key is public;
  // message access will be enabled only after the app login can provide a Supabase JWT.
  ready=true;emit('horticulture-supabase-ready',{project:URL,userId:me()?.id||null});return true;
}
function subscribeWithAccessToken(token){
  if(!client||!token)return false;
  client.realtime.setAuth(token);
  if(channel)client.removeChannel(channel);
  channel=client.channel('horticulture-messages',{config:{private:true}})
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'horticulture_messages'},p=>emit('horticulture-realtime-message',{message:p.new}))
    .on('postgres_changes',{event:'UPDATE',schema:'public',table:'horticulture_messages'},p=>emit('horticulture-realtime-message-update',{message:p.new}))
    .subscribe(status=>emit('horticulture-realtime-status',{status}));
  return true;
}
function status(){return{ready,connected:!!channel,project:URL,userId:me()?.id||null}}
window.HorticultureSupabaseMessaging={boot,subscribeWithAccessToken,status,get client(){return client}};
boot();
})();