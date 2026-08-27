const SHEET_NAME = 'Utilisateurs';

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(['id','firstName','lastName','email','function','role','username','passwordHash','firstLogin','active','permissions','updatedAt']);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = (e.parameter.action || 'listUsers');
  if (action === 'listUsers') return json_({ok:true, users:listUsers_()});
  return json_({ok:false,error:'Action inconnue'});
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    if (action === 'saveUsers') {
      saveUsers_(body.users || []);
      return json_({ok:true});
    }
    if (action === 'deleteUser') {
      deleteUser_(body.id);
      return json_({ok:true});
    }
    return json_({ok:false,error:'Action inconnue'});
  } catch (err) {
    return json_({ok:false,error:String(err)});
  }
}

function listUsers_() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  return values.slice(1).filter(r => r[0]).map(r => ({
    id:String(r[0]), firstName:String(r[1]||''), lastName:String(r[2]||''), email:String(r[3]||''),
    function:String(r[4]||''), role:String(r[5]||''), username:String(r[6]||''), passwordHash:String(r[7]||''),
    firstLogin:String(r[8]).toLowerCase()==='true', active:String(r[9]).toLowerCase()!=='false',
    permissions:String(r[10]||'').split(',').filter(Boolean), updatedAt:String(r[11]||'')
  }));
}

function saveUsers_(users) {
  const sh = getSheet_();
  const rows = users.map(u => [
    u.id||'',u.firstName||'',u.lastName||'',u.email||'',u.function||'',u.role||'',u.username||'',u.passwordHash||'',
    !!u.firstLogin,u.active!==false,(u.permissions||[]).join(','),new Date().toISOString()
  ]);
  sh.clearContents();
  sh.appendRow(['id','firstName','lastName','email','function','role','username','passwordHash','firstLogin','active','permissions','updatedAt']);
  if (rows.length) sh.getRange(2,1,rows.length,rows[0].length).setValues(rows);
}

function deleteUser_(id) {
  const users = listUsers_().filter(u => u.id !== id);
  saveUsers_(users);
}
