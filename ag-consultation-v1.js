(()=>{
'use strict';
const STORE='horticulture-ag-pro-v2';
const DRAFT='horticulture-ag-pro-draft-v2';
const APP_VERSION=2;
const ROUTE_KEY='horticulture-ag-route-v3';
const AG_ACTIVE_KEY='horticulture-ag-active-v1';
let activeId='',draft=null,screen='home';
let routeRestored=false;
const AG_API=window.HorticultureSharedUsers?.api||'https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const AG_SESSION='horticulture-admin-session-v1';
const AG_PERSIST='horticulture-admin-persistent-session-v1';
const AG_GENERATION='horticulture-session-generation-v1';
const AG_PENDING_DELETE='horticulture-ag-pending-delete-v1';
const AG_SYNC_AT='horticulture-ag-last-sync-v1';
let agLastSyncAt=Number(localStorage.getItem(AG_SYNC_AT)||0)||0;
let agSharedReady=agLastSyncAt>0&&Date.now()-agLastSyncAt<60000,agSharedBusy=false,agSharedLastLoad=agSharedReady?agLastSyncAt:0,agSharedFailed=false,agPendingWrites=0,agDraftPushTimer=null;

function saveRoute(route){
  try{localStorage.setItem(ROUTE_KEY,JSON.stringify({...route,at:Date.now()}))}catch(_){}
}
function readRoute(){
  try{return JSON.parse(localStorage.getItem(ROUTE_KEY)||'null')}catch{return null}
}
function clearRoute(){
  try{localStorage.removeItem(ROUTE_KEY)}catch(_){}
}
function setAGActive_(on){
  try{on?sessionStorage.setItem(AG_ACTIVE_KEY,'1'):sessionStorage.removeItem(AG_ACTIVE_KEY)}catch(_){}
}
function isAGActive_(){
  try{return sessionStorage.getItem(AG_ACTIVE_KEY)==='1'}catch{return false}
}
function hasSession(){
  return !!(localStorage.getItem('horticulture-admin-persistent-session-v1')||sessionStorage.getItem('horticulture-admin-session-v1'));
}

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=(p='id')=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const now=()=>new Date().toISOString();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

function agSession_(){
  try{return JSON.parse(localStorage.getItem(AG_PERSIST)||sessionStorage.getItem(AG_SESSION)||'null')}catch{return null}
}
function agGeneration_(){
  return localStorage.getItem(AG_GENERATION)||sessionStorage.getItem(AG_GENERATION)||'';
}
function agAuth_(){
  const s=agSession_(),generation=agGeneration_();
  return s?.id&&generation?{userId:String(s.id),generation:String(generation)}:null;
}
function agSleep_(ms){return new Promise(r=>setTimeout(r,ms))}
async function agEnsureAuth_(){
  let auth=agAuth_();if(auth)return auth;
  const session=agSession_();

  // Le Super Admin intégré à l'application existait historiquement seulement
  // dans le navigateur. On l'enregistre une fois dans la base Administration
  // afin que le serveur puisse lui délivrer une génération de session AG.
  if(String(session?.id||'')==='superadmin'){
    try{
      const superUser={
        id:'superadmin',firstName:'Super',lastName:'Admin',email:'',
        function:'Super Admin',role:'Super Admin',username:'superadmin',
        passwordHash:'04445e6487736590d1ef50186b414e737e0164683cbbec64e00e73c000fd3bef',
        firstLogin:false,active:true,
        permissions:['communication','sorties','adherents','comptabilite','suggestions','consultation_ag','acces']
      };
      const r=await fetch(AG_API,{
        method:'POST',
        headers:{'Content-Type':'text/plain;charset=utf-8'},
        body:JSON.stringify({action:'createUser',user:superUser}),
        cache:'no-store'
      });
      await r.text().catch(()=>{});
    }catch(e){console.warn('Initialisation serveur Super Admin',e)}
  }

  try{await window.HorticultureSessions?.check?.()}catch(_){}
  auth=agAuth_();if(auth)return auth;
  for(const ms of [200,650,1400]){
    await agSleep_(ms);
    try{await window.HorticultureSessions?.check?.()}catch(_){}
    auth=agAuth_();if(auth)return auth;
  }
  return null;
}
async function agFetchJson_(url,options,maxAttempts=4){
  let last=null;
  const attempts=Math.max(1,Number(maxAttempts)||1);
  for(let i=0;i<attempts;i++){
    try{
      const r=await fetch(url,{...(options||{}),cache:'no-store'});
      const text=await r.text();
      let j=null;try{j=JSON.parse(text)}catch(_){}
      if(r.ok&&j)return j;
      last=new Error(j?.error||('HTTP '+r.status));
    }catch(e){last=e}
    if(i<attempts-1)await agSleep_([350,900,1800][Math.min(i,2)]);
  }
  throw last||new Error('Connexion à la base Consultation AG impossible');
}
function agMarkSynced_(){
  agSharedReady=true;agSharedFailed=false;agLastSyncAt=Date.now();agSharedLastLoad=agLastSyncAt;
  try{localStorage.setItem(AG_SYNC_AT,String(agLastSyncAt))}catch(_){}
}
function agSyncLabel_(){
  if(agPendingWrites>0)return 'Enregistrement sur la base partagée…';
  if(agSharedReady)return 'Données disponibles — mise à jour serveur en arrière-plan';
  if(agSharedFailed)return 'Données disponibles — nouvelle tentative serveur automatique';
  return 'Données disponibles — connexion serveur en arrière-plan';
}
function agUpdateSyncLabel_(){
  const el=$('[data-ag-sync-status]',root());
  if(el)el.innerHTML=agSvg('lock')+agSyncLabel_();
}
async function agPostShared_(action,payload={}){
  const auth=await agEnsureAuth_();if(!auth)return null;
  const j=await agFetchJson_(AG_API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,...payload,...auth})});
  if(!j?.ok)throw Error(j?.error||'Erreur base Consultation AG');
  return j;
}
function agPendingDeletes_(){
  try{return JSON.parse(localStorage.getItem(AG_PENDING_DELETE)||'[]').map(String)}catch{return[]}
}
function agSetPendingDeletes_(ids){
  localStorage.setItem(AG_PENDING_DELETE,JSON.stringify([...new Set((ids||[]).map(String).filter(Boolean))]));
}
async function agPushCampaign_(campaign){
  if(!campaign?.id)return false;
  agPendingWrites++;agUpdateSyncLabel_();
  try{
    const copy=JSON.parse(JSON.stringify(campaign));
    const j=await agPostShared_('saveAGCampaign',{campaign:copy});
    if(!j)return false;
    agMarkSynced_();return true;
  }catch(e){
    agSharedFailed=true;
    console.warn('Base Consultation AG — enregistrement',e);return false
  }finally{
    agPendingWrites=Math.max(0,agPendingWrites-1);agUpdateSyncLabel_();
  }
}
async function agDeleteShared_(campaignId){
  const id=String(campaignId||'');if(!id)return false;
  agPendingWrites++;agUpdateSyncLabel_();
  try{
    const j=await agPostShared_('deleteAGCampaign',{campaignId:id});
    if(!j)throw new Error('Session indisponible');
    agSetPendingDeletes_(agPendingDeletes_().filter(x=>x!==id));
    agMarkSynced_();return true;
  }catch(e){
    agSharedFailed=true;
    const pending=agPendingDeletes_();if(!pending.includes(id)){pending.push(id);agSetPendingDeletes_(pending)}
    console.warn('Base Consultation AG — suppression différée',e);return false
  }finally{
    agPendingWrites=Math.max(0,agPendingWrites-1);agUpdateSyncLabel_();
  }
}
async function agFlushPendingDeletes_(){
  const ids=agPendingDeletes_();if(!ids.length)return;
  for(const id of ids){
    try{
      const j=await agPostShared_('deleteAGCampaign',{campaignId:id});
      if(j)agSetPendingDeletes_(agPendingDeletes_().filter(x=>x!==id));
    }catch(e){console.warn('Base Consultation AG — suppression en attente',e);break}
  }
}
function agTime_(v){const n=Date.parse(String(v||''));return Number.isFinite(n)?n:0}
async function agRefreshShared_(force=false){
  if(agSharedBusy)return false;
  if(!force&&agSharedReady&&Date.now()-agSharedLastLoad<2500)return true;
  agSharedBusy=true;
  try{
    const auth=await agEnsureAuth_();if(!auth)return false;
    const u=new URL(AG_API);
    u.searchParams.set('action','listAGCampaigns');
    u.searchParams.set('userId',auth.userId);
    u.searchParams.set('generation',auth.generation);
    u.searchParams.set('t',Date.now());
    const j=await agFetchJson_(u.toString(),{cache:'no-store'},1);
    if(!j?.ok)throw Error(j?.error||'Erreur base Consultation AG');

    const remote=Array.isArray(j.campaigns)?j.campaigns:[],local=db().campaigns.slice();
    const serverDeleted=new Set((Array.isArray(j.deletedIds)?j.deletedIds:[]).map(String));
    const looseDraft=restoreDraft();
    if(looseDraft?.id&&serverDeleted.has(String(looseDraft.id)))clearDraft();
    else if(looseDraft?.id&&!local.some(x=>String(x?.id)===String(looseDraft.id)))local.unshift(looseDraft);
    const pendingDelete=new Set(agPendingDeletes_());
    const merged=new Map();

    remote.forEach(r=>{if(r?.id&&!pendingDelete.has(String(r.id))&&!serverDeleted.has(String(r.id)))merged.set(String(r.id),r)});
    local.forEach(l=>{
      if(!l?.id||pendingDelete.has(String(l.id))||serverDeleted.has(String(l.id)))return;
      const id=String(l.id),r=merged.get(id);
      if(!r||agTime_(l.updatedAt)>agTime_(r.updatedAt))merged.set(id,l);
    });

    const mergedList=[...merged.values()].sort((a,b)=>agTime_(b.updatedAt||b.createdAt)-agTime_(a.updatedAt||a.createdAt));
    saveDB({version:APP_VERSION,campaigns:mergedList});
    if(serverDeleted.size){
      agSetPendingDeletes_(agPendingDeletes_().filter(id=>!serverDeleted.has(String(id))));
    }

    const remoteMap=new Map(remote.filter(x=>x?.id).map(x=>[String(x.id),x]));
    const toPush=mergedList.filter(item=>{
      const r=remoteMap.get(String(item.id));
      return !r||agTime_(item.updatedAt)>agTime_(r.updatedAt);
    });

    agMarkSynced_();
    agUpdateSyncLabel_();

    // Les écritures locales partent en arrière-plan : elles ne bloquent plus l'ouverture de l'écran.
    if(toPush.length)Promise.allSettled(toPush.map(agPushCampaign_));
    if(agPendingDeletes_().length)setTimeout(()=>agFlushPendingDeletes_(),0);
    return true;
  }catch(e){
    agSharedFailed=true;
    console.warn('Base Consultation AG — lecture',e);
    return false
  }finally{agSharedBusy=false}
}
function agRefreshSharedSoon_(){
  const redraw=ok=>{
    if(ok&&screen==='home'&&document.body.classList.contains('agWorkspaceMode'))home(true);
    else agUpdateSyncLabel_();
  };
  if(agSharedReady&&Date.now()-agSharedLastLoad<15000){
    agUpdateSyncLabel_();
    setTimeout(()=>agRefreshShared_(true).then(redraw),900);
    return;
  }
  agRefreshShared_(true).then(ok=>{
    redraw(ok);
    if(ok)return;
    setTimeout(()=>agRefreshShared_(true).then(ok2=>{
      redraw(ok2);
      if(!ok2)setTimeout(()=>agRefreshShared_(true).then(redraw),1500);
    }),450);
  });
}
function agStateFingerprint_(){
  return JSON.stringify(db().campaigns.map(c=>[
    String(c?.id||''),String(c?.status||''),String(c?.updatedAt||''),
    String(c?.trashedAt||''),Array.isArray(c?.responses)?c.responses.length:0
  ]));
}
async function agRefreshVisible_(){
  if(document.hidden||!document.body.classList.contains('agWorkspaceMode'))return false;
  if(!['home','campaign','trash'].includes(screen))return false;
  const before=agStateFingerprint_();
  const ok=await agRefreshShared_(true);
  if(!ok)return false;
  const after=agStateFingerprint_();
  if(before===after)return true;
  if(screen==='home')home(true);
  else if(screen==='trash')trashView();
  else if(screen==='campaign'&&activeId){
    const route=readRoute();
    getCampaign(activeId)?campaign(activeId,route?.tab||'overview'):home(true);
  }
  return true;
}
function agWarmShared_(){
  if(document.hidden||document.body.classList.contains('agWorkspaceMode'))return;
  if(!agAuth_())return;
  agRefreshShared_(false).catch(()=>{});
}
function agLiveSyncLoop_(){
  setTimeout(async()=>{
    try{await agRefreshVisible_()}catch(e){console.warn('Actualisation Consultation AG',e)}
    agLiveSyncLoop_();
  },6000);
}


function cleanCampaigns_(items){
  return (Array.isArray(items)?items:[]).filter(c=>c&&typeof c==='object'&&String(c.id||'').trim());
}
function db(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORE)||'{"version":2,"campaigns":[]}');
    const items=Array.isArray(raw)?raw:(Array.isArray(raw?.campaigns)?raw.campaigns:[]);
    const cleaned=cleanCampaigns_(items);
    if(cleaned.length!==items.length)localStorage.setItem(STORE,JSON.stringify({version:APP_VERSION,campaigns:cleaned}));
    return {version:APP_VERSION,campaigns:cleaned};
  }catch{return {version:APP_VERSION,campaigns:[]}}
}
function saveDB(data){localStorage.setItem(STORE,JSON.stringify({version:APP_VERSION,campaigns:cleanCampaigns_(data?.campaigns)}))}
function campaigns(){return db().campaigns.filter(c=>!c.trashedAt)}
function trashCampaigns(){return db().campaigns.filter(c=>!!c.trashedAt)}
function saveCampaign(c,push=true){
  const d=db(),i=d.campaigns.findIndex(x=>x.id===c.id);
  c.updatedAt=now();
  if(i<0)d.campaigns.unshift(c);else d.campaigns[i]=c;
  saveDB(d);
  if(push)agPushCampaign_(c);
  return c;
}
async function saveCampaignConfirmed_(c){
  saveCampaign(c,false);
  try{
    const auth=await agEnsureAuth_();
    if(!auth)throw new Error("Session serveur indisponible. Reconnecte-toi à l'application.");
    const copy=JSON.parse(JSON.stringify(c||{}));
    const j=await agPostShared_('saveAGCampaign',{campaign:copy});
    if(!j?.ok)throw new Error(j?.error||"Enregistrement Google Sheets refusé.");
    agSharedReady=true;
    return c;
  }catch(err){
    throw new Error(err?.message||String(err)||"Enregistrement Google Sheets impossible.");
  }
}
function getCampaign(id){return campaigns().find(x=>x.id===id)||null}
function getAnyCampaign(id){return db().campaigns.find(x=>x.id===id)||null}
function removeCampaign(id){
  id=String(id||'');
  const d=db();d.campaigns=d.campaigns.filter(x=>String(x.id)!==id);saveDB(d);
  const loose=restoreDraft();if(loose&&String(loose.id)===id)clearDraft();
  const pending=agPendingDeletes_();if(!pending.includes(id)){pending.push(id);agSetPendingDeletes_(pending)}
  agDeleteShared_(id);
}
function continueDraft_(id){
  const c=getAnyCampaign(id);if(!c)return home();
  draft=JSON.parse(JSON.stringify(c));
  draft.status='draft';
  localStorage.setItem(DRAFT,JSON.stringify(draft));
  builder();
}
function moveToTrash(id){const c=getAnyCampaign(id);if(!c||c.status!=='closed')return false;c.trashedAt=now();audit(c,'Mis à la corbeille');saveCampaign(c);return true}
function restoreFromTrash(id){const c=getAnyCampaign(id);if(!c)return false;delete c.trashedAt;audit(c,'Restauré depuis la corbeille');saveCampaign(c);return true}
function identityMode(c){return c?.settings?.identityMode||((c?.settings?.anonymous===true)?'anonymous':'optional')}
function audit(c,action,detail=''){c.audit=c.audit||[];c.audit.unshift({id:uid('log'),at:now(),action,detail});c.audit=c.audit.slice(0,80)}
function saveDraft(){
  if(!draft)return;
  draft.status='draft';
  draft.updatedAt=now();
  localStorage.setItem(DRAFT,JSON.stringify(draft));
  saveCampaign(draft,false);
  clearTimeout(agDraftPushTimer);
  agDraftPushTimer=setTimeout(()=>{
    const d=restoreDraft();
    if(d?.id)agPushCampaign_(d);
  },700);
}
function clearDraft(){
  clearTimeout(agDraftPushTimer);
  agDraftPushTimer=null;
  localStorage.removeItem(DRAFT);
}
function restoreDraft(){try{return JSON.parse(localStorage.getItem(DRAFT)||'null')}catch{return null}}

function main(){return $('main.app')||$('.app')}
function root(){
  let s=$('#agConsultation');
  if(!s){s=document.createElement('section');s.id='agConsultation';s.className='view';main()?.appendChild(s)}
  return s;
}
function showRoot(){
  setAGActive_(true);
  document.body.classList.add('agWorkspaceMode');
  $$('.view').forEach(v=>v.classList.remove('active'));
  root().classList.add('active');
  window.scrollTo(0,0);
}
function backHome(){
  clearRoute();
  setAGActive_(false);
  document.body.classList.remove('agWorkspaceMode');
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#home')?.classList.add('active');
  window.scrollTo(0,0);
}

function style(){
  if($('#agProStyle'))return;
  const s=document.createElement('style');s.id='agProStyle';
  s.textContent=
  '#agConsultation{padding-bottom:48px;color:#173126}'+
  '.agTop{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.agTop h1{margin:0;font-size:30px;color:#173126}.agTop p{margin:6px 0 0;color:#6e7f76;font-size:13px;line-height:1.5}'+
  '.agBtn,.agPrimary,.agDanger{border-radius:11px;padding:10px 14px;font-weight:800;cursor:pointer;font-size:13px}.agBtn{border:1px solid #dce5df;background:#fff;color:#29483d}.agPrimary{border:0;background:#07583f;color:#fff}.agDanger{border:1px solid #f0cccc;background:#fff5f5;color:#b42318}'+
  '.agToolbar{display:flex;gap:8px;flex-wrap:wrap}.agPanel{background:#fff;border:1px solid #e0e7e3;border-radius:18px;padding:18px;box-shadow:0 5px 18px #063d2f08;margin-bottom:14px}.agPanel h2,.agPanel h3{margin:0 0 12px}'+
  '.agKpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.agKpi{background:#fff;border:1px solid #e0e7e3;border-radius:15px;padding:15px}.agKpi b{font-size:26px;color:#07583f;display:block}.agKpi span{font-size:11px;color:#718078}'+
  '.agGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.agCard{background:#fff;border:1px solid #e0e7e3;border-radius:16px;padding:16px;box-shadow:0 5px 18px #063d2f08}.agCard h3{margin:8px 0 5px}.agMeta{font-size:11px;color:#74837b;line-height:1.45}.agStatus{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:850}.agStatus.draft{background:#f0f2f1;color:#5f6b65}.agStatus.open{background:#e7f7ec;color:#0f6b3f}.agStatus.closed{background:#fff0e8;color:#9c4d1a}'+
  '.agSourceGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.agSource{border:1px solid #dce5df;background:#fff;border-radius:16px;padding:18px;text-align:left;cursor:pointer;min-height:135px}.agSource:hover{border-color:#9fc3af;box-shadow:0 8px 22px #063d2f0e}.agSource strong{display:block;font-size:15px}.agSource small{display:block;margin-top:7px;color:#718078;line-height:1.45}'+
  '.agField{margin-top:12px}.agField label{display:block;font-size:11px;font-weight:850;margin-bottom:6px;color:#41564c}.agField input,.agField textarea,.agField select{width:100%;box-sizing:border-box;border:1px solid #d7e2db;border-radius:10px;padding:10px;background:#fff;color:#173126}.agField textarea{min-height:90px;resize:vertical}.agTwo{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
  '.agSection{border:1px solid #dfe7e2;border-radius:16px;margin-top:14px;overflow:hidden}.agSectionHead{display:flex;align-items:center;gap:8px;background:#f6faf7;padding:12px}.agSectionHead input{flex:1;border:1px solid #d7e2db;border-radius:9px;padding:9px;font-weight:800}.agQuestion{padding:13px;border-top:1px solid #edf0ee}.agQuestionTop{display:grid;grid-template-columns:1fr 165px auto;gap:8px;align-items:center}.agQuestionTop input,.agQuestionTop select{width:100%;border:1px solid #d7e2db;border-radius:9px;padding:9px}.agQActions{display:flex;gap:5px}.agIconBtn{border:1px solid #dce5df;background:#fff;border-radius:8px;width:34px;height:34px;cursor:pointer}.agRemove{color:#b42318;background:#fff5f5;border-color:#f0cccc}.agRequired{display:flex;gap:7px;align-items:center;font-size:11px;color:#607168;margin-top:8px}'+
  '.agPreview{border:1px solid #dfe7e2;border-radius:14px;background:#fbfdfb;padding:16px}.agPreviewQ{padding:12px 0;border-top:1px solid #e6ece8}.agPreviewQ:first-child{border-top:0}.agPreviewQ b{display:block;margin-bottom:8px}.agPreviewQ input,.agPreviewQ textarea,.agPreviewQ select{width:100%;box-sizing:border-box;border:1px solid #d7e2db;border-radius:9px;padding:9px}.agPreviewQ textarea{min-height:75px}'+
  '.agTabs{display:flex;gap:7px;overflow:auto;margin-bottom:14px}.agTab{border:1px solid #dce5df;background:#fff;border-radius:999px;padding:8px 12px;white-space:nowrap;font-size:11px;font-weight:800;cursor:pointer}.agTab.active{background:#07583f;color:#fff;border-color:#07583f}'+
  '.agTable{width:100%;border-collapse:collapse;font-size:12px}.agTable th,.agTable td{padding:10px;border-bottom:1px solid #edf0ee;text-align:left;vertical-align:top}.agTable th{color:#5f7168;font-size:10px;text-transform:uppercase;letter-spacing:.03em}.agEmpty{padding:34px;text-align:center;border:1px dashed #ccd8d1;border-radius:14px;color:#718078}'+
  '.agCollector{max-width:760px;margin:auto}.agAnswer{padding:14px 0;border-top:1px solid #edf0ee}.agAnswer:first-child{border-top:0}.agAnswer b{display:block;margin-bottom:8px;font-size:13px}.agAnswer input,.agAnswer textarea,.agAnswer select{width:100%;box-sizing:border-box;border:1px solid #d7e2db;border-radius:10px;padding:10px}.agAnswer textarea{min-height:88px}.agChoiceList{display:grid;gap:6px}.agChoice{display:flex!important;align-items:center;gap:8px;font-weight:500!important}.agChoice input{width:auto!important}'+
  '.agResult{padding:15px 0;border-top:1px solid #edf0ee}.agResult:first-child{border-top:0}.agResult h4{margin:0 0 6px}.agResult small{color:#73827a}.agBarRow{display:grid;grid-template-columns:minmax(100px,1fr) 70px;gap:10px;align-items:center;margin-top:8px}.agBar{height:9px;background:#edf3ef;border-radius:99px;overflow:hidden}.agBar span{height:100%;display:block;background:#0b7b57}.agPercent{text-align:right;font-size:11px;font-weight:800}.agKeywords{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.agKeyword{background:#edf7f0;color:#07583f;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800}.agQuote{background:#f8fbf9;border:1px solid #e5ece8;border-radius:10px;padding:10px;margin-top:7px;font-size:12px;line-height:1.45}'+
  '.agDrop{border:2px dashed #cbd8d1;border-radius:16px;padding:28px;text-align:center;background:#fbfdfb}.agDrop input{margin-top:12px}.agProgress{margin-top:10px;font-size:12px;color:#607168}.agPhoto{max-width:100%;max-height:300px;border-radius:12px;margin-top:12px;border:1px solid #dde6e0}'+
  '.agBanner{background:linear-gradient(135deg,#073f31,#0d6b4b);color:#fff;border-radius:18px;padding:18px;margin-bottom:14px;display:flex;justify-content:space-between;gap:18px;align-items:center}.agBanner h2{margin:0}.agBanner p{margin:5px 0 0;color:#dcebe4;font-size:12px}.agBanner .agStatus{background:#ffffff18;color:#fff}'+
  '.agNotice{background:#f0f7f3;border:1px solid #dbe9e1;border-radius:12px;padding:11px;font-size:12px;color:#496057}.agWarn{background:#fff7e9;border-color:#f2dfb6;color:#77511d}'+
  '.agAudit{max-height:260px;overflow:auto}.agAuditItem{padding:9px 0;border-top:1px solid #edf0ee;font-size:11px}.agAuditItem:first-child{border-top:0}.agAuditItem b{display:block}.agAuditItem span{color:#77857e}'+
  '@media(max-width:1050px){.agKpis{grid-template-columns:repeat(2,1fr)}.agGrid{grid-template-columns:repeat(2,1fr)}.agSourceGrid{grid-template-columns:repeat(2,1fr)}}'+
  '@media(max-width:700px){.agTop{display:block}.agTop .agToolbar{margin-top:10px}.agKpis,.agGrid,.agSourceGrid,.agTwo{grid-template-columns:1fr}.agQuestionTop{grid-template-columns:1fr}.agQActions{justify-content:flex-end}.agBanner{display:block}.agBanner .agToolbar{margin-top:10px}.agTable{display:block;overflow:auto}}'+
  '@media print{body>*:not(.appShell){display:none!important}.top,.bottom,.drawer,.agToolbar,.agTabs,.back{display:none!important}.appShell{display:block!important}.app{max-width:none!important;padding:0!important}#agConsultation{display:block!important}.agPanel,.agCard{box-shadow:none!important;break-inside:avoid}}';
  document.head.appendChild(s);
}

function visualStyle(){
  if($('#agVisualExactV9'))return;
  const s=document.createElement('style');s.id='agVisualExactV9';
  s.textContent=
  'body.agWorkspaceMode{background:#f7f9f7}'+
  'body.agWorkspaceMode .top{display:flex!important}'+
  'body.agWorkspaceMode .app{max-width:1550px!important;width:auto!important;margin:auto!important;padding:30px 24px 100px!important}'+
  'body.agWorkspaceMode #agConsultation{position:relative!important;inset:auto!important;z-index:auto!important;display:block!important;max-width:none!important;margin:0!important;padding:0!important;background:transparent!important;overflow:visible!important;color:#17251f}'+
  '.agHomeShell{display:block;background:transparent}.agSide{display:none!important}.agMain{padding:0;min-width:0}'+
  '.agMainHead{display:flex;justify-content:space-between;gap:20px;align-items:flex-start;margin-bottom:28px}.agMainHead h1{font-size:36px;line-height:1.05;margin:0 0 10px;letter-spacing:-.035em;color:#111d18}.agMainHead p{margin:0;color:#68766f;font-size:14px}.agMainActions{display:flex;gap:10px;align-items:center}.agTopAction{height:48px;min-height:48px;max-height:48px;box-sizing:border-box;border-radius:10px;border:1px solid #dbe2de;background:#fff;padding:0 16px;font-weight:700;font-size:12px;line-height:1;display:inline-flex;align-items:center;justify-content:center;gap:9px;vertical-align:middle;box-shadow:0 3px 10px #1731260b}.agTopAction.primary{background:linear-gradient(135deg,#087047,#07583f);color:#fff;border-color:#07583f;min-width:190px;justify-content:center}.agTopAction svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}.agTrashCount{min-width:20px;height:20px;border-radius:99px;background:#c52323;color:#fff;display:grid;place-items:center;font-size:10px;font-weight:800}'+
  '.agStatGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:28px}.agStatCard{height:132px;background:#fff;border:1px solid #e2e8e4;border-radius:15px;box-shadow:0 8px 22px #17312609;display:flex;align-items:center;padding:18px 20px;gap:16px}.agStatIcon{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;flex:0 0 auto}.agStatIcon svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.agStatIcon.green{background:#e5f3e8;color:#0b7a45}.agStatIcon.blue{background:#e4effd;color:#1769c2}.agStatIcon.orange{background:#fff0dc;color:#f08a13}.agStatIcon.purple{background:#eee6fb;color:#7146c7}.agStatText span{display:block;font-size:12px;color:#394940}.agStatText b{display:block;font-size:28px;line-height:1.05;margin:5px 0 4px;color:#111c17}.agStatText small{display:block;color:#6f7d76;font-size:11px}'+
  '.agPageBack{border:0;background:transparent;color:#07583f;font-weight:800;font-size:12px;padding:2px 0 14px;display:inline-flex;align-items:center;gap:6px}.agPageBack:hover{text-decoration:underline}.agRowActions,.agRowMenuWrap{overflow:visible!important}.agRowMenuWrap{position:relative;display:inline-flex}.agRowMenu{position:absolute;right:0;top:42px;z-index:30;min-width:190px;background:#fff;border:1px solid #dfe6e2;border-radius:11px;padding:6px;box-shadow:0 12px 30px #17312622}.agRowMenu[hidden]{display:none!important}.agRowMenu button{width:100%;height:38px;border:0;background:transparent;border-radius:8px;text-align:left;padding:0 11px;font-size:12px;font-weight:700;color:#26382f}.agRowMenu button:hover{background:#f3f7f4}.agRowMenu button.danger{color:#b42318}.agControls{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:17px}.agTabsHome{display:flex;background:#fff;border:1px solid #dfe6e2;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px #17312607}.agTabsHome button{height:46px;min-width:106px;border:0;background:#fff;color:#24362d;font-size:12px;font-weight:600;position:relative}.agTabsHome button.active{color:#07583f}.agTabsHome button.active:after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;background:#0a704a}.agSearchArea{display:flex;gap:10px}.agSearchBox{width:250px;height:46px;border:1px solid #dfe6e2;border-radius:10px;background:#fff;display:flex;align-items:center;gap:10px;padding:0 13px}.agSearchBox svg{width:18px;height:18px;fill:none;stroke:#53675e;stroke-width:1.8}.agSearchBox input{border:0;outline:0;width:100%;font-size:12px;background:transparent}.agFilterBtn{height:46px;min-width:125px;border:1px solid #dfe6e2;border-radius:10px;background:#fff;display:flex;align-items:center;justify-content:center;gap:9px;font-size:12px;font-weight:600}.agFilterBtn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8}'+
  '.agList{display:grid;gap:9px}.agListRow{min-height:94px;background:#fff;border:1px solid #e3e8e5;border-radius:12px;box-shadow:0 5px 16px #17312607;display:grid;grid-template-columns:minmax(330px,1.7fr) 150px 130px auto;align-items:center;gap:18px;padding:14px 16px}.agRowTitle{display:flex;align-items:center;gap:14px;min-width:0}.agDocIcon{width:45px;height:45px;border-radius:50%;background:#e6f3e9;color:#0a7145;display:grid;place-items:center;flex:0 0 auto}.agDocIcon svg{width:23px;height:23px;fill:none;stroke:currentColor;stroke-width:1.8}.agRowTitleText{min-width:0}.agRowTitleText b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.agRowTitleText small{display:block;color:#697870;font-size:11px;margin-top:5px}.agStatusPill{justify-self:start;border-radius:99px;padding:6px 11px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:5px}.agStatusPill:before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}.agStatusPill.open{background:#e6f5e9;color:#116c40}.agStatusPill.closed{background:#fff0df;color:#c66312}.agStatusPill.draft{background:#eceeed;color:#303a35}.agResponseCell{font-size:12px;color:#26372f;line-height:1.5}.agResponseCell b{display:block;font-size:12px}.agRowActions{display:flex;gap:8px;justify-content:flex-end}.agRowBtn{height:40px;border:1px solid #d7dfda;border-radius:9px;background:#fff;padding:0 14px;font-size:11px;font-weight:700;color:#27372f}.agRowBtn:hover{background:#f8faf8}.agRowBtn.trash{width:42px;padding:0;color:#bc2b27;border-color:#e3a9a6}.agRowBtn.trash svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}.agRowBtn.more{width:42px;padding:0;font-size:18px}.agRowEmpty{background:#fff;border:1px dashed #ced8d2;border-radius:12px;padding:42px;text-align:center;color:#6d7b74}'+
  '.agLocalFoot{text-align:center;color:#717f77;font-size:10px;padding:23px 0 3px}.agLocalFoot svg{width:13px;height:13px;vertical-align:-2px;margin-right:5px;fill:none;stroke:currentColor;stroke-width:1.8}.agMobileBack{display:none}'+
  '@media(max-width:1180px){.agStatGrid{grid-template-columns:repeat(2,1fr)}.agListRow{grid-template-columns:minmax(270px,1fr) 120px 105px auto}}'+
  '@media(max-width:820px){body.agWorkspaceMode .app{padding:16px 12px 92px!important}.agMainHead{display:block;margin-bottom:20px}.agMainHead h1{font-size:29px}.agMainActions{margin-top:15px}.agMainActions>*{flex:1}.agTopAction.primary{min-width:0}.agStatGrid{gap:9px;margin-bottom:18px}.agStatCard{height:105px;padding:13px;gap:10px}.agStatIcon{width:40px;height:40px}.agStatText b{font-size:23px}.agControls{display:block}.agTabsHome{overflow:auto;margin-bottom:10px}.agTabsHome button{min-width:94px}.agSearchArea{display:grid;grid-template-columns:1fr 105px}.agSearchBox{width:auto}.agFilterBtn{min-width:0}.agListRow{grid-template-columns:1fr;gap:10px;padding:14px;position:relative}.agStatusPill{position:absolute;right:14px;top:14px}.agRowTitle{padding-right:92px}.agResponseCell{padding-left:59px}.agRowActions{justify-content:flex-start;padding-left:59px}.agLocalFoot{padding-bottom:20px}}';
  document.head.appendChild(s);
}

function statusLabel(v){return v==='open'?'Ouvert':v==='closed'?'Clôturé':'Brouillon'}
function statusClass(v){return v==='open'?'open':v==='closed'?'closed':'draft'}
function allQuestions(c){
  const sections=Array.isArray(c?.sections)?c.sections:[];
  return sections.flatMap(s=>Array.isArray(s?.questions)?s.questions:[]);
}
function totalResponses(){return campaigns().reduce((n,c)=>n+(Array.isArray(c?.responses)?c.responses.length:0),0)}
function avgCompletion(c){
  const qs=allQuestions(c),responses=Array.isArray(c?.responses)?c.responses:[];
  if(!qs.length||!responses.length)return 0;
  const values=responses.map(r=>qs.filter(q=>{const v=r?.answers?.[q.id];return Array.isArray(v)?v.length>0:String(v??'').trim()!==''}).length/qs.length);
  return Math.round(values.reduce((a,b)=>a+b,0)/values.length*100);
}

function agSvg(name){
  const I={
    home:'<svg viewBox="0 0 24 24"><path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></svg>',
    users:'<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="4"/><circle cx="17" cy="9" r="3"/><path d="M2 21c0-4 3-7 7-7s7 3 7 7M15 15c4 0 7 2 7 6"/></svg>',
    cal:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M8 15l2 2 4-4"/></svg>',
    chat:'<svg viewBox="0 0 24 24"><path d="M4 4h16v12H9l-5 4z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/></svg>',
    form:'<svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
    doc:'<svg viewBox="0 0 24 24"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>',
    mail:'<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>',
    gear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2L17 19.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 1.8h-4A2 2 0 0 0 9 19a2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-1.8-1v-4A2 2 0 0 0 5 9a2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-1.8h4A2 2 0 0 0 15 5a2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 1.8 1v4A2 2 0 0 0 19 15z"/></svg>',
    logout:'<svg viewBox="0 0 24 24"><path d="M10 4H5v16h5M14 8l4 4-4 4M8 12h10"/></svg>',
    trash:'<svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6"/></svg>',
    plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    responses:'<svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-4 2-7 6-7s6 3 6 7M12 20c0-3 1.5-5.5 4-6.5 3.5.5 6 3 6 6.5"/></svg>',
    pie:'<svg viewBox="0 0 24 24"><path d="M12 3v9h9A9 9 0 1 1 12 3z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/></svg>',
    search:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    filter:'<svg viewBox="0 0 24 24"><path d="M4 5h16l-6 7v6l-4 2v-8z"/></svg>',
    lock:'<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>'
  };
  return I[name]||I.doc;
}
function agDateLabel(c){
  const d=new Date(c.updatedAt||c.createdAt||Date.now());
  const date=d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});
  const time=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
  if(c.status==='closed')return 'Clôturé le '+date;
  return 'Modifié le '+date+' à '+time;
}
function agRate(c){
  const target=Number(c?.settings?.targetCount||0),responses=Array.isArray(c?.responses)?c.responses:[];
  if(target>0)return Math.min(100,Math.round((responses.length/target)*100));
  return avgCompletion(c);
}
function agGoPermission(permission){
  backHome();
  setTimeout(()=>{
    const tile=document.querySelector('#home [data-permission="'+permission+'"]');
    if(tile)tile.click();
  },0);
}

function home(fromShared=false){
  saveRoute({screen:'home'});
  screen='home';style();visualStyle();
  const list=campaigns(),trash=trashCampaigns(),openCount=list.filter(c=>c.status==='open').length,resp=totalResponses();
  const rate=list.length?Math.round(list.reduce((n,c)=>n+agRate(c),0)/list.length):0;
  const displayName=(document.getElementById('dname')?.textContent||document.getElementById('admTopName')?.textContent||'Utilisateur').trim();
  const displayRole=(document.getElementById('drole')?.textContent||document.getElementById('role')?.textContent||'Compte').trim();
  const initials=displayName.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()||'U';

  root().innerHTML=
  '<div class="agHomeShell">'+
    '<main class="agMain">'+
      '<button class="agPageBack" data-ag-back>← Retour</button>'+
      '<header class="agMainHead"><div><h1>Consultation AG</h1><p>Créez, diffusez et suivez vos questionnaires d’assemblée générale</p></div>'+
        '<div class="agMainActions"><button class="agTopAction" data-trash-view>'+agSvg('trash')+'<span>Corbeille</span>'+(trash.length?'<span class="agTrashCount">'+trash.length+'</span>':'')+'</button><button class="agTopAction primary" data-new>'+agSvg('plus')+'<span>Nouveau questionnaire</span></button></div>'+
      '</header>'+
      '<section class="agStatGrid">'+
        '<div class="agStatCard"><div class="agStatIcon green">'+agSvg('form')+'</div><div class="agStatText"><span>Questionnaires</span><b>'+list.length+'</b><small>Total</small></div></div>'+
        '<div class="agStatCard"><div class="agStatIcon blue">'+agSvg('doc')+'</div><div class="agStatText"><span>Ouverts</span><b>'+openCount+'</b><small>En cours</small></div></div>'+
        '<div class="agStatCard"><div class="agStatIcon orange">'+agSvg('responses')+'</div><div class="agStatText"><span>Réponses</span><b>'+resp+'</b><small>Total</small></div></div>'+
        '<div class="agStatCard"><div class="agStatIcon purple">'+agSvg('pie')+'</div><div class="agStatText"><span>Taux de réponse</span><b>'+rate+'%</b><small>Moyenne</small></div></div>'+
      '</section>'+
      '<section class="agControls">'+
        '<div class="agTabsHome"><button class="active" data-filter="all">Tous</button><button data-filter="draft">Brouillons</button><button data-filter="open">Ouverts</button><button data-filter="closed">Clôturés</button></div>'+
        '<div class="agSearchArea"><label class="agSearchBox">'+agSvg('search')+'<input data-search placeholder="Rechercher..."></label><button class="agFilterBtn" data-sort>'+agSvg('filter')+'<span>Filtrer</span><span>⌄</span></button></div>'+
      '</section>'+
      '<section class="agList" data-list></section>'+
      '<div class="agLocalFoot" data-ag-sync-status>'+agSvg('lock')+agSyncLabel_()+'</div>'+
    '</main>'+
  '</div>'+
  '<input data-restore-file type="file" accept=".json,application/json" hidden>';

  showRoot();

  let currentFilter='all',query='',sortMode='updated';
  const listEl=$('[data-list]',root());
  function filtered(){
    let rows=list.slice();
    if(currentFilter!=='all')rows=rows.filter(c=>c.status===currentFilter);
    if(query){
      const needle=norm(query);
      rows=rows.filter(c=>{
        const hay=[
          c.title||'',
          c.year||'',
          statusLabel(c.status),
          ...(Array.isArray(c?.sections)?c.sections:[]).flatMap(s=>[s?.title||'',...(Array.isArray(s?.questions)?s.questions:[]).map(q=>q?.label||'')])
        ].join(' ');
        return norm(hay).includes(needle);
      });
    }
    rows.sort((a,b)=>{
      if(sortMode==='responses')return (b.responses||[]).length-(a.responses||[]).length;
      if(sortMode==='title')return String(a.title||'').localeCompare(String(b.title||''),'fr');
      return new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0);
    });
    return rows;
  }
  function renderRows(){
    const rows=filtered();
    listEl.innerHTML=rows.length?rows.map(c=>{
      const count=(c.responses||[]).length,r=agRate(c),qs=allQuestions(c).length;
      const primary=c.status==='draft'?'Continuer':'Ouvrir';
      return '<article class="agListRow" data-id="'+esc(c.id)+'">'+
        '<div class="agRowTitle"><div class="agDocIcon">'+agSvg('doc')+'</div><div class="agRowTitleText"><b>'+esc(c.title||'Questionnaire AG')+'</b><small>'+esc(agDateLabel(c))+' &nbsp; • &nbsp; '+qs+' question'+(qs>1?'s':'')+'</small></div></div>'+
        '<span class="agStatusPill '+statusClass(c.status)+'">'+statusLabel(c.status)+'</span>'+
        '<div class="agResponseCell"><b>'+count+' réponse'+(count>1?'s':'')+'</b><span>'+r+'%</span></div>'+
        '<div class="agRowActions">'+
          (c.status!=='closed'?'<button class="agRowBtn" data-open>'+primary+'</button>':'')+
          (c.status!=='draft'?'<button class="agRowBtn" data-results>Résultats</button>':'')+
          '<div class="agRowMenuWrap"><button class="agRowBtn more" data-row-menu title="Plus d’options">•••</button><div class="agRowMenu" data-row-pop hidden>'+
            '<button data-row-settings>Paramètres</button>'+
            (c.status==='draft'?'<button class="danger" data-delete-draft>Supprimer le brouillon</button>':'')+
            (c.status==='closed'?'<button class="danger" data-trash>Mettre à la corbeille</button>':'')+
          '</div></div>'+
        '</div>'+
      '</article>';
    }).join(''):'<div class="agRowEmpty">Aucun questionnaire dans cette catégorie.</div>';

    $$('[data-id]',listEl).forEach(row=>{
      const id=row.dataset.id;
      $('[data-open]',row)?.addEventListener('click',()=>{const c=getAnyCampaign(id);c?.status==='draft'?continueDraft_(id):campaign(id,'overview')});
      $('[data-results]',row)?.addEventListener('click',()=>campaign(id,'results'));
      const menuBtn=$('[data-row-menu]',row),menuPop=$('[data-row-pop]',row);
      menuBtn?.addEventListener('click',e=>{
        e.stopPropagation();
        const wasOpen=menuPop&&!menuPop.hidden;
        $$('[data-row-pop]',listEl).forEach(x=>x.hidden=true);
        if(menuPop)menuPop.hidden=wasOpen;
      });
      menuPop?.addEventListener('click',e=>e.stopPropagation());
      $('[data-row-settings]',row)?.addEventListener('click',()=>campaign(id,'settings'));
      $('[data-delete-draft]',row)?.addEventListener('click',()=>{if(confirm('Supprimer définitivement ce brouillon ?')){removeCampaign(id);home(true)}});
      $('[data-trash]',row)?.addEventListener('click',()=>{if(confirm('Mettre ce questionnaire clôturé à la corbeille ?')){moveToTrash(id);home(true)}});
    });
    listEl.onclick=e=>{if(!e.target.closest?.('[data-row-menu],[data-row-pop]'))$$('[data-row-pop]',listEl).forEach(x=>x.hidden=true)};
  }
  renderRows();

  $$('[data-filter]',root()).forEach(b=>b.onclick=()=>{currentFilter=b.dataset.filter;$$('[data-filter]',root()).forEach(x=>x.classList.toggle('active',x===b));renderRows()});
  $('[data-search]',root()).oninput=e=>{query=e.target.value.trim();renderRows()};
  $('[data-sort]',root()).onclick=()=>{sortMode=sortMode==='updated'?'responses':sortMode==='responses'?'title':'updated';$('[data-sort] span:first-of-type',root()).textContent=sortMode==='updated'?'Filtrer':sortMode==='responses'?'Plus de réponses':'A → Z';renderRows()};

  $('[data-ag-back]',root()).onclick=backHome;
  $('[data-new]',root()).onclick=newWizard;
  $('[data-trash-view]',root()).onclick=trashView;
  $('[data-restore-file]',root()).onchange=importBackup;
  if(!fromShared)agRefreshSharedSoon_();
}

function trashView(){
  saveRoute({screen:'trash'});
  screen='trash';showRoot();style();
  const list=trashCampaigns();
  root().innerHTML=
    '<button class="back" data-back>← Retour aux questionnaires</button>'+
    '<div class="agTop"><div><h1>Corbeille</h1><p>Questionnaires AG retirés de la liste principale. Tu peux les restaurer ou les supprimer définitivement.</p></div></div>'+
    '<div class="agGrid">'+
    (list.length?list.map(c=>
      '<article class="agCard" data-trash-id="'+esc(c.id)+'">'+
      '<span class="agStatus closed">Dans la corbeille</span>'+
      '<h3>'+esc(c.title||'Questionnaire AG')+'</h3>'+
      '<div class="agMeta">'+esc(c.year||'')+' • '+allQuestions(c).length+' question(s) • '+(c.responses||[]).length+' réponse(s)<br>Mis à la corbeille le '+new Date(c.trashedAt).toLocaleDateString('fr-FR')+'</div>'+
      '<div class="agToolbar" style="margin-top:13px"><button class="agBtn" data-restore-item>↩ Restaurer</button><button class="agDanger" data-delete-item>Supprimer définitivement</button></div>'+
      '</article>'
    ).join(''):'<div class="agEmpty" style="grid-column:1/-1">La corbeille est vide.</div>')+
    '</div>';
  $('[data-back]',root()).onclick=home;
  $$('[data-trash-id]',root()).forEach(card=>{
    const id=card.dataset.trashId;
    $('[data-restore-item]',card).onclick=()=>{restoreFromTrash(id);home()};
    $('[data-delete-item]',card).onclick=()=>{if(confirm('Supprimer définitivement ce questionnaire et toutes ses réponses ? Cette action est irréversible.')){removeCampaign(id);trashView()}};
  });
}

function newWizard(){
  saveRoute({screen:'new'});
  screen='new';showRoot();
  const old=restoreDraft();
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Nouveau questionnaire AG</h1><p>Choisis comment créer le questionnaire. Le brouillon est sauvegardé automatiquement dans la base partagée.</p></div></div>'+
    (old?'<div class="agNotice agWarn" style="margin-bottom:14px">Un brouillon non terminé existe. <button class="agBtn" data-resume style="margin-left:8px">Reprendre le brouillon</button></div>':'')+
    '<div class="agSourceGrid">'+
      '<button class="agSource" data-source="template"><strong>✨ Modèle professionnel</strong><small>Partir d’un questionnaire AG déjà structuré : satisfaction, activités, communication et améliorations.</small></button>'+
      '<button class="agSource" data-source="word"><strong>📄 Document Word</strong><small>Importer un .docx et transformer automatiquement le texte en questions à vérifier.</small></button>'+
      '<button class="agSource" data-source="photo"><strong>📷 Photo / scan</strong><small>Prendre une photo du questionnaire papier et l’utiliser comme référence. OCR optionnel à la demande.</small></button>'+
      '<button class="agSource" data-source="manual"><strong>✍️ Création manuelle</strong><small>Créer librement sections, questions, types de réponses et options.</small></button>'+
    '</div>';
  $('[data-back]',root()).onclick=home;
  $('[data-resume]',root())?.addEventListener('click',()=>{draft=old;builder()});
  $$('[data-source]',root()).forEach(b=>b.onclick=()=>startSource(b.dataset.source));
}

function blankCampaign(){
  const y=new Date().getFullYear();
  return {id:uid('ag'),title:'Consultation Assemblée générale '+y,year:String(y),status:'draft',createdAt:now(),updatedAt:now(),source:{type:'manual',name:''},settings:{anonymous:false,identityMode:'optional',allowMultiple:true,showProgress:true},sections:[{id:uid('sec'),title:'Questionnaire',description:'',questions:[]}],responses:[],audit:[]};
}
function templateCampaign(){
  const c=blankCampaign();c.source={type:'template',name:'Modèle AG'};
  c.sections=[
    {id:uid('sec'),title:'Satisfaction générale',description:'Votre avis sur le fonctionnement de l’association',questions:[
      {id:uid('q'),label:'Êtes-vous satisfait(e) du fonctionnement général de l’association ?',type:'scale',required:true,options:[]},
      {id:uid('q'),label:'Les activités proposées correspondent-elles à vos attentes ?',type:'yesno',required:true,options:[]},
      {id:uid('q'),label:'Comment évaluez-vous la qualité des sorties et activités ?',type:'scale',required:false,options:[]}
    ]},
    {id:uid('sec'),title:'Communication et organisation',description:'Information, inscriptions et fonctionnement',questions:[
      {id:uid('q'),label:'Êtes-vous satisfait(e) de l’information transmise aux adhérents ?',type:'scale',required:false,options:[]},
      {id:uid('q'),label:'Quel moyen de communication préférez-vous ?',type:'single',required:false,options:['E-mail','Site internet','Courrier','Téléphone','Autre']},
      {id:uid('q'),label:'L’organisation des inscriptions vous paraît-elle simple ?',type:'yesno',required:false,options:[]}
    ]},
    {id:uid('sec'),title:'Améliorations et idées',description:'Priorités pour la prochaine saison',questions:[
      {id:uid('q'),label:'Quels sont les points qui pourraient être améliorés ?',type:'text',required:false,options:[]},
      {id:uid('q'),label:'Quelles nouvelles activités ou sorties souhaiteriez-vous ?',type:'text',required:false,options:[]},
      {id:uid('q'),label:'Avez-vous une remarque ou une suggestion pour le bureau ?',type:'text',required:false,options:[]}
    ]}
  ];
  return c;
}

function startSource(type){
  draft=type==='template'?templateCampaign():blankCampaign();
  draft.source.type=type;
  audit(draft,'Création du questionnaire','Source : '+type);
  saveDraft();
  if(type==='word')wordImport();
  else if(type==='photo')photoImport();
  else builder();
}

function loadScript(src,name){
  return new Promise((resolve,reject)=>{
    if(window[name])return resolve(window[name]);
    const existing=$('script[data-ag-lib="'+name+'"]');
    if(existing){existing.addEventListener('load',()=>resolve(window[name]),{once:true});return}
    const s=document.createElement('script');s.src=src;s.async=true;s.dataset.agLib=name;s.onload=()=>resolve(window[name]);s.onerror=()=>reject(new Error('Chargement impossible'));document.head.appendChild(s);
  });
}
function parseTextQuestions(text){
  const raw=String(text||'').split(/\r?\n/).map(x=>x.replace(/^\s*(?:\d+[.)-]|[-•])\s*/,'').trim()).filter(Boolean);
  const likely=raw.filter(x=>x.endsWith('?')||/^(quels?|quelles?|comment|pensez|souhaitez|avez-vous|etes-vous|êtes-vous|est-ce|dans quelle|sur une echelle|sur une échelle)/i.test(x));
  const lines=(likely.length>=2?likely:raw).slice(0,50);
  return lines.map(t=>({id:uid('q'),label:t,type:/oui|non/i.test(t)?'yesno':'text',required:false,options:[]}));
}

function wordImport(){
  saveRoute({screen:'word'});
  showRoot();
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Importer le document Word</h1><p>Le document est lu uniquement quand tu le demandes. Rien ne tourne en arrière-plan.</p></div></div>'+
    '<div class="agPanel"><div class="agDrop"><b>Document .docx</b><div class="agMeta">Sélectionne le questionnaire utilisé actuellement.</div><input data-file type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></div><div class="agProgress" data-msg></div><div class="agToolbar" style="margin-top:14px"><button class="agPrimary" data-read>Analyser le document</button><button class="agBtn" data-manual>Continuer sans analyse</button></div></div>';
  $('[data-back]',root()).onclick=newWizard;
  $('[data-manual]',root()).onclick=builder;
  $('[data-read]',root()).onclick=async()=>{
    const file=$('[data-file]',root()).files[0],msg=$('[data-msg]',root());
    if(!file){msg.textContent='Choisis d’abord un fichier .docx.';return}
    msg.textContent='Lecture du document…';
    try{
      const mammoth=await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js','mammoth');
      const buf=await file.arrayBuffer(),r=await mammoth.extractRawText({arrayBuffer:buf});
      const qs=parseTextQuestions(r.value);
      draft.source.name=file.name;
      draft.sections=[{id:uid('sec'),title:'Questions importées',description:'À vérifier avant publication',questions:qs.length?qs:[{id:uid('q'),label:'',type:'text',required:false,options:[]}]}];
      audit(draft,'Import Word',file.name+' • '+qs.length+' question(s) détectée(s)');
      saveDraft();builder();
    }catch(e){msg.textContent='Impossible de lire ce document automatiquement. Tu peux continuer sans analyse et saisir les questions manuellement.'}
  };
}

function photoImport(){
  saveRoute({screen:'photo'});
  showRoot();
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Photo / scan du questionnaire</h1><p>Prends une photo nette. L’OCR est optionnel et ne se lance jamais tout seul.</p></div></div>'+
    '<div class="agPanel"><div class="agDrop"><b>Photo du questionnaire</b><input data-file type="file" accept="image/*" capture="environment"><img class="agPhoto" data-preview style="display:none"></div><div class="agProgress" data-msg></div><div class="agToolbar" style="margin-top:14px"><button class="agPrimary" data-ocr>Extraire le texte (OCR)</button><button class="agBtn" data-manual>Utiliser la photo comme référence</button></div></div>';
  const fileEl=$('[data-file]',root()),preview=$('[data-preview]',root()),msg=$('[data-msg]',root());
  $('[data-back]',root()).onclick=newWizard;
  fileEl.onchange=()=>{const f=fileEl.files[0];if(!f)return;draft.source.name=f.name;preview.src=URL.createObjectURL(f);preview.style.display='block';saveDraft()};
  $('[data-manual]',root()).onclick=builder;
  $('[data-ocr]',root()).onclick=async()=>{
    const file=fileEl.files[0];if(!file){msg.textContent='Choisis ou prends d’abord une photo.';return}
    msg.textContent='Préparation de l’image…';
    try{
      const img=new Image(),url=URL.createObjectURL(file);
      await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
      const max=1200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),cv=document.createElement('canvas');
      cv.width=Math.round(img.naturalWidth*scale);cv.height=Math.round(img.naturalHeight*scale);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);URL.revokeObjectURL(url);
      msg.textContent='Chargement de la reconnaissance de texte…';
      const Tesseract=await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js','Tesseract');
      const r=await Tesseract.recognize(cv,'fra',{logger:m=>{if(m.status==='recognizing text')msg.textContent='Lecture : '+Math.round((m.progress||0)*100)+' %'}});
      const qs=parseTextQuestions(r.data.text);
      draft.sections=[{id:uid('sec'),title:'Questions extraites de la photo',description:'À vérifier',questions:qs.length?qs:[{id:uid('q'),label:'',type:'text',required:false,options:[]}]}];
      audit(draft,'OCR photo',file.name+' • '+qs.length+' question(s) détectée(s)');
      saveDraft();builder();
    }catch(e){msg.textContent='L’OCR n’a pas abouti. Utilise « Utiliser la photo comme référence » pour continuer sans ralentir l’application.'}
  };
}

function builder(){
  saveRoute({screen:'builder'});
  screen='builder';showRoot();style();
  if(!draft)draft=restoreDraft()||blankCampaign();
  if(!draft.sections?.length)draft.sections=[{id:uid('sec'),title:'Questionnaire',description:'',questions:[]}];
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Concepteur de questionnaire</h1><p>Structure par sections, types de réponses, options, aperçu et sauvegarde automatique du brouillon dans la base partagée.</p></div><div class="agToolbar"><button class="agBtn" data-preview>Aperçu</button><button class="agPrimary" data-save>Enregistrer</button></div></div>'+
    '<div class="agPanel"><div class="agTwo"><div class="agField"><label>Titre</label><input data-title value="'+esc(draft.title)+'"></div><div class="agField"><label>Année / saison</label><input data-year value="'+esc(draft.year||'')+'"></div></div><div class="agTwo"><div class="agField"><label>Identification du répondant</label><select data-identity><option value="optional" '+(identityMode(draft)==='optional'?'selected':'')+'>Prénom et nom facultatifs</option><option value="anonymous" '+(identityMode(draft)==='anonymous'?'selected':'')+'>Réponse totalement anonyme</option></select></div><div class="agField"><label>Statut initial</label><select data-status><option value="draft" '+(draft.status==='draft'?'selected':'')+'>Brouillon</option><option value="open" '+(draft.status==='open'?'selected':'')+'>Ouvert</option></select></div></div></div>'+
    '<div data-sections></div>'+
    '<div class="agToolbar"><button class="agBtn" data-add-section>＋ Ajouter une section</button><button class="agPrimary" data-save-bottom>Enregistrer le questionnaire</button></div>';
  const wrap=$('[data-sections]',root());

  function syncHeader(){
    draft.title=$('[data-title]',root()).value;
    draft.year=$('[data-year]',root()).value;
    draft.settings=draft.settings||{};
    draft.settings.identityMode=$('[data-identity]',root()).value;draft.settings.anonymous=draft.settings.identityMode==='anonymous';
    draft.status=$('[data-status]',root()).value;
    saveDraft();
  }
  $('[data-title]',root()).oninput=syncHeader;$('[data-year]',root()).oninput=syncHeader;$('[data-identity]',root()).onchange=syncHeader;$('[data-status]',root()).onchange=syncHeader;

  function draw(){
    wrap.innerHTML=draft.sections.map((sec,si)=>
      '<div class="agSection" data-si="'+si+'">'+
      '<div class="agSectionHead"><input data-sec-title value="'+esc(sec.title||'')+'" placeholder="Titre de la section"><button class="agIconBtn" data-up title="Monter">↑</button><button class="agIconBtn" data-down title="Descendre">↓</button><button class="agIconBtn agRemove" data-del-sec title="Supprimer">×</button></div>'+
      '<div style="padding:0 12px 12px"><div class="agField"><label>Description de la section</label><input data-sec-desc value="'+esc(sec.description||'')+'" placeholder="Facultatif"></div><div data-questions>'+
      (sec.questions||[]).map((qu,qi)=>
        '<div class="agQuestion" data-qi="'+qi+'">'+
        '<div class="agQuestionTop"><input data-label value="'+esc(qu.label||'')+'" placeholder="Texte de la question"><select data-type>'+
        '<option value="text" '+(qu.type==='text'?'selected':'')+'>Réponse libre</option>'+
        '<option value="yesno" '+(qu.type==='yesno'?'selected':'')+'>Oui / Non</option>'+
        '<option value="scale" '+(qu.type==='scale'?'selected':'')+'>Note de 1 à 5</option>'+
        '<option value="single" '+(qu.type==='single'?'selected':'')+'>Choix unique</option>'+
        '<option value="multi" '+(qu.type==='multi'?'selected':'')+'>Choix multiples</option>'+
        '</select><div class="agQActions"><button class="agIconBtn" data-q-up>↑</button><button class="agIconBtn" data-q-down>↓</button><button class="agIconBtn" data-dup>⧉</button><button class="agIconBtn agRemove" data-del>×</button></div></div>'+
        ((qu.type==='single'||qu.type==='multi')?'<div class="agField"><label>Options (séparées par des virgules)</label><input data-options value="'+esc((qu.options||[]).join(', '))+'"></div>':'')+
        '<label class="agRequired"><input type="checkbox" data-required '+(qu.required?'checked':'')+'> Question obligatoire</label>'+
        '</div>'
      ).join('')+
      '</div><button class="agBtn" data-add-q style="margin-top:10px">＋ Ajouter une question</button></div></div>'
    ).join('');

    $$('[data-si]',wrap).forEach(secEl=>{
      const si=Number(secEl.dataset.si),sec=draft.sections[si];
      $('[data-sec-title]',secEl).oninput=e=>{sec.title=e.target.value;saveDraft()};
      $('[data-sec-desc]',secEl).oninput=e=>{sec.description=e.target.value;saveDraft()};
      $('[data-up]',secEl).onclick=()=>{if(si>0){[draft.sections[si-1],draft.sections[si]]=[draft.sections[si],draft.sections[si-1]];saveDraft();draw()}};
      $('[data-down]',secEl).onclick=()=>{if(si<draft.sections.length-1){[draft.sections[si+1],draft.sections[si]]=[draft.sections[si],draft.sections[si+1]];saveDraft();draw()}};
      $('[data-del-sec]',secEl).onclick=()=>{if(draft.sections.length===1)return alert('Il faut conserver au moins une section.');draft.sections.splice(si,1);saveDraft();draw()};
      $('[data-add-q]',secEl).onclick=()=>{sec.questions.push({id:uid('q'),label:'',type:'text',required:false,options:[]});saveDraft();draw()};
      $$('[data-qi]',secEl).forEach(qEl=>{
        const qi=Number(qEl.dataset.qi),qu=sec.questions[qi];
        $('[data-label]',qEl).oninput=e=>{qu.label=e.target.value;saveDraft()};
        $('[data-type]',qEl).onchange=e=>{qu.type=e.target.value;if(!Array.isArray(qu.options))qu.options=[];saveDraft();draw()};
        $('[data-required]',qEl).onchange=e=>{qu.required=e.target.checked;saveDraft()};
        $('[data-options]',qEl)?.addEventListener('input',e=>{qu.options=e.target.value.split(',').map(x=>x.trim()).filter(Boolean);saveDraft()});
        $('[data-q-up]',qEl).onclick=()=>{if(qi>0){[sec.questions[qi-1],sec.questions[qi]]=[sec.questions[qi],sec.questions[qi-1]];saveDraft();draw()}};
        $('[data-q-down]',qEl).onclick=()=>{if(qi<sec.questions.length-1){[sec.questions[qi+1],sec.questions[qi]]=[sec.questions[qi],sec.questions[qi+1]];saveDraft();draw()}};
        $('[data-dup]',qEl).onclick=()=>{sec.questions.splice(qi+1,0,{...qu,id:uid('q'),options:[...(qu.options||[])]});saveDraft();draw()};
        $('[data-del]',qEl).onclick=()=>{sec.questions.splice(qi,1);saveDraft();draw()};
      });
    });
  }
  draw();

  async function persist(){
    syncHeader();
    draft.title=draft.title.trim()||'Questionnaire Assemblée générale';
    draft.sections.forEach(s=>{s.title=(s.title||'Section').trim()||'Section';s.questions=(s.questions||[]).filter(q=>(q.label||'').trim())});
    if(!allQuestions(draft).length)return alert('Ajoute au moins une question.');
    audit(draft,'Enregistrement du questionnaire',allQuestions(draft).length+' question(s)');
    const id=draft.id;
    try{
      await saveCampaignConfirmed_(draft);
      activeId=id;clearDraft();draft=null;campaign(activeId,'overview');
    }catch(e){
      console.error(e);
      alert("Google Sheets : "+(e?.message||"enregistrement impossible."));
    }
  }
  $('[data-back]',root()).onclick=()=>{saveDraft();newWizard()};
  $('[data-add-section]',root()).onclick=()=>{draft.sections.push({id:uid('sec'),title:'Nouvelle section',description:'',questions:[]});saveDraft();draw()};
  $('[data-preview]',root()).onclick=previewDraft;
  $('[data-save]',root()).onclick=persist;$('[data-save-bottom]',root()).onclick=persist;
}

function previewDraft(){
  saveRoute({screen:'builder'});
  syncDraftFromStorage();
  showRoot();
  const c=draft||restoreDraft();if(!c)return builder();
  root().innerHTML=
    '<button class="back" data-back>← Retour au concepteur</button>'+
    '<div class="agTop"><div><h1>Aperçu du questionnaire</h1><p>'+esc(c.title)+'</p></div></div>'+
    '<div class="agPreview">'+renderFormFields(c,false)+'</div>';
  $('[data-back]',root()).onclick=builder;
}
function syncDraftFromStorage(){const d=restoreDraft();if(d)draft=d}

function renderFormFields(c,interactive=true,answers={}){
  return (c.sections||[]).map(sec=>
    '<div style="margin-bottom:18px"><h3 style="margin:0 0 4px">'+esc(sec.title)+'</h3>'+(sec.description?'<div class="agMeta">'+esc(sec.description)+'</div>':'')+
    (sec.questions||[]).map(qu=>'<div class="agPreviewQ"><b>'+esc(qu.label)+(qu.required?' *':'')+'</b>'+answerControl(qu,interactive,answers[qu.id])+'</div>').join('')+'</div>'
  ).join('');
}
function answerControl(qu,interactive,val){
  const dis=interactive?'':' disabled';
  if(qu.type==='yesno')return '<select data-answer="'+esc(qu.id)+'"'+dis+'><option value=""></option><option '+(val==='Oui'?'selected':'')+'>Oui</option><option '+(val==='Non'?'selected':'')+'>Non</option></select>';
  if(qu.type==='scale')return '<select data-answer="'+esc(qu.id)+'"'+dis+'><option value=""></option>'+[1,2,3,4,5].map(n=>'<option '+(String(val)===String(n)?'selected':'')+'>'+n+'</option>').join('')+'</select>';
  if(qu.type==='single')return '<select data-answer="'+esc(qu.id)+'"'+dis+'><option value=""></option>'+(qu.options||[]).map(o=>'<option '+(String(val)===String(o)?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select>';
  if(qu.type==='multi')return '<div class="agChoiceList" data-multi="'+esc(qu.id)+'">'+(qu.options||[]).map(o=>'<label class="agChoice"><input type="checkbox" value="'+esc(o)+'" '+(Array.isArray(val)&&val.includes(o)?'checked':'')+dis+'> '+esc(o)+'</label>').join('')+'</div>';
  return '<textarea data-answer="'+esc(qu.id)+'" placeholder="Réponse…"'+dis+'>'+esc(val||'')+'</textarea>';
}

function campaign(id,tab='overview'){
  saveRoute({screen:'campaign',id,tab});
  activeId=id;screen='campaign';showRoot();style();
  const c=getCampaign(id);if(!c)return home();
  root().innerHTML=
    '<button class="back" data-back>← Tous les questionnaires</button>'+
    '<div class="agBanner"><div><span class="agStatus">'+statusLabel(c.status)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.year||'')+' • '+allQuestions(c).length+' question(s) • '+(c.responses||[]).length+' réponse(s)</p></div><div class="agToolbar">'+
    (c.status==='draft'?'<button class="agPrimary" data-open-c>Ouvrir la consultation</button>':c.status==='open'?'<button class="agBtn" data-close-c>Clôturer</button>':'<button class="agBtn" data-reopen>Réouvrir</button>')+
    '<button class="agBtn" data-print>Imprimer</button></div></div>'+
    '<div class="agTabs">'+
      '<button class="agTab '+(tab==='overview'?'active':'')+'" data-tab="overview">Vue d’ensemble</button>'+
      '<button class="agTab '+(tab==='collect'?'active':'')+'" data-tab="collect">Collecte</button>'+
      '<button class="agTab '+(tab==='responses'?'active':'')+'" data-tab="responses">Réponses</button>'+
      '<button class="agTab '+(tab==='results'?'active':'')+'" data-tab="results">Dépouillement</button>'+
      '<button class="agTab '+(tab==='settings'?'active':'')+'" data-tab="settings">Paramètres</button>'+
    '</div><div data-content></div>';
  $('[data-back]',root()).onclick=home;
  $$('[data-tab]',root()).forEach(b=>b.onclick=()=>campaign(id,b.dataset.tab));
  $('[data-open-c]',root())?.addEventListener('click',async e=>{
    const b=e.currentTarget,oldStatus=c.status;
    b.disabled=true;b.textContent='Ouverture…';
    c.status='open';audit(c,'Consultation ouverte');
    try{
      await saveCampaignConfirmed_(c);
      campaign(id,'collect');
    }catch(err){
      c.status=oldStatus;saveCampaign(c,false);
      console.error(err);alert("Impossible d'ouvrir la consultation. Google Sheets : "+(err?.message||"enregistrement impossible."));
      campaign(id,'overview');
    }
  });
  $('[data-close-c]',root())?.addEventListener('click',async e=>{
    const b=e.currentTarget,oldStatus=c.status;
    b.disabled=true;b.textContent='Clôture…';
    c.status='closed';audit(c,'Consultation clôturée');
    try{await saveCampaignConfirmed_(c);campaign(id,'results')}
    catch(err){c.status=oldStatus;saveCampaign(c,false);console.error(err);alert("Impossible de clôturer la consultation. Google Sheets : "+(err?.message||"enregistrement impossible."));campaign(id,'overview')}
  });
  $('[data-reopen]',root())?.addEventListener('click',async e=>{
    const b=e.currentTarget,oldStatus=c.status;
    b.disabled=true;b.textContent='Réouverture…';
    c.status='open';audit(c,'Consultation réouverte');
    try{await saveCampaignConfirmed_(c);campaign(id,'collect')}
    catch(err){c.status=oldStatus;saveCampaign(c,false);console.error(err);alert("Impossible de réouvrir la consultation. Google Sheets : "+(err?.message||"enregistrement impossible."));campaign(id,'overview')}
  });
  $('[data-print]',root()).onclick=()=>window.print();
  if(tab==='overview')overview(c);else if(tab==='collect')collect(c);else if(tab==='responses')responses(c);else if(tab==='results')results(c);else settings(c);
}

function overview(c){
  const qs=allQuestions(c),resp=c.responses||[];
  $('[data-content]',root()).innerHTML=
    '<div class="agKpis">'+
    '<div class="agKpi"><b>'+resp.length+'</b><span>réponses</span></div>'+
    '<div class="agKpi"><b>'+avgCompletion(c)+' %</b><span>complétion moyenne</span></div>'+
    '<div class="agKpi"><b>'+qs.filter(q=>q.required).length+'</b><span>questions obligatoires</span></div>'+
    '<div class="agKpi"><b>'+new Set(resp.map(r=>r.channel||'manual')).size+'</b><span>mode(s) de collecte</span></div></div>'+
    '<div class="agTwo"><div class="agPanel"><h3>Structure du questionnaire</h3>'+
    (c.sections||[]).map((s,i)=>'<div class="agResult"><b>'+esc((i+1)+'. '+s.title)+'</b><div class="agMeta">'+(s.questions||[]).length+' question(s)</div></div>').join('')+
    '</div><div class="agPanel"><h3>Historique</h3><div class="agAudit">'+((c.audit||[]).length?(c.audit||[]).slice(0,12).map(a=>'<div class="agAuditItem"><b>'+esc(a.action)+'</b><span>'+new Date(a.at).toLocaleString('fr-FR')+(a.detail?' • '+esc(a.detail):'')+'</span></div>').join(''):'<div class="agMeta">Aucune activité.</div>')+'</div></div></div>';
}

function collect(c){
  $('[data-content]',root()).innerHTML=
    '<div class="agTwo"><div class="agPanel"><h3>Questionnaires papier</h3><p class="agMeta">Saisie rapide après l’Assemblée générale. Chaque formulaire enregistré reçoit un numéro.</p><div class="agToolbar"><button class="agPrimary" data-enter>＋ Saisir un questionnaire rempli</button></div></div>'+
    '<div class="agPanel"><h3>Import de réponses</h3><p class="agMeta">Importe un CSV exporté depuis un autre outil. Les colonnes doivent porter le texte des questions.</p><div class="agToolbar"><button class="agBtn" data-csv>Importer un CSV</button></div><input data-csv-file type="file" accept=".csv,text/csv" hidden></div></div>'+
    '<div class="agPanel"><h3>Mode collecte</h3><div class="agNotice">'+(c.status==='open'?'La consultation est ouverte. Tu peux saisir les réponses au fur et à mesure.':'Le questionnaire est actuellement '+statusLabel(c.status).toLowerCase()+'. Tu peux quand même saisir des questionnaires papier.')+'</div></div>';
  $('[data-enter]',root()).onclick=()=>entry(c.id);
  $('[data-csv]',root()).onclick=()=>$('[data-csv-file]',root()).click();
  $('[data-csv-file]',root()).onchange=e=>importResponsesCSV(c,e.target.files[0]);
}

function entry(id,existing=null){
  saveRoute({screen:'entry',id,responseId:existing?.id||null});
  const c=getCampaign(id);if(!c)return;
  showRoot();screen='entry';
  const number=(c.responses||[]).length+1,answers=existing?.answers||{};
  root().innerHTML=
    '<button class="back" data-back>← Retour à la collecte</button>'+
    '<div class="agTop"><div><h1>Saisie d’un questionnaire</h1><p>Questionnaire papier n° '+number+' • sauvegarde au moment de l’enregistrement</p></div></div>'+
    '<div class="agCollector"><div class="agPanel">'+
    (identityMode(c)==='optional'?'<div class="agTwo"><div class="agField"><label>Prénom (facultatif)</label><input data-first-name value="'+esc(existing?.respondentFirstName||'')+'"></div><div class="agField"><label>Nom (facultatif)</label><input data-last-name value="'+esc(existing?.respondentLastName||existing?.respondent||'')+'"></div></div>':'')+
    renderFormFields(c,true,answers)+
    '<div class="agToolbar"><button class="agPrimary" data-save>Enregistrer</button><button class="agBtn" data-next>Enregistrer et saisir le suivant</button></div></div></div>';
  $('[data-back]',root()).onclick=()=>campaign(id,'collect');
  function collectAnswers(){
    const a={};
    allQuestions(c).forEach(qu=>{
      if(qu.type==='multi')a[qu.id]=$$('[data-multi="'+qu.id+'"] input:checked',root()).map(x=>x.value);
      else a[qu.id]=$('[data-answer="'+qu.id+'"]',root())?.value||'';
    });
    return a;
  }
  function valid(a){
    const missing=allQuestions(c).filter(q=>q.required&&(Array.isArray(a[q.id])?a[q.id].length===0:String(a[q.id]??'').trim()===''));
    if(missing.length){alert('Il manque '+missing.length+' réponse(s) obligatoire(s).');return false}return true;
  }
  async function store(next){
    const a=collectAnswers();if(!valid(a))return;
    const firstName=$('[data-first-name]',root())?.value.trim()||'',lastName=$('[data-last-name]',root())?.value.trim()||'';const row={id:existing?.id||uid('resp'),createdAt:existing?.createdAt||now(),updatedAt:now(),channel:'paper',respondentFirstName:firstName,respondentLastName:lastName,respondent:[firstName,lastName].filter(Boolean).join(' '),answers:a};
    c.responses=c.responses||[];
    const before=JSON.parse(JSON.stringify(c.responses));
    const i=c.responses.findIndex(r=>r.id===row.id);if(i<0)c.responses.push(row);else c.responses[i]=row;
    audit(c,'Réponse enregistrée','Questionnaire n° '+c.responses.length);
    try{
      await saveCampaignConfirmed_(c);
      next?entry(id):campaign(id,'collect');
    }catch(err){
      c.responses=before;saveCampaign(c,false);console.error(err);
      alert("Réponse non enregistrée. Google Sheets : "+(err?.message||"enregistrement impossible."));
    }
  }
  $('[data-save]',root()).onclick=()=>store(false);$('[data-next]',root()).onclick=()=>store(true);
}

function responses(c){
  const rows=c.responses||[];
  $('[data-content]',root()).innerHTML=
    '<div class="agPanel"><div class="agTop" style="margin-bottom:10px"><div><h3>Réponses enregistrées</h3><p>'+rows.length+' questionnaire(s)</p></div><div class="agToolbar"><button class="agBtn" data-export>Exporter CSV</button></div></div>'+
    (rows.length?'<table class="agTable"><thead><tr><th>N°</th><th>Date</th><th>Canal</th><th>Complétion</th><th></th></tr></thead><tbody>'+
    rows.map((r,i)=>{const qs=allQuestions(c),n=qs.filter(q=>{const v=r.answers?.[q.id];return Array.isArray(v)?v.length:String(v??'').trim()}).length,p=qs.length?Math.round(n*100/qs.length):0;return '<tr data-rid="'+esc(r.id)+'"><td>'+(i+1)+'</td><td>'+new Date(r.createdAt).toLocaleString('fr-FR')+'</td><td>'+esc(r.channel||'papier')+'</td><td>'+p+' %</td><td><button class="agBtn" data-edit>Modifier</button> <button class="agDanger" data-del>Supprimer</button></td></tr>'}).join('')+
    '</tbody></table>':'<div class="agEmpty">Aucune réponse enregistrée.</div>')+'</div>';
  $('[data-export]',root()).onclick=()=>exportCSV(c);
  $$('[data-rid]',root()).forEach(tr=>{
    const id=tr.dataset.rid,r=rows.find(x=>x.id===id);
    $('[data-edit]',tr).onclick=()=>entry(c.id,r);
    $('[data-del]',tr).onclick=()=>{if(confirm('Supprimer cette réponse ?')){c.responses=c.responses.filter(x=>x.id!==id);audit(c,'Réponse supprimée');saveCampaign(c);campaign(c.id,'responses')}};
  });
}

const STOP=new Set('avec alors aussi aucun aucune avoir avez bien car ce ces cette dans des du elle elles en est et etre être eux fait faire faut il ils je la le les leur leurs lui mais mes mon ne nos notre nous on ou par pas plus pour que quel quelle quels quelles qui quoi sa sans se ses si son sont sous sur ta te tes toi ton tous toutes tres très tu un une vos votre vous y'.split(' '));
function keywords(values){
  const m=new Map();
  values.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s'-]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w)).forEach(w=>m.set(w,(m.get(w)||0)+1));
  return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
}
function improvementQuestion(q){const n=norm(q.label);return /amelior|suggest|remarque|attente|probleme|priorite|idee|souhait/.test(n)}

function results(c){
  const resp=c.responses||[],qs=allQuestions(c),scaleValues=[];
  qs.filter(q=>q.type==='scale').forEach(q=>resp.forEach(r=>{const n=Number(r.answers?.[q.id]);if(n>=1&&n<=5)scaleValues.push(n)}));
  const globalAvg=scaleValues.length?(scaleValues.reduce((a,b)=>a+b,0)/scaleValues.length).toFixed(2):'—';
  const improveTexts=qs.filter(improvementQuestion).flatMap(q=>resp.map(r=>String(r.answers?.[q.id]||'').trim()).filter(Boolean));
  const improveKw=keywords(improveTexts);
  $('[data-content]',root()).innerHTML=
    '<div class="agKpis"><div class="agKpi"><b>'+resp.length+'</b><span>questionnaires dépouillés</span></div><div class="agKpi"><b>'+avgCompletion(c)+' %</b><span>complétion moyenne</span></div><div class="agKpi"><b>'+globalAvg+'</b><span>note moyenne globale / 5</span></div><div class="agKpi"><b>'+improveTexts.length+'</b><span>remarques d’amélioration</span></div></div>'+
    (improveTexts.length?'<div class="agPanel"><h3>🔎 Points d’amélioration détectés</h3><div class="agMeta">Synthèse automatique des questions libres liées aux améliorations, attentes et suggestions.</div><div class="agKeywords">'+improveKw.map(([w,n])=>'<span class="agKeyword">'+esc(w)+' × '+n+'</span>').join('')+'</div>'+improveTexts.slice(0,10).map(t=>'<div class="agQuote">'+esc(t)+'</div>').join('')+'</div>':'')+
    '<div class="agPanel"><div class="agTop" style="margin-bottom:4px"><div><h3>Dépouillement détaillé</h3><p>Calcul automatique question par question.</p></div><div class="agToolbar"><button class="agBtn" data-csv>CSV</button><button class="agBtn" data-print>Imprimer la synthèse</button></div></div>'+
    (resp.length?qs.map((q,i)=>resultBlock(c,q,i)).join(''):'<div class="agEmpty">Aucune réponse à dépouiller.</div>')+'</div>';
  $('[data-csv]',root()).onclick=()=>exportCSV(c);$('[data-print]',root()).onclick=()=>window.print();
}

function resultBlock(c,q,i){
  const vals=(c.responses||[]).map(r=>r.answers?.[q.id]).filter(v=>Array.isArray(v)?v.length:String(v??'').trim()!=='');
  const head='<div class="agResult"><h4>'+(i+1)+'. '+esc(q.label)+'</h4><small>'+vals.length+' réponse(s)</small>';
  if(q.type==='text'){
    const kw=keywords(vals.map(String));
    return head+(kw.length?'<div class="agKeywords">'+kw.map(([w,n])=>'<span class="agKeyword">'+esc(w)+' × '+n+'</span>').join('')+'</div>':'')+vals.slice(0,12).map(v=>'<div class="agQuote">'+esc(v)+'</div>').join('')+'</div>';
  }
  if(q.type==='scale'){
    const nums=vals.map(Number).filter(n=>n>=1&&n<=5),avg=nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2):'—';
    return head+'<div class="agMeta">Moyenne : <b>'+avg+' / 5</b></div>'+[1,2,3,4,5].map(n=>bar(String(n),nums.filter(v=>v===n).length,nums.length)).join('')+'</div>';
  }
  if(q.type==='multi'){
    const opts=q.options||[],flat=vals.flatMap(v=>Array.isArray(v)?v:[v]);
    return head+opts.map(o=>bar(o,flat.filter(v=>String(v)===String(o)).length,vals.length)).join('')+'</div>';
  }
  const opts=q.type==='yesno'?['Oui','Non']:(q.options||[]);
  return head+opts.map(o=>bar(o,vals.filter(v=>String(v)===String(o)).length,vals.length)).join('')+'</div>';
}
function bar(label,count,total){
  const pct=total?Math.round(count*100/total):0;
  return '<div class="agBarRow"><div><div class="agMeta">'+esc(label)+'</div><div class="agBar"><span style="width:'+pct+'%"></span></div></div><div class="agPercent">'+count+' • '+pct+'%</div></div>';
}

function settings(c){
  $('[data-content]',root()).innerHTML=
    '<div class="agTwo"><div class="agPanel"><h3>Paramètres du questionnaire</h3><div class="agField"><label>Titre</label><input data-title value="'+esc(c.title)+'"></div><div class="agField"><label>Année / saison</label><input data-year value="'+esc(c.year||'')+'"></div><div class="agField"><label>Identification du répondant</label><select data-identity><option value="optional" '+(identityMode(c)==='optional'?'selected':'')+'>Prénom et nom facultatifs</option><option value="anonymous" '+(identityMode(c)==='anonymous'?'selected':'')+'>Réponse totalement anonyme</option></select></div><div class="agToolbar" style="margin-top:14px"><button class="agPrimary" data-save>Enregistrer</button><button class="agBtn" data-edit>Modifier les questions</button></div></div>'+
    '<div class="agPanel"><h3>Maintenance</h3><div class="agNotice">Les questionnaires, brouillons et réponses sont synchronisés avec la base partagée Google Sheets.</div><div class="agToolbar" style="margin-top:14px"><button class="agBtn" data-dup>Dupliquer le questionnaire</button>'+(c.status==='closed'?'<button class="agDanger" data-trash-settings>🗑 Mettre à la corbeille</button>':'')+'</div></div></div>';
  $('[data-save]',root()).onclick=()=>{c.title=$('[data-title]',root()).value.trim()||c.title;c.year=$('[data-year]',root()).value;c.settings=c.settings||{};c.settings.identityMode=$('[data-identity]',root()).value;c.settings.anonymous=c.settings.identityMode==='anonymous';audit(c,'Paramètres modifiés');saveCampaign(c);campaign(c.id,'settings')};
  $('[data-edit]',root()).onclick=()=>{draft=JSON.parse(JSON.stringify(c));saveDraft();builder()};
  $('[data-dup]',root()).onclick=()=>{const copy=JSON.parse(JSON.stringify(c));copy.id=uid('ag');copy.title+=' — copie';copy.status='draft';copy.createdAt=now();copy.updatedAt=now();copy.responses=[];copy.audit=[];audit(copy,'Questionnaire dupliqué',c.title);saveCampaign(copy);campaign(copy.id,'overview')};
  $('[data-trash-settings]',root())?.addEventListener('click',()=>{if(confirm('Mettre ce questionnaire clôturé à la corbeille ?')){moveToTrash(c.id);home()}});
}

function exportCSV(c){
  const qs=allQuestions(c),rows=[['Numéro','Date','Canal','Prénom','Nom',...qs.map(q=>q.label)]];
  (c.responses||[]).forEach((r,i)=>rows.push([i+1,r.createdAt,r.channel||'',r.respondentFirstName||'',r.respondentLastName||r.respondent||'',...qs.map(q=>Array.isArray(r.answers?.[q.id])?r.answers[q.id].join(' | '):(r.answers?.[q.id]||''))]));
  const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n');
  downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),safeName(c.title)+'.csv');
}
function exportBackup(){
  const payload={type:'horticulture-ag-backup',version:APP_VERSION,exportedAt:now(),data:db()};
  downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),'consultation-ag-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json');
}
function importBackup(e){
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=()=>{try{const j=JSON.parse(r.result);const data=j.type==='horticulture-ag-backup'?j.data:j;if(!Array.isArray(data.campaigns))throw 0;if(!confirm('Remplacer les données Consultation AG actuelles par cette sauvegarde ?'))return;saveDB({version:APP_VERSION,campaigns:data.campaigns});Promise.all(data.campaigns.map(agPushCampaign_)).finally(()=>home())}catch{alert('Sauvegarde non reconnue.')}};
  r.readAsText(file);
}
function importResponsesCSV(c,file){
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const lines=String(r.result).split(/\r?\n/).filter(Boolean),sep=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?';':',';
    const parse=line=>{const out=[];let cur='',quote=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quote&&line[i+1]==='"'){cur+='"';i++}else quote=!quote}else if(ch===sep&&!quote){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out};
    const head=parse(lines[0]),qs=allQuestions(c),map=qs.map(q=>head.findIndex(h=>norm(h)===norm(q.label)));
    let added=0;
    lines.slice(1).forEach(line=>{const cells=parse(line),answers={};qs.forEach((q,i)=>{const x=map[i];if(x>=0)answers[q.id]=q.type==='multi'?String(cells[x]||'').split('|').map(v=>v.trim()).filter(Boolean):(cells[x]||'')});if(Object.values(answers).some(v=>Array.isArray(v)?v.length:String(v).trim())){c.responses.push({id:uid('resp'),createdAt:now(),updatedAt:now(),channel:'csv',respondent:'',answers});added++}});
    audit(c,'Import CSV',added+' réponse(s) importée(s)');saveCampaign(c);campaign(c.id,'responses');
  }catch{alert('Impossible de lire ce CSV.')}};r.readAsText(file);
}
function safeName(s){return norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'questionnaire-ag'}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}

function restoreRoute(){
  if(routeRestored||!hasSession())return false;
  const route=readRoute();if(!route)return false;
  routeRestored=true;
  try{
    if(route.screen==='campaign'&&route.id&&getCampaign(route.id)){campaign(route.id,route.tab||'overview');return true}
    if(route.screen==='entry'&&route.id&&getCampaign(route.id)){
      const cp=getCampaign(route.id),existing=route.responseId?(cp.responses||[]).find(r=>r.id===route.responseId)||null:null;
      entry(route.id,existing);return true
    }
    if(route.screen==='trash'){trashView();return true}
    if(route.screen==='new'){newWizard();return true}
    if(route.screen==='word'){draft=restoreDraft()||draft;if(draft){wordImport();return true}}
    if(route.screen==='photo'){draft=restoreDraft()||draft;if(draft){photoImport();return true}}
    if(route.screen==='builder'){draft=restoreDraft()||draft;builder();return true}
    home();return true;
  }catch(e){console.warn('Restauration Consultation AG',e);home();return true}
}
function scheduleRouteRestore(tryNo=0){
  if(routeRestored||!readRoute())return;
  if(!isAGActive_()){clearRoute();return}
  const shell=document.getElementById('appShell');
  if(hasSession()&&shell&&getComputedStyle(shell).display!=='none'){restoreRoute();return}
  if(tryNo<10)setTimeout(()=>scheduleRouteRestore(tryNo+1),300);
}

function openAGSafe_(){
  document.getElementById('drawer')?.classList.remove('open');
  setAGActive_(true);
  try{home();return true}
  catch(first){
    console.error('Ouverture Consultation AG',first);
    setTimeout(()=>{
      try{home()}
      catch(second){
        console.error('Ouverture Consultation AG — seconde tentative',second);
        document.body.classList.add('agWorkspaceMode');
        $('.view').forEach(v=>v.classList.remove('active'));
        const r=root();r.classList.add('active');
        r.innerHTML='<div class="agPanel"><h2>Consultation AG</h2><p>Le module n’a pas pu terminer son affichage. Recharge uniquement si ce message persiste.</p></div>';
      }
    },50);
    return false;
  }
}

function installNavigation(){
  if(document.documentElement.dataset.agProNavigation==='4')return;
  document.documentElement.dataset.agProNavigation='4';

  // Quand on quitte Consultation AG via la navigation normale de l'application,
  // on retire d'abord proprement la vue AG afin d'éviter Accueil + AG affichés ensemble.
  document.addEventListener('click',e=>{
    const go=e.target.closest?.('[data-go]');
    if(!go||!document.body.classList.contains('agWorkspaceMode'))return;
    document.body.classList.remove('agWorkspaceMode');
    root().classList.remove('active');
    clearRoute();
    setAGActive_(false);
  },true);

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-module="consultation-ag"],[data-permission="consultation_ag"]');
    if(!b||!b.matches('button,[role="button"]'))return;
    e.preventDefault();
    document.getElementById('drawer')?.classList.remove('open');
    setTimeout(()=>{
      try{openAGSafe_()}
      catch(err){
        console.error('Ouverture Consultation AG',err);
        document.body.classList.remove('agWorkspaceMode');
        $('.view').forEach(v=>v.classList.remove('active'));
        $('#home')?.classList.add('active');
      }
    },0);
  });
}

style();visualStyle();root();installNavigation();agLiveSyncLoop_();
setTimeout(()=>scheduleRouteRestore(),450);
window.addEventListener('pageshow',()=>{setTimeout(()=>scheduleRouteRestore(),120);setTimeout(agWarmShared_,500)});
window.addEventListener('horticulture-users-synced',()=>{
  setTimeout(()=>scheduleRouteRestore(),80);
  if(screen==='home'&&document.body.classList.contains('agWorkspaceMode'))setTimeout(()=>agRefreshShared_(true).then(ok=>{
    if(ok&&screen==='home'&&document.body.classList.contains('agWorkspaceMode'))home(true)
  }),180);
  else setTimeout(agWarmShared_,200);
});
window.addEventListener('focus',()=>{if(document.body.classList.contains('agWorkspaceMode'))agRefreshVisible_()});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&document.body.classList.contains('agWorkspaceMode'))agRefreshVisible_()});
document.getElementById('logout')?.addEventListener('click',()=>{clearRoute();setAGActive_(false);document.body.classList.remove('agWorkspaceMode')});
window.HorticultureAG={open:openAGSafe_,new:newWizard,version:APP_VERSION,syncVersion:31};
})();