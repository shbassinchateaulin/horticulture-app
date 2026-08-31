// NotificationRetention30d.gs — nettoyage indépendant de la mini-boîte de notifications.
// À ajouter au même projet Apps Script puis déclencher une fois par jour.
function nettoyerNotifications30Jours(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  const sh=ss.getSheetByName('Notifications');
  const reads=ss.getSheetByName('Notifications lectures');
  if(!sh||sh.getLastRow()<2)return{ok:true,deleted:0};
  const cutoff=Date.now()-30*24*60*60*1000;
  const values=sh.getDataRange().getValues();
  const ids=[];
  for(let i=values.length-1;i>=1;i--){
    const id=String(values[i][0]||'');
    const created=Date.parse(String(values[i][6]||''));
    const expires=Date.parse(String(values[i][7]||''));
    const expired=(Number.isFinite(expires)&&expires<=Date.now())||(Number.isFinite(created)&&created<=cutoff);
    if(id&&expired){ids.push(id);sh.deleteRow(i+1)}
  }
  if(reads&&reads.getLastRow()>=2&&ids.length){
    const set=new Set(ids),rv=reads.getDataRange().getValues();
    for(let i=rv.length-1;i>=1;i--)if(set.has(String(rv[i][0]||'')))reads.deleteRow(i+1);
  }
  return{ok:true,deleted:ids.length};
}
