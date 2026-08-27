const SHEET_NAME = 'Utilisateurs';
const APP_URL = 'https://shbassinchateaulin.github.io/horticulture-app/';
const RESET_MINUTES = 30;
const HEADERS = ['id','firstName','lastName','email','function','role','username','passwordHash','firstLogin','active','permissions','updatedAt','phone','photo','resetTokenHash','resetExpiresAt'];

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
  } else {
    const current = sh.getRange(1,1,1,Math.max(sh.getLastColumn(),HEADERS.length)).getValues()[0];
    HEADERS.forEach((h,i)=>{ if (String(current[i]||'') !== h) sh.getRange(1,i+1).setValue(h); });
  }
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
    if(body.action==='requestPasswordReset') return json_(requestPasswordReset_(body.email||''));
    if(body.action==='resetPassword') return json_(resetPassword_(body.token||'',body.password||''));
    return json_({ok:false,error:'Action inconnue'});
  }catch(err){return json_({ok:false,error:String(err)})}
}
function listUsers_(){
  const sh=getSheet_(),v=sh.getDataRange().getValues();
  if(v.length<2)return [];
  return v.slice(1).filter(r=>r[0]).map(rowToUser_);
}
function rowToUser_(r){return {
  id:String(r[0]),firstName:String(r[1]||''),lastName:String(r[2]||''),email:String(r[3]||''),
  function:String(r[4]||''),role:String(r[5]||''),username:String(r[6]||''),passwordHash:String(r[7]||''),
  firstLogin:String(r[8]).toLowerCase()==='true',active:String(r[9]).toLowerCase()!=='false',
  permissions:String(r[10]||'').split(',').filter(Boolean),updatedAt:String(r[11]||''),
  phone:String(r[12]||''),photo:String(r[13]||'')
}}
function userRow_(u){return [
  u.id||'',u.firstName||'',u.lastName||'',u.email||'',u.function||'',u.role||'',u.username||'',u.passwordHash||'',
  !!u.firstLogin,u.active!==false,(u.permissions||[]).join(','),new Date().toISOString(),u.phone||'',u.photo||'',u.resetTokenHash||'',u.resetExpiresAt||''
]}
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
  for(let i=1;i<v.length;i++)if(String(v[i][0])===String(u.id)){
    // Conserve les champs techniques de réinitialisation lors d'une modification normale du profil.
    u.resetTokenHash=String(v[i][14]||'');u.resetExpiresAt=String(v[i][15]||'');
    sh.getRange(i+1,1,1,HEADERS.length).setValues([userRow_(u)]);return {ok:true,user:u}
  }
  return {ok:false,error:'Utilisateur introuvable'};
}
function deleteUser_(id){
  if(!id)return {ok:false,error:'ID manquant'};
  const sh=getSheet_(),v=sh.getDataRange().getValues();
  for(let i=v.length-1;i>=1;i--)if(String(v[i][0])===String(id)){sh.deleteRow(i+1);return {ok:true}}
  return {ok:false,error:'Utilisateur introuvable'};
}
function saveUsers_(users){
  const sh=getSheet_(),old=sh.getDataRange().getValues(),tokens={};
  for(let i=1;i<old.length;i++)tokens[String(old[i][0])]=[old[i][14]||'',old[i][15]||''];
  const rows=users.map(u=>{const t=tokens[String(u.id)]||['',''];u.resetTokenHash=String(t[0]||'');u.resetExpiresAt=String(t[1]||'');return userRow_(u)});
  sh.clearContents();sh.appendRow(HEADERS);if(rows.length)sh.getRange(2,1,rows.length,HEADERS.length).setValues(rows);
}
function sha256_(text){
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(text),Utilities.Charset.UTF_8).map(b=>(b<0?b+256:b).toString(16).padStart(2,'0')).join('');
}
function requestPasswordReset_(email){
  email=String(email||'').trim().toLowerCase();
  if(!email)return {ok:false,error:'Renseignez votre adresse e-mail.'};
  const sh=getSheet_(),v=sh.getDataRange().getValues();
  let row=-1;
  for(let i=1;i<v.length;i++)if(String(v[i][3]||'').trim().toLowerCase()===email){row=i;break}
  if(row<1)return {ok:false,code:'EMAIL_NOT_FOUND',error:"Cette adresse e-mail n’est reliée à aucun compte."};
  if(String(v[row][9]).toLowerCase()==='false')return {ok:false,error:'Ce compte a été résilié.'};
  const token=Utilities.getUuid()+Utilities.getUuid().replace(/-/g,'');
  const expires=new Date(Date.now()+RESET_MINUTES*60*1000).toISOString();
  sh.getRange(row+1,15).setValue(sha256_(token));
  sh.getRange(row+1,16).setValue(expires);
  const first=String(v[row][1]||'');
  const link=APP_URL+'?reset='+encodeURIComponent(token);
  const subject='Réinitialisation de votre mot de passe';
  const html='<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#173126"><h2 style="color:#07583f">Société d’Horticulture et d’Art Floral du Bassin de Châteaulin</h2><p>Bonjour '+escapeHtml_(first)+',</p><p>Vous avez demandé à modifier le mot de passe de votre espace d’administration.</p><p style="margin:28px 0"><a href="'+link+'" style="background:#08744f;color:white;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:bold">Modifier mon mot de passe</a></p><p>Ce lien est valable pendant '+RESET_MINUTES+' minutes et ne peut être utilisé qu’une seule fois.</p><p style="color:#6d7d75;font-size:13px">Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail.</p></div>';
  MailApp.sendEmail({to:email,subject:subject,body:'Bonjour '+first+',\n\nUtilisez ce lien pour modifier votre mot de passe :\n'+link+'\n\nCe lien est valable '+RESET_MINUTES+' minutes.\n\nSi vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.',htmlBody:html,name:"Société d’Horticulture du Bassin de Châteaulin"});
  return {ok:true,message:'Un lien de réinitialisation a été envoyé par e-mail.'};
}
function resetPassword_(token,password){
  token=String(token||'').trim();password=String(password||'');
  if(!token)return {ok:false,error:'Lien de réinitialisation invalide.'};
  if(password.length<8)return {ok:false,error:'Le mot de passe doit contenir au moins 8 caractères.'};
  const wanted=sha256_(token),sh=getSheet_(),v=sh.getDataRange().getValues();
  for(let i=1;i<v.length;i++){
    if(String(v[i][14]||'')===wanted){
      const expiry=Date.parse(String(v[i][15]||''));
      if(!expiry||Date.now()>expiry){sh.getRange(i+1,15,1,2).clearContent();return {ok:false,error:'Ce lien a expiré. Faites une nouvelle demande.'}}
      sh.getRange(i+1,8).setValue(sha256_(password));
      sh.getRange(i+1,9).setValue(false);
      sh.getRange(i+1,12).setValue(new Date().toISOString());
      sh.getRange(i+1,15,1,2).clearContent();
      return {ok:true,message:'Votre mot de passe a été modifié.'};
    }
  }
  return {ok:false,error:'Ce lien est invalide ou a déjà été utilisé.'};
}
function escapeHtml_(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
