// Notifications.gs — notifications individuelles synchronisées entre appareils
// Ce fichier appartient au même projet Apps Script que Code.gs.

const NOTIF_SHEET='Notifications';
const NOTIF_HEADERS=['id','type','title','message','targetUsers','targetPermissions','createdAt','expiresAt','data'];
const NOTIF_READ_SHEET='Notifications lectures';
const NOTIF_READ_HEADERS=['notificationId','userId','readAt'];
const NOTIF_CLEANUP_DELAY_MS=24*60*60*1000;

function notifSheet_(){const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(NOTIF_SHEET);if(!sh){sh=ss.insertSheet(NOTIF_SHEET);sh.appendRow(NOTIF_HEADERS)}return sh}
function notifReadSheet_(){const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(NOTIF_READ_SHEET);if(!sh){sh=ss.insertSheet(NOTIF_READ_SHEET);sh.appendRow(NOTIF_READ_HEADERS)}return sh}
function notifUser_(userId){return listUsers_().find(u=>String(u.id)===String(userId)&&u.active)||null}
function notifCsv_(v){return Array.isArray(v)?v.map(String).filter(Boolean):String(v||'').split(',').map(x=>x.trim()).filter(Boolean)}
function notificationVisibleForUser_(n,u){const ids=notifCsv_(n.targetUsers),perms=notifCsv_(n.targetPermissions);if(ids.includes('*')||ids.includes(String(u.id)))return true;if(perms.includes('*'))return true;const up=(u.permissions||[]).map(String);if(perms.some(p=>up.includes(p)))return true;const role=String(u.role||'').toLowerCase().replace(/[^a-z]/g,''),fn=String(u.function||'').toLowerCase().replace(/[^a-z]/g,'');if(perms.includes('superadmin')&&(role.includes('superadmin')||fn.includes('superadmin')||String(u.username||'').toLowerCase()==='superadmin'))return true;return false}
function createNotification_(o){o=o||{};const id=Utilities.getUuid(),created=new Date().toISOString();notifSheet_().appendRow([id,String(o.type||'info'),String(o.title||'Notification'),String(o.message||''),notifCsv_(o.targetUsers).join(','),notifCsv_(o.targetPermissions).join(','),created,String(o.expiresAt||''),JSON.stringify(o.data||{})]);return{ok:true,id:id,createdAt:created}}
function listNotificationsForUser_(userId){cleanupNotifications_();const u=notifUser_(userId);if(!u)return{ok:false,error:'Utilisateur introuvable ou inactif'};const sh=notifSheet_(),rows=sh.getLastRow()<2?[]:sh.getDataRange().getValues().slice(1),readSh=notifReadSheet_(),reads=readSh.getLastRow()<2?[]:readSh.getDataRange().getValues().slice(1),readMap={};reads.forEach(r=>{if(String(r[1])===String(userId))readMap[String(r[0])]=String(r[2]||'')});const now=Date.now(),notifications=rows.filter(r=>r[0]).map(r=>({id:String(r[0]),type:String(r[1]||'info'),title:String(r[2]||''),message:String(r[3]||''),targetUsers:String(r[4]||''),targetPermissions:String(r[5]||''),createdAt:String(r[6]||''),expiresAt:String(r[7]||''),data:String(r[8]||'')})).filter(n=>(!n.expiresAt||Date.parse(n.expiresAt)>now)&&notificationVisibleForUser_(n,u)).map(n=>{let data={};try{data=JSON.parse(n.data||'{}')}catch{}return{id:n.id,type:n.type,title:n.title,message:n.message,createdAt:n.createdAt,data:data,read:!!readMap[n.id],readAt:readMap[n.id]||''}}).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));return{ok:true,notifications:notifications}}
function markNotificationRead_(notificationId,userId){const u=notifUser_(userId);if(!u)return{ok:false,error:'Utilisateur introuvable ou inactif'};const visible=listNotificationsForUser_(userId);if(!visible.ok||!visible.notifications.some(n=>n.id===String(notificationId)))return{ok:false,error:'Notification inaccessible'};const sh=notifReadSheet_(),v=sh.getLastRow()<2?[]:sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(String(v[i][0])===String(notificationId)&&String(v[i][1])===String(userId)){const at=new Date().toISOString();sh.getRange(i+1,3).setValue(at);return{ok:true,readAt:at}}const at=new Date().toISOString();sh.appendRow([String(notificationId),String(userId),at]);return{ok:true,readAt:at}}
function markAllNotificationsRead_(userId){const r=listNotificationsForUser_(userId);if(!r.ok)return r;r.notifications.filter(n=>!n.read).forEach(n=>markNotificationRead_(n.id,userId));return{ok:true}}
function createNotificationTest_(userId){const u=notifUser_(userId);if(!u)return{ok:false,error:'Utilisateur introuvable'};return createNotification_({type:'test',title:'Notification de test',message:'Cette notification est synchronisée sur tous les appareils connectés avec votre compte.',targetUsers:[u.id],data:{test:true}})}

// Retourne les utilisateurs actifs qui sont réellement destinataires d'une notification.
function notificationRecipients_(n){return listUsers_().filter(u=>u.active&&notificationVisibleForUser_(n,u))}

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
