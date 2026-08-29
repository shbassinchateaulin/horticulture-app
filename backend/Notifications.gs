// Notifications.gs — notifications individuelles synchronisées entre appareils + push OneSignal
// Ce fichier appartient au même projet Apps Script que Code.gs.

const NOTIF_SHEET='Notifications';
const NOTIF_HEADERS=['id','type','title','message','targetUsers','targetPermissions','createdAt','expiresAt','data'];
const NOTIF_READ_SHEET='Notifications lectures';
const NOTIF_READ_HEADERS=['notificationId','userId','readAt'];
const NOTIF_CLEANUP_DELAY_MS=24*60*60*1000;
const ONESIGNAL_APP_ID='64cb7fb2-efb3-4008-9233-5a305d0f31a2';
const ONESIGNAL_API_URL='https://api.onesignal.com/notifications';
const ONESIGNAL_API_KEY_PROP='ONESIGNAL_API_KEY';

function notifSheet_(){const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(NOTIF_SHEET);if(!sh){sh=ss.insertSheet(NOTIF_SHEET);sh.appendRow(NOTIF_HEADERS)}return sh}
function notifReadSheet_(){const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(NOTIF_READ_SHEET);if(!sh){sh=ss.insertSheet(NOTIF_READ_SHEET);sh.appendRow(NOTIF_READ_HEADERS)}return sh}
function notifUser_(userId){return listUsers_().find(u=>String(u.id)===String(userId)&&u.active)||null}
function notifCsv_(v){return Array.isArray(v)?v.map(String).filter(Boolean):String(v||'').split(',').map(x=>x.trim()).filter(Boolean)}
function notifKey_(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'')}
function notificationVisibleForUser_(n,u){
  const ids=notifCsv_(n.targetUsers).map(String),perms=notifCsv_(n.targetPermissions).map(notifKey_).filter(Boolean);
  if(ids.includes('*')||ids.includes(String(u.id)))return true;
  if(perms.includes('*'))return true;
  const up=(u.permissions||[]).map(notifKey_).filter(Boolean);
  if(perms.some(p=>up.includes(p)))return true;
  const role=notifKey_(u.role),fn=notifKey_(u.function),username=notifKey_(u.username);
  if(perms.includes('superadmin')&&(role.includes('superadmin')||fn.includes('superadmin')||username==='superadmin'))return true;
  return false;
}
function resolveNotificationTargetUsers_(o){
  o=o||{};
  const explicit=notifCsv_(o.targetUsers).map(String);
  if(explicit.includes('*'))return ['*'];
  const perms=notifCsv_(o.targetPermissions).map(notifKey_).filter(Boolean);
  if(!perms.length)return Array.from(new Set(explicit));
  const ids=listUsers_().filter(u=>u.active&&notificationVisibleForUser_({targetUsers:explicit,targetPermissions:perms},u)).map(u=>String(u.id));
  return Array.from(new Set(explicit.concat(ids)));
}
function oneSignalApiKey_(){return String(PropertiesService.getScriptProperties().getProperty(ONESIGNAL_API_KEY_PROP)||'').trim()}
function oneSignalRecipients_(n){return notificationRecipients_(n).map(u=>String(u.id)).filter(Boolean)}
function sendOneSignalPush_(n){
  n=n||{};
  const apiKey=oneSignalApiKey_();
  if(!apiKey)return{ok:false,configured:false,error:'ONESIGNAL_API_KEY manquante dans les propriétés du script'};
  const recipients=oneSignalRecipients_(n);
  if(!recipients.length)return{ok:false,configured:true,error:'Aucun destinataire actif'};
  const data=Object.assign({},n.data||{},{notificationId:String(n.id||''),type:String(n.type||'info')});
  const payload={
    app_id:ONESIGNAL_APP_ID,
    target_channel:'push',
    include_aliases:{external_id:recipients},
    headings:{fr:String(n.title||'Notification'),en:String(n.title||'Notification')},
    contents:{fr:String(n.message||''),en:String(n.message||'')},
    data:data,
    url:(typeof APP_URL!=='undefined'&&APP_URL)?APP_URL:'https://shbassinchateaulin.github.io/horticulture-app/'
  };
  try{
    const r=UrlFetchApp.fetch(ONESIGNAL_API_URL,{method:'post',contentType:'application/json',headers:{Authorization:'Key '+apiKey},payload:JSON.stringify(payload),muteHttpExceptions:true});
    const code=r.getResponseCode(),text=r.getContentText();let body={};try{body=JSON.parse(text||'{}')}catch(_){body={raw:text}}
    if(code<200||code>=300)return{ok:false,configured:true,httpCode:code,error:String(body.errors||body.error||text||'Erreur OneSignal'),response:body,recipients:recipients};
    if(!body.id)return{ok:false,configured:true,httpCode:code,error:'OneSignal n’a trouvé aucun abonnement push valide pour ces destinataires.',response:body,recipients:recipients};
    return{ok:true,configured:true,httpCode:code,oneSignalId:String(body.id),recipients:recipients};
  }catch(e){return{ok:false,configured:true,error:String(e&&e.message?e.message:e),recipients:recipients}}
}
function createNotification_(o){
  o=o||{};
  const id=Utilities.getUuid(),created=new Date().toISOString();
  const targetUsers=resolveNotificationTargetUsers_(o);
  const targetPermissions=notifCsv_(o.targetPermissions);
  const data=o.data||{};
  notifSheet_().appendRow([id,String(o.type||'info'),String(o.title||'Notification'),String(o.message||''),targetUsers.join(','),targetPermissions.join(','),created,String(o.expiresAt||''),JSON.stringify(data)]);
  const push=sendOneSignalPush_({id:id,type:String(o.type||'info'),title:String(o.title||'Notification'),message:String(o.message||''),targetUsers:targetUsers.join(','),targetPermissions:targetPermissions.join(','),data:data});
  return{ok:true,id:id,createdAt:created,targetUsers:targetUsers,push:push};
}
function listNotificationsForUser_(userId){cleanupNotifications_();const u=notifUser_(userId);if(!u)return{ok:false,error:'Utilisateur introuvable ou inactif'};const sh=notifSheet_(),rows=sh.getLastRow()<2?[]:sh.getDataRange().getValues().slice(1),readSh=notifReadSheet_(),reads=readSh.getLastRow()<2?[]:readSh.getDataRange().getValues().slice(1),readMap={};reads.forEach(r=>{if(String(r[1])===String(userId))readMap[String(r[0])]=String(r[2]||'')});const now=Date.now(),notifications=rows.filter(r=>r[0]).map(r=>({id:String(r[0]),type:String(r[1]||'info'),title:String(r[2]||''),message:String(r[3]||''),targetUsers:String(r[4]||''),targetPermissions:String(r[5]||''),createdAt:String(r[6]||''),expiresAt:String(r[7]||''),data:String(r[8]||'')})).filter(n=>(!n.expiresAt||Date.parse(n.expiresAt)>now)&&notificationVisibleForUser_(n,u)).map(n=>{let data={};try{data=JSON.parse(n.data||'{}')}catch{}return{id:n.id,type:n.type,title:n.title,message:n.message,createdAt:n.createdAt,data:data,read:!!readMap[n.id],readAt:readMap[n.id]||''}}).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));return{ok:true,notifications:notifications}}
function markNotificationRead_(notificationId,userId){const u=notifUser_(userId);if(!u)return{ok:false,error:'Utilisateur introuvable ou inactif'};const visible=listNotificationsForUser_(userId);if(!visible.ok||!visible.notifications.some(n=>n.id===String(notificationId)))return{ok:false,error:'Notification inaccessible'};const sh=notifReadSheet_(),v=sh.getLastRow()<2?[]:sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(String(v[i][0])===String(notificationId)&&String(v[i][1])===String(userId)){const at=new Date().toISOString();sh.getRange(i+1,3).setValue(at);return{ok:true,readAt:at}}const at=new Date().toISOString();sh.appendRow([String(notificationId),String(userId),at]);return{ok:true,readAt:at}}
function markAllNotificationsRead_(userId){const r=listNotificationsForUser_(userId);if(!r.ok)return r;r.notifications.filter(n=>!n.read).forEach(n=>markNotificationRead_(n.id,userId));return{ok:true}}
function createNotificationTest_(userId){const u=notifUser_(userId);if(!u)return{ok:false,error:'Utilisateur introuvable'};return createNotification_({type:'test',title:'Notification de test',message:'Cette notification est synchronisée sur tous les appareils connectés avec votre compte.',targetUsers:[u.id],data:{test:true}})}

// Retourne les utilisateurs actifs qui sont réellement destinataires d'une notification.
function notificationRecipients_(n){return listUsers_().filter(u=>u.active&&notificationVisibleForUser_(n,u))}

// Diagnostic manuel utile après avoir ajouté ONESIGNAL_API_KEY aux propriétés du script.
function testerPushOneSignal_(userId){
  const u=notifUser_(userId);if(!u)return{ok:false,error:'Utilisateur introuvable'};
  return createNotification_({type:'test',title:'Test des notifications',message:'Si vous voyez ce message, les notifications push OneSignal fonctionnent.',targetUsers:[u.id],data:{test:true,source:'Apps Script'}});
}
function diagnosticOneSignal_(){return{ok:true,appId:ONESIGNAL_APP_ID,apiKeyConfigured:!!oneSignalApiKey_()}}

// Supprime une notification 24 h après que TOUS ses destinataires l'ont lue.
// Supprime en même temps ses lignes dans « Notifications lectures ».
function cleanupNotifications_(){
  const sh=notifSheet_(),readSh=notifReadSheet_();
  if(sh.getLastRow()<2)return{ok:true,deleted:0};
  const rows=sh.getDataRange().getValues();
  const readRows=readSh.getLastRow()<2?[]:readSh.getDataRange().getValues();
  const readsByNotif={};
  for(let i=1;i<readRows.length;i++){
    const nid=String(readRows[i][0]||''),uid=String(readRows[i][1]||''),at=String(readRows[i][2]||'');
    if(!nid||!uid||!at)continue;
    if(!readsByNotif[nid])readsByNotif[nid]={};
    readsByNotif[nid][uid]=at;
  }
  const now=Date.now(),deleteIds=[];
  for(let i=1;i<rows.length;i++){
    if(!rows[i][0])continue;
    const n={id:String(rows[i][0]),targetUsers:String(rows[i][4]||''),targetPermissions:String(rows[i][5]||'')};
    const recipients=notificationRecipients_(n);
    if(!recipients.length)continue;
    const map=readsByNotif[n.id]||{};
    if(!recipients.every(u=>!!map[String(u.id)]))continue;
    const lastRead=Math.max.apply(null,recipients.map(u=>Date.parse(map[String(u.id)])||0));
    if(lastRead&&now-lastRead>=NOTIF_CLEANUP_DELAY_MS)deleteIds.push(n.id);
  }
  if(!deleteIds.length)return{ok:true,deleted:0};
  const set=new Set(deleteIds);
  for(let i=sh.getLastRow();i>=2;i--)if(set.has(String(sh.getRange(i,1).getValue())))sh.deleteRow(i);
  for(let i=readSh.getLastRow();i>=2;i--)if(set.has(String(readSh.getRange(i,1).getValue())))readSh.deleteRow(i);
  return{ok:true,deleted:deleteIds.length};
}

// À utiliser avec un déclencheur Apps Script horaire si souhaité.
// Le nettoyage est aussi lancé automatiquement lorsqu'un utilisateur récupère ses notifications.
function nettoyerAnciennesNotifications(){return cleanupNotifications_()}
