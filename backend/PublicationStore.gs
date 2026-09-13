// PublicationStore.gs — stockage des publications publiques et des photos pour affichage dynamique dans Google Sites
const PUBLICATIONS_SHEET='Publications site';
const PUBLICATION_HEADERS=['id','type','title','text','date','location','helloassoUrl','pricingMode','memberPrice','nonMemberPrice','layout','images','publishedAt','updatedAt','active'];
function publicationSheet_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();let sh=ss.getSheetByName(PUBLICATIONS_SHEET);if(!sh)sh=ss.insertSheet(PUBLICATIONS_SHEET);
  if(sh.getLastRow()===0)sh.appendRow(PUBLICATION_HEADERS);else{const h=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),PUBLICATION_HEADERS.length)).getValues()[0];PUBLICATION_HEADERS.forEach((x,i)=>{if(String(h[i]||'')!==x)sh.getRange(1,i+1).setValue(x)})}
  return sh;
}
function publicationImageFolder_(){
  const p=PropertiesService.getScriptProperties();let id=p.getProperty('PUBLICATION_IMAGES_FOLDER_ID');
  if(id){try{return DriveApp.getFolderById(id)}catch(_){}}
  const f=DriveApp.createFolder('Horticulture - Publications site');p.setProperty('PUBLICATION_IMAGES_FOLDER_ID',f.getId());return f;
}
function publicationSaveImage_(dataUrl,name){
  dataUrl=String(dataUrl||'');if(!/^data:image\//i.test(dataUrl))return dataUrl;
  const m=dataUrl.match(/^data:([^;]+);base64,(.+)$/);if(!m)return'';
  const mime=m[1],bytes=Utilities.base64Decode(m[2]),ext=mime.indexOf('png')>=0?'png':'jpg';
  const blob=Utilities.newBlob(bytes,mime,(name||Utilities.getUuid())+'.'+ext),file=publicationImageFolder_().createFile(blob);
  try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW)}catch(_){}
  return 'https://drive.google.com/uc?export=view&id='+file.getId();
}
function publicationRowToObj_(r){let imgs=[];try{imgs=JSON.parse(String(r[11]||'[]'))||[]}catch(_){}return{id:String(r[0]||''),type:String(r[1]||'news'),title:String(r[2]||''),text:String(r[3]||''),date:String(r[4]||''),location:String(r[5]||''),helloassoUrl:String(r[6]||''),pricingMode:String(r[7]||''),memberPrice:Number(r[8]||0),nonMemberPrice:Number(r[9]||0),layout:String(r[10]||'editorial'),images:imgs,publishedAt:String(r[12]||''),updatedAt:String(r[13]||''),active:String(r[14]).toLowerCase()!=='false'} }
function publicationListPublic_(){const v=publicationSheet_().getDataRange().getValues();const rows=v.slice(1).filter(r=>r[0]&&String(r[14]).toLowerCase()!=='false').map(publicationRowToObj_);rows.sort((a,b)=>String(b.publishedAt||b.updatedAt).localeCompare(String(a.publishedAt||a.updatedAt)));return{ok:true,publications:rows}}
function publicationSavePublic_(p){
  p=p||{};const id=String(p.id||Utilities.getUuid()),sh=publicationSheet_(),v=sh.getDataRange().getValues();
  const images=(Array.isArray(p.images)?p.images:[]).slice(0,8).map((x,i)=>publicationSaveImage_(x,'publication-'+id+'-'+(i+1))).filter(Boolean);
  const now=new Date().toISOString(),row=[id,String(p.type||'news'),String(p.generatedTitle||p.title||''),String(p.generatedText||p.text||''),String(p.date||''),String(p.location||''),String(p.helloassoUrl||''),String(p.pricingMode||''),Number(p.memberPrice||0),Number(p.nonMemberPrice||0),String(p.layout||'editorial'),JSON.stringify(images),String(p.publishedAt||now),now,true];
  let target=0;for(let i=1;i<v.length;i++)if(String(v[i][0])===id){target=i+1;break}if(target)sh.getRange(target,1,1,row.length).setValues([row]);else sh.appendRow(row);
  return{ok:true,publication:publicationRowToObj_(row)};
}
function publicationDeletePublic_(id){const sh=publicationSheet_(),v=sh.getDataRange().getValues();for(let i=1;i<v.length;i++)if(String(v[i][0])===String(id)){sh.getRange(i+1,15).setValue(false);sh.getRange(i+1,14).setValue(new Date().toISOString());return{ok:true}}return{ok:false,error:'Publication introuvable'} }
