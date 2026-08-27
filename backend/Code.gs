const SHEET_NAME = 'Utilisateurs';
const HEADERS = ['id','firstName','lastName','email','function','role','username','passwordHash','firstLogin','active','permissions','updatedAt'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}
function json_(obj){return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON)}
function doGet(e){
  const action=(e.parameter.action||'listUsers');
  if(action==='listUsers') return json_({ok:true,users:listUsers_()});
  return json_({ok:false,error:'Action inconnue'});
}
function doPost(e){
  try{
    const body=JSON.parse(e.postData.contents||'{}');
    if(body.action==='createUser') return json_(createUser_(body.user||{}));
    if(body.action==='updateUser') return json_(updateUser_(body.user||{}));
    if(body.action==='deleteUser') return json_(deleteUser_(body.id));
    if(body.action==='saveUsers'){ saveUsers_(body.users||[]); return json_({ok:true}); }
    return json_({ok:false,error:'Action inconnue'});
  }catch(err){return json_({ok:false,error:String(err)})}
}
function listUsers_(){
  const sh=getSheet_(),v=sh.getDataRange().getValues();
  if(v.length<2)return [];
  return v.slice(1).filter(r=>r[0]).map(rowToUser_);
}
function rowToUser_(r){return {id:String(r[0]),firstName:String(r[1]||''),lastName:String(r[2]||''),email:String(r[3]||''),function:String(r[4]||''),role:String(r[5]||''),username:String(r[6]||''),passwordHash:String(r[7]||''),firstLogin:String(r[8]).toLowerCase()==='true',active:String(r[9]).toLowerCase()!=='false',permissions:String(r[10]||'').split(',').filter(Boolean),updatedAt:String(r[11]||'')}}
function userRow_(u){return [u.id||'',u.firstName||'',u.lastName||'',u.email||'',u.function||'',u.role||'',u.username||'',u.passwordHash||'',!!u.firstLogin,u.active!==false,(u.permissions||[]).join(','),new Date().toISOString()]}
function createUser_(u){
  if(!u.id||!u.username)return {ok:false,error:'Utilisateur incomplet'};
  const users=listUsers_();
  if(users.some(x=>x.id===u.id||x.username.toLowerCase()===String(u.username).toLowerCase()))return {ok:false,error:'Cet utilisateur existe déjà'};
  getSheet_().appendRow(userRow_(u));
  return {ok:true,user:u};
}
function updateUser_(u){
  if(!u.id)return {ok:false,error:'ID manquant'};
  const sh=getSheet_(),v=sh.getDataRange().getValues();
  for(let i=1;i<v.length;i++)if(String(v[i][0])===String(u.id)){sh.getRange(i+1,1,1,HEADERS.length).setValues([userRow_(u)]);return {ok:true,user:u}}
  return {ok:false,error:'Utilisateur introuvable'};
}
function deleteUser_(id){
  if(!id)return {ok:false,error:'ID manquant'};
  const sh=getSheet_(),v=sh.getDataRange().getValues();
  for(let i=v.length-1;i>=1;i--)if(String(v[i][0])===String(id)){sh.deleteRow(i+1);return {ok:true}}
  return {ok:false,error:'Utilisateur introuvable'};
}
function saveUsers_(users){
  const sh=getSheet_(),rows=users.map(userRow_);sh.clearContents();sh.appendRow(HEADERS);if(rows.length)sh.getRange(2,1,rows.length,HEADERS.length).setValues(rows);
}
