// NotificationRetention30d.gs — nettoyage indépendant de la mini-boîte de notifications.
// Après avoir collé ce fichier dans Apps Script, exécuter UNE SEULE FOIS :
// installerNettoyageNotifications30Jours()
// Le déclencheur quotidien sera ensuite créé automatiquement.

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

function installerNettoyageNotifications30Jours(){
  const fonction='nettoyerNotifications30Jours';
  const existants=ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()===fonction);

  // Évite de créer plusieurs déclencheurs identiques si l'installation est relancée.
  if(existants.length===0){
    ScriptApp.newTrigger(fonction)
      .timeBased()
      .everyDays(1)
      .atHour(3)
      .create();
  }else if(existants.length>1){
    existants.slice(1).forEach(t=>ScriptApp.deleteTrigger(t));
  }

  // Lance aussi un premier nettoyage immédiatement.
  const resultat=nettoyerNotifications30Jours();
  Logger.log('Nettoyage notifications installé. Déclencheur quotidien actif vers 03:00.');
  Logger.log(JSON.stringify(resultat));
  return {ok:true,triggerCreated:existants.length===0,dailyAtHour:3,firstCleanup:resultat};
}

function desinstallerNettoyageNotifications30Jours(){
  const fonction='nettoyerNotifications30Jours';
  let deleted=0;
  ScriptApp.getProjectTriggers().forEach(t=>{
    if(t.getHandlerFunction()===fonction){ScriptApp.deleteTrigger(t);deleted++}
  });
  return{ok:true,deleted:deleted};
}
