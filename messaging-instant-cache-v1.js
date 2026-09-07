(()=>{
'use strict';
if(window.__horticultureMessagingInstantCacheV1)return;
window.__horticultureMessagingInstantCacheV1=true;

const API_PART='/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const PREFIX='horticulture-msg-cache-v1:';
const MAX_MESSAGES=120;
const CACHE_TTL=1000*60*60*24*30;
const nativeFetch=window.fetch.bind(window);
let prefetchQueue=[];
let prefetchRunning=0;
const PREFETCH_CONCURRENCY=3;

function parseBody(options){
  try{return JSON.parse(options?.body||'{}')}catch{return null}
}
function isMessagingRequest(input,options){
  const url=typeof input==='string'?input:input?.url||'';
  if(!url.includes(API_PART))return null;
  return parseBody(options);
}
function key(userId,peerId){return PREFIX+String(userId)+':'+String(peerId)}
function read(userId,peerId){
  try{
    const raw=localStorage.getItem(key(userId,peerId));
    if(!raw)return null;
    const data=JSON.parse(raw);
    if(!data||!Array.isArray(data.messages))return null;
    if(Date.now()-Number(data.savedAt||0)>CACHE_TTL){localStorage.removeItem(key(userId,peerId));return null}
    return data;
  }catch{return null}
}
function write(userId,peerId,messages){
  if(!userId||!peerId||!Array.isArray(messages))return;
  try{
    const rows=messages.slice(-MAX_MESSAGES);
    localStorage.setItem(key(userId,peerId),JSON.stringify({savedAt:Date.now(),messages:rows}));
  }catch(e){
    try{
      Object.keys(localStorage).filter(k=>k.startsWith(PREFIX)).slice(0,10).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem(key(userId,peerId),JSON.stringify({savedAt:Date.now(),messages:messages.slice(-60)}));
    }catch(_){ }
  }
}
function responseFor(messages){
  return new Response(JSON.stringify({ok:true,messages:messages||[]}),{status:200,headers:{'Content-Type':'application/json'}})
}
async function networkMessages(userId,peerId){
  try{
    const r=await nativeFetch('https://script.google.com'+API_PART,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'listInternalMessages',userId,peerId})});
    const j=await r.clone().json();
    if(j?.ok&&Array.isArray(j.messages)){
      write(userId,peerId,j.messages);
      window.dispatchEvent(new CustomEvent('horticulture-messages-cache-updated',{detail:{userId,peerId,messages:j.messages}}));
    }
  }catch(_){ }
}
function pump(){
  while(prefetchRunning<PREFETCH_CONCURRENCY&&prefetchQueue.length){
    const job=prefetchQueue.shift();
    prefetchRunning++;
    networkMessages(job.userId,job.peerId).finally(()=>{prefetchRunning--;pump()});
  }
}
function queuePrefetch(userId,peers){
  const seen=new Set(prefetchQueue.map(x=>String(x.userId)+'|'+String(x.peerId)));
  for(const peerId of peers){
    if(!peerId||String(peerId)===String(userId))continue;
    const id=String(userId)+'|'+String(peerId);
    if(seen.has(id))continue;
    seen.add(id);
    prefetchQueue.push({userId:String(userId),peerId:String(peerId)});
  }
  pump();
}

window.fetch=async function(input,options={}){
  const body=isMessagingRequest(input,options);
  if(!body)return nativeFetch(input,options);

  if(body.action==='listInternalMessages'&&body.userId&&body.peerId){
    const cached=read(body.userId,body.peerId);
    if(cached){
      networkMessages(body.userId,body.peerId);
      return responseFor(cached.messages);
    }
    const r=await nativeFetch(input,options);
    try{
      const j=await r.clone().json();
      if(j?.ok&&Array.isArray(j.messages))write(body.userId,body.peerId,j.messages);
    }catch(_){ }
    return r;
  }

  const r=await nativeFetch(input,options);
  if(body.action==='listInternalConversations'&&body.userId){
    try{
      const j=await r.clone().json();
      const peers=(j?.conversations||[]).map(c=>c.otherUserId).filter(Boolean);
      if(peers.length)setTimeout(()=>queuePrefetch(body.userId,peers),0);
    }catch(_){ }
  }
  if(body.action==='sendInternalMessage'&&body.userId&&body.recipientId){
    try{localStorage.removeItem(key(body.userId,body.recipientId))}catch(_){ }
  }
  return r;
};

window.HorticultureMessagingInstantCache={
  read:(userId,peerId)=>read(userId,peerId),
  prefetch:queuePrefetch
};
})();