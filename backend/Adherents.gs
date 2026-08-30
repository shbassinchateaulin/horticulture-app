// Adherents.gs — base centrale des adhérents
// Le classeur est créé par l'utilisateur ; les onglets et colonnes sont créés automatiquement.

const ADHERENTS_SPREADSHEET_ID='1Sme1ajR9SCTGPgc7mBvgZqkDAIjDjYlL_DajFdbn9ZY';
const ADHERENTS_SHEET='Adhérents';
const ADHERENTS_HEADERS=[
  'id','firstName','lastName','email','phone','status','source','dateAdhesion',
  'season','active','helloassoId','notes','updatedAt'
];
const ADHERENTS_IMPORTS_SHEET='Imports adhérents';
const ADHERENTS_IMPORTS_HEADERS=['id','source','importedAt','rows','created','updated','ignored','detail'];

function adherentsDb_(){return SpreadsheetApp.openById(ADHERENTS_SPREADSHEET_ID)}
function adherentsSheet_(name,headers){
  const ss=adherentsDb_();
  let sh=ss.getSheetByName(name);
  if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0){
    sh.getRange(1,1,1,headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }else{
    const width=Math.max(headers.length,sh.getLastColumn());
    const current=sh.getRange(1,1,1,width).getValues()[0];
    headers.forEach((h,i)=>{if(String(current[i]||'')!==h)sh.getRange(1,i+1).setValue(h)});
  }
  return sh;
}
function adherentsMainSheet_(){return adherentsSheet_(ADHERENTS_SHEET,ADHERENTS_HEADERS)}
function adherentsImportsSheet_(){return adherentsSheet_(ADHERENTS_IMPORTS_SHEET,ADHERENTS_IMPORTS_HEADERS)}
function adherentsEnsureDb_(){
  adherentsMainSheet_();
  adherentsImportsSheet_();
  return adherentsDb_();
}
function adherentBool_(v,defaultValue){
  if(v===true||String(v).toLowerCase()==='true'||String(v)==='1')return true;
  if(v===false||String(v).toLowerCase()==='false'||String(v)==='0')return false;
  return defaultValue;
}
function adherentFromRow_(r){
  return{
    id:String(r[0]||''),firstName:String(r[1]||''),lastName:String(r[2]||''),
    email:String(r[3]||'').trim().toLowerCase(),phone:String(r[4]||''),
    status:String(r[5]||'Adhérent'),source:String(r[6]||'Manuel'),dateAdhesion:String(r[7]||''),
    season:String(r[8]||''),active:adherentBool_(r[9],true),helloassoId:String(r[10]||''),
    notes:String(r[11]||''),updatedAt:String(r[12]||'')
  };
}
function listAdherents_(){
  const sh=adherentsMainSheet_();
  if(sh.getLastRow()<2)return[];
  return sh.getRange(2,1,sh.getLastRow()-1,ADHERENTS_HEADERS.length).getValues()
    .filter(r=>r[0]||r[1]||r[2]||r[3]).map(adherentFromRow_);
}
function activeAdherents_(){return listAdherents_().filter(a=>a.active)}
function normaliseAdherent_(a){
  a=a||{};
  return{
    id:String(a.id||Utilities.getUuid()),firstName:String(a.firstName||a.prenom||'').trim(),
    lastName:String(a.lastName||a.nom||'').trim(),email:String(a.email||'').trim().toLowerCase(),
    phone:String(a.phone||a.telephone||'').trim(),status:String(a.status||a.statut||'Adhérent').trim(),
    source:String(a.source||'Manuel').trim(),dateAdhesion:String(a.dateAdhesion||''),
    season:String(a.season||a.saison||''),active:a.active!==false,
    helloassoId:String(a.helloassoId||''),notes:String(a.notes||''),updatedAt:new Date().toISOString()
  };
}
function adherentRow_(a){return[
  a.id,a.firstName,a.lastName,a.email,a.phone,a.status,a.source,a.dateAdhesion,
  a.season,a.active,a.helloassoId,a.notes,a.updatedAt
]}
function upsertAdherent_(data){
  const a=normaliseAdherent_(data),sh=adherentsMainSheet_();
  const rows=sh.getLastRow()<2?[]:sh.getRange(2,1,sh.getLastRow()-1,ADHERENTS_HEADERS.length).getValues();
  let index=-1;
  for(let i=0;i<rows.length;i++){
    const r=adherentFromRow_(rows[i]);
    if(a.id&&r.id===a.id){index=i;break}
    if(a.helloassoId&&r.helloassoId&&r.helloassoId===a.helloassoId){index=i;break}
    if(a.email&&r.email&&r.email===a.email&&String(r.firstName).toLowerCase()===String(a.firstName).toLowerCase()&&String(r.lastName).toLowerCase()===String(a.lastName).toLowerCase()){index=i;break}
  }
  if(index>=0){
    const old=adherentFromRow_(rows[index]);
    a.id=old.id||a.id;
    if(!a.helloassoId)a.helloassoId=old.helloassoId;
    sh.getRange(index+2,1,1,ADHERENTS_HEADERS.length).setValues([adherentRow_(a)]);
    return{ok:true,created:false,adherent:a};
  }
  sh.appendRow(adherentRow_(a));
  return{ok:true,created:true,adherent:a};
}
function initialiserBaseAdherents(){
  const ss=adherentsEnsureDb_();
  return 'Base adhérents prête : '+ss.getName()+' — '+ss.getUrl();
}
