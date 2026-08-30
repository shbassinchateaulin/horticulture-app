// AdherentsAdmin.gs — API de gestion de la page Adhérents
// S'appuie sur la base définie dans Adherents.gs et conserve toutes les saisons dans Google Sheets.

function adherentsAdminSeason_(){
  const d=new Date(),y=d.getFullYear(),m=d.getMonth();
  // La saison associative bascule le 1er novembre :
  // 01/11/2025 -> 31/10/2026 = 2025-2026, etc.
  const start=m>=10?y:y-1;
  return start+'-'+(start+1);
}
function adherentsAdminHeaders_(){
  const sh=adherentsMainSheet_();
  const required=['id','firstName','lastName','email','phone','status','source','dateAdhesion','season','active','helloassoId','notes','updatedAt','address'];
  let headers=sh.getLastColumn()?sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String):[];
  required.forEach(h=>{if(!headers.includes(h)){sh.getRange(1,headers.length+1).setValue(h);headers.push(h)}});
  sh.setFrozenRows(1);
  return headers;
}
function adherentsAdminObj_(headers,row){
  const o={};headers.forEach((h,i)=>o[h]=row[i] instanceof Date?Utilities.formatDate(row[i],Session.getScriptTimeZone()||'Europe/Paris','yyyy-MM-dd'):row[i]);
  return{
    id:String(o.id||''),firstName:String(o.firstName||''),lastName:String(o.lastName||''),
    email:String(o.email||''),phone:String(o.phone||''),address:String(o.address||''),
    status:String(o.status||'Adhérent'),source:String(o.source||'Manuel'),dateAdhesion:String(o.dateAdhesion||''),
    season:String(o.season||''),active:adherentBool_(o.active,true),helloassoId:String(o.helloassoId||''),
    notes:String(o.notes||''),updatedAt:String(o.updatedAt||'')
  };
}
function adherentsAdminAll_(){
  const sh=adherentsMainSheet_(),headers=adherentsAdminHeaders_();
  if(sh.getLastRow()<2)return[];
  return sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues()
    .filter(r=>r.some(v=>String(v||'').trim()))
    .map(r=>adherentsAdminObj_(headers,r));
}
function adherentsAdminList_(){
  const rows=adherentsAdminAll_();
  const seasons=[...new Set(rows.map(r=>r.season).filter(Boolean))].sort().reverse();
  return{ok:true,adherents:rows,seasons:seasons,currentSeason:adherentsAdminSeason_(),updatedAt:new Date().toISOString()};
}
function adherentsAdminNormalise_(a){
  a=a||{};
  return{
    id:String(a.id||'').trim(),firstName:String(a.firstName||a.prenom||'').trim(),lastName:String(a.lastName||a.nom||'').trim(),
    email:String(a.email||'').trim().toLowerCase(),phone:String(a.phone||a.telephone||'').trim(),address:String(a.address||a.adresse||'').trim(),
    status:String(a.status||a.statut||'Adhérent').trim(),source:String(a.source||a.origine||'Manuel').trim()||'Manuel',
    dateAdhesion:String(a.dateAdhesion||a.date||new Date().toISOString().slice(0,10)).trim(),season:String(a.season||a.saison||adherentsAdminSeason_()).trim(),
    active:a.active!==false,helloassoId:String(a.helloassoId||'').trim(),notes:String(a.notes||'').trim(),updatedAt:new Date().toISOString()
  };
}
function adherentsAdminSave_(data){
  const a=adherentsAdminNormalise_(data);
  if(!a.firstName||!a.lastName)return{ok:false,error:'Le nom et le prénom sont obligatoires.'};
  const sh=adherentsMainSheet_(),headers=adherentsAdminHeaders_();
  const values=sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues();
  const objs=values.map(r=>adherentsAdminObj_(headers,r));
  let index=-1;
  for(let i=0;i<objs.length;i++){
    const r=objs[i];
    if(a.id&&r.id===a.id){index=i;break}
    if(a.helloassoId&&r.helloassoId===a.helloassoId&&r.season===a.season){index=i;break}
    if(r.season===a.season&&r.firstName.toLowerCase()===a.firstName.toLowerCase()&&r.lastName.toLowerCase()===a.lastName.toLowerCase()&&(!a.email||!r.email||r.email.toLowerCase()===a.email.toLowerCase())){index=i;break}
  }
  if(index>=0)a.id=objs[index].id||a.id;
  if(!a.id)a.id=Utilities.getUuid();
  const row=headers.map(h=>h==='active'?a.active:(a[h]!==undefined?a[h]:''));
  if(index>=0)sh.getRange(index+2,1,1,headers.length).setValues([row]);else sh.appendRow(row);
  return{ok:true,created:index<0,adherent:a};
}
function adherentsAdminArchive_(id,season){
  id=String(id||'');season=String(season||'');
  if(!id)return{ok:false,error:'Adhérent introuvable.'};
  const sh=adherentsMainSheet_(),headers=adherentsAdminHeaders_(),idCol=headers.indexOf('id'),seasonCol=headers.indexOf('season'),activeCol=headers.indexOf('active'),updatedCol=headers.indexOf('updatedAt');
  if(sh.getLastRow()<2)return{ok:false,error:'Adhérent introuvable.'};
  const v=sh.getRange(2,1,sh.getLastRow()-1,headers.length).getValues();
  for(let i=0;i<v.length;i++)if(String(v[i][idCol])===id&&(!season||String(v[i][seasonCol])===season)){
    sh.getRange(i+2,activeCol+1).setValue(false);if(updatedCol>=0)sh.getRange(i+2,updatedCol+1).setValue(new Date().toISOString());
    return{ok:true};
  }
  return{ok:false,error:'Adhérent introuvable.'};
}
function adherentsAdminImport_(rows,season){
  if(rows&& !Array.isArray(rows) && rows._aiPayload){
    const x=adherentsAnalyzeImportAI_(rows._aiPayload||{});
    if(!x.ok)return x;
    return{ok:true,analysis:true,adherents:x.adherents||[],warnings:x.warnings||[],model:x.model||''};
  }
  rows=Array.isArray(rows)?rows:[];let created=0,updated=0,ignored=0,errors=[];
  rows.forEach((r,i)=>{try{r=r||{};r.season=r.season||season||adherentsAdminSeason_();const x=adherentsAdminSave_(r);if(!x.ok){ignored++;errors.push('Ligne '+(i+2)+' : '+x.error)}else if(x.created)created++;else updated++}catch(e){ignored++;errors.push('Ligne '+(i+2)+' : '+e)}});
  try{const sh=adherentsImportsSheet_();sh.appendRow([Utilities.getUuid(),'Import application',new Date().toISOString(),rows.length,created,updated,ignored,errors.slice(0,10).join(' | ')])}catch(_){ }
  return{ok:true,rows:rows.length,created:created,updated:updated,ignored:ignored,errors:errors};
}
