// Documents.gs — stockage partagé des documents générés dans Google Drive.
const DOC_ROOT_PROP='DOCUMENTS_ROOT_FOLDER_ID';
const DOC_INDEX_SHEET='Documents Cloud';
const DOC_HEADERS=['key','driveId','name','folder','mimeType','size','updatedAt','createdAt','createdBy','source','permission'];

function docsAuth_(userId,generation){
  userId=String(userId||'').trim();generation=String(generation||'').trim();
  if(!userId||!generation)return {ok:false,error:'Session manquante.'};
  const u=listUsers_().find(x=>String(x.id)===userId&&x.active);
  if(!u)return {ok:false,error:'Utilisateur introuvable.'};
  const server=sessionGeneration_(userId);
  if(!server||server!==generation)return {ok:false,error:'Session expirée.',sessionExpired:true};
  return {ok:true,user:u};
}
function docsNorm_(v){return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')}
function docsSuper_(u){return [u&&u.username,u&&u.role,u&&u.function].map(docsNorm_).some(v=>v==='superadmin'||v==='super_admin')}
function docsFolderPermission_(folder){const f=docsNorm_(folder);if(f.indexOf('consultation')>=0&&f.indexOf('ag')>=0)return'consultation_ag';if(f.indexOf('sortie')>=0)return'sorties';if(f.indexOf('adherent')>=0)return'adherents';if(f.indexOf('suggestion')>=0)return'suggestions';return''}
function docsAllowed_(u,p){if(docsSuper_(u))return true;p=docsNorm_(p);if(!p)return true;const have=(Array.isArray(u&&u.permissions)?u.permissions:[]).map(docsNorm_);const aliases={consultation_ag:['consultation_ag','ag'],sorties:['sorties','sortie','paiement_sorties','paiements_sorties'],adherents:['adherents','adherent','gestion_adherents'],suggestions:['suggestions','suggestion']};return (aliases[p]||[p]).some(x=>have.indexOf(x)>=0)}

function docsSheet_(){const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(DOC_INDEX_SHEET);if(!sh)sh=ss.insertSheet(DOC_INDEX_SHEET);if(sh.getLastRow()===0)sh.appendRow(DOC_HEADERS);else DOC_HEADERS.forEach((h,i)=>{if(String(sh.getRange(1,i+1).getValue()||'')!==h)sh.getRange(1,i+1).setValue(h)});return sh}
function docsRoot_(){const p=PropertiesService.getScriptProperties();let id=p.getProperty(DOC_ROOT_PROP),f=null;if(id){try{f=DriveApp.getFolderById(id)}catch(_){}}if(!f){f=DriveApp.createFolder('Horticulture - Documents');p.setProperty(DOC_ROOT_PROP,f.getId())}return f}
function docsFolder_(path){let cur=docsRoot_();String(path||'Documents générés').split('/').filter(Boolean).forEach(name=>{const it=cur.getFoldersByName(name);cur=it.hasNext()?it.next():cur.createFolder(name)});return cur}
function docsRows_(){const sh=docsSheet_();if(sh.getLastRow()<2)return[];return sh.getRange(2,1,sh.getLastRow()-1,DOC_HEADERS.length).getValues()}
function docsObj_(r){const folder=String(r[3]||'');return{key:String(r[0]),driveId:String(r[1]),name:String(r[2]),folder:folder,mimeType:String(r[4]),size:Number(r[5]||0),updatedAt:String(r[6]),createdAt:String(r[7]),createdBy:String(r[8]),source:String(r[9]),permission:String(r[10]||'')||docsFolderPermission_(folder)}}
function docsList_(userId,generation){const a=docsAuth_(userId,generation);if(!a.ok)return a;return{ok:true,documents:docsRows_().filter(r=>r[0]).map(docsObj_).filter(d=>docsAllowed_(a.user,d.permission))}}

function docsUpsert_(b){
  const a=docsAuth_(b.userId,b.generation);if(!a.ok)return a;
  const key=String(b.key||'').trim();if(!key)return{ok:false,error:'Clé document manquante.'};
  const bytes=Utilities.base64Decode(String(b.base64||'')),mime=String(b.mimeType||'application/octet-stream'),name=String(b.name||'Document'),folder=String(b.folder||'Documents générés'),permission=docsNorm_(b.permission||docsFolderPermission_(folder));
  if(!docsAllowed_(a.user,permission))return{ok:false,error:'Accès refusé pour cette catégorie.'};
  const sh=docsSheet_(),rows=docsRows_();let row=-1,oldId='';for(let i=0;i<rows.length;i++)if(String(rows[i][0])===key){row=i+2;oldId=String(rows[i][1]||'');break}
  const file=docsFolder_(folder).createFile(Utilities.newBlob(bytes,mime,name));if(oldId){try{DriveApp.getFileById(oldId).setTrashed(true)}catch(_){}}
  const now=new Date().toISOString(),created=row?String(sh.getRange(row,8).getValue()||now):now,data=[key,file.getId(),name,folder,mime,bytes.length,now,created,String(a.user.id||''),String(b.source||'Application'),permission];
  if(row)sh.getRange(row,1,1,DOC_HEADERS.length).setValues([data]);else sh.appendRow(data);return{ok:true,document:docsObj_(data),deduplicated:!!row};
}
function docsDownload_(b){const a=docsAuth_(b.userId,b.generation);if(!a.ok)return a;const r=docsRows_().find(x=>String(x[0])===String(b.key||''));if(!r)return{ok:false,error:'Document introuvable.'};const d=docsObj_(r);if(!docsAllowed_(a.user,d.permission))return{ok:false,error:'Accès refusé pour ce document.'};try{const f=DriveApp.getFileById(d.driveId),blob=f.getBlob();return{ok:true,name:d.name,mimeType:d.mimeType||blob.getContentType(),base64:Utilities.base64Encode(blob.getBytes())}}catch(e){return{ok:false,error:String(e)}}}
function docsRoutePost_(b){if(b.action==='listDocumentsCloud')return docsList_(b.userId||'',b.generation||'');if(b.action==='upsertDocumentCloud')return docsUpsert_(b);if(b.action==='downloadDocumentCloud')return docsDownload_(b);return null}
function initialiserDocumentsCloud(){docsRoot_();docsSheet_();['Documents générés/Consultations AG','Documents générés/Sorties','Documents générés/Adhérents','Documents générés/Autres','Fichiers'].forEach(docsFolder_);return'Documents Cloud prêt.'}
