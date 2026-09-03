// SortiesInscriptionNotifications.gs — notifications internes + OneSignal pour les nouvelles inscriptions HelloAsso aux sorties
// Fonctionne indépendamment de la synchronisation principale pour éviter de modifier la logique d'import existante.

const SORTIES_NOTIF_LOG_SHEET='Sorties inscriptions notifiées';
const SORTIES_NOTIF_TRIGGER_FN='notifierNouvellesInscriptionsSorties';

function sortiesNotifLogSheet_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sh=ss.getSheetByName(SORTIES_NOTIF_LOG_SHEET);
  if(!sh)sh=ss.insertSheet(SORTIES_NOTIF_LOG_SHEET);
  if(sh.getLastRow()===0)sh.appendRow(['key','participantId','sortieId','helloassoItemId','notifiedAt']);
  return sh;
}

function sortiesNotifKey_(p){
  const item=String(p&&p.helloassoItemId||'').trim();
  return item?'ha:'+item:'participant:'+String(p&&p.id||'').trim();
}

function sortiesNotifSeenKeys_(){
  const sh=sortiesNotifLogSheet_();
  if(sh.getLastRow()<2)return new Set();
  return new Set(sh.getRange(2,1,sh.getLastRow()-1,1).getValues().flat().map(String).filter(Boolean));
}

function sortiesNotifHelloAssoParticipants_(){
  if(typeof sortiesParticipantsRows_!=='function')return[];
  return sortiesParticipantsRows_().filter(p=>String(p.source||'').toLowerCase()==='helloasso'&&(String(p.helloassoItemId||'').trim()||String(p.id||'').trim()));
}

function sortiesNotifSortieMap_(){
  const m={};
  if(typeof sortiesRows_==='function')sortiesRows_().forEach(s=>m[String(s.id)]=s);
  return m;
}

function sortiesNotifName_(p){
  return [String(p.firstName||'').trim(),String(p.lastName||'').trim()].filter(Boolean).join(' ')||'Une nouvelle personne';
}

function sortiesNotifWriteSeen_(people){
  if(!people||!people.length)return;
  const sh=sortiesNotifLogSheet_(),at=new Date().toISOString();
  const rows=people.map(p=>[sortiesNotifKey_(p),String(p.id||''),String(p.sortieId||''),String(p.helloassoItemId||''),at]);
  sh.getRange(sh.getLastRow()+1,1,rows.length,5).setValues(rows);
}

function sortiesNotifyImportedGroup_(sortie,people){
  if(typeof createNotification_!=='function'||!people.length)return null;
  const titleSortie=String(sortie&&sortie.title||'la sortie').trim()||'la sortie';
  const names=people.map(sortiesNotifName_);
  let title='',message='';
  if(people.length===1){
    title='Nouvelle inscription';
    message=names[0]+' vient de s’inscrire à « '+titleSortie+' ».';
  }else{
    title=people.length+' nouvelles inscriptions';
    const shown=names.slice(0,5).join(', '),more=people.length>5?' et '+(people.length-5)+' autre(s)':'';
    message=people.length+' nouvelles inscriptions viennent d’être importées pour « '+titleSortie+' » : '+shown+more+'.';
  }
  return createNotification_({
    type:'helloasso-sortie-inscription',
    title:title,
    message:message,
    targetPermissions:['sorties','superadmin'],
    data:{
      view:'sorties',
      sortieId:String(sortie&&sortie.id||people[0].sortieId||''),
      count:people.length,
      participantIds:people.map(p=>String(p.id||'')),
      helloassoItemIds:people.map(p=>String(p.helloassoItemId||'')).filter(Boolean),
      source:'HelloAsso'
    }
  });
}

function notifierNouvellesInscriptionsSorties(){
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(1000))return{ok:true,skipped:true,reason:'Vérification déjà en cours'};
  try{
    const seen=sortiesNotifSeenKeys_(),people=sortiesNotifHelloAssoParticipants_();
    const fresh=people.filter(p=>!seen.has(sortiesNotifKey_(p)));
    if(!fresh.length)return{ok:true,newCount:0,notifications:0};
    const bySortie={};
    fresh.forEach(p=>{const id=String(p.sortieId||'');(bySortie[id]||(bySortie[id]=[])).push(p)});
    const sorties=sortiesNotifSortieMap_();
    let notifications=0,pushOk=0,pushFailed=0;
    Object.keys(bySortie).forEach(id=>{
      const r=sortiesNotifyImportedGroup_(sorties[id]||{id:id,title:'la sortie'},bySortie[id]);
      if(r&&r.ok){notifications++;if(r.push&&r.push.ok)pushOk++;else if(r.push&&!r.push.skipped)pushFailed++}
    });
    sortiesNotifWriteSeen_(fresh);
    return{ok:true,newCount:fresh.length,notifications:notifications,pushOk:pushOk,pushFailed:pushFailed};
  }finally{lock.releaseLock()}
}

function installerNotificationsInscriptionsSorties(){
  // Au premier lancement, on marque les inscriptions déjà présentes afin de ne pas envoyer une rafale de vieilles notifications.
  const existing=sortiesNotifHelloAssoParticipants_(),seen=sortiesNotifSeenKeys_();
  const missing=existing.filter(p=>!seen.has(sortiesNotifKey_(p)));
  sortiesNotifWriteSeen_(missing);
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()===SORTIES_NOTIF_TRIGGER_FN).forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger(SORTIES_NOTIF_TRIGGER_FN).timeBased().everyMinutes(5).create();
  return{ok:true,baseline:missing.length,trigger:'Toutes les 5 minutes'};
}

function desinstallerNotificationsInscriptionsSorties(){
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()===SORTIES_NOTIF_TRIGGER_FN).forEach(t=>ScriptApp.deleteTrigger(t));
  return{ok:true};
}

function testerNotificationInscriptionSortie(){
  if(typeof createNotification_!=='function')return{ok:false,error:'Notifications.gs indisponible'};
  const s=(typeof sortiesRows_==='function'&&sortiesRows_()[0])||{id:'test',title:'Sortie test'};
  return createNotification_({type:'helloasso-sortie-inscription',title:'Nouvelle inscription',message:'Jean-Marie Dupont vient de s’inscrire à « '+String(s.title||'Sortie test')+' ».',targetPermissions:['sorties','superadmin'],data:{view:'sorties',sortieId:String(s.id||''),test:true,source:'HelloAsso'}});
}
