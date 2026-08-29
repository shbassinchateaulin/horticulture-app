// Code.gs — API autonome "Suggestions" pour l'application d'administration
// IMPORTANT : ce projet Apps Script est séparé du formulaire public.
// Le formulaire public + son Code.gs + son mail restent totalement inchangés.

const SUGGESTIONS_SPREADSHEET_ID = '1FBSKEkT6eyzDLGWw8G-AOZagZMKED15LLFUKdvm6Jqs';
const SUGGESTIONS_SHEET_NAME = 'Tableau suggestion';
const ADMIN_API_URL = 'https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SUGGESTIONS_LAST_ROW_PROP = 'suggestionsAdmin:lastSeenRow';
const SUGGESTIONS_STATUSES = ['Pas commencé','En cours','Bloqué','Terminé','Non retenu'];

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || '').trim();
    if (action === 'listSuggestions') return json_(listSuggestionsApp_());
    if (action === 'listSuggestionArchives') return json_(listSuggestionArchivesApp_());
    if (action === 'ping') return json_({ok:true,service:'suggestions-admin',season:typeof suggestionSeason_ === 'function' ? suggestionSeason_(new Date()) : ''});
    return json_({ok:false,error:'Action GET inconnue.'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message ? err.message : err)});
  }
}

function doPost(e) {
  try {
    let body = {};
    try { body = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
    catch (_) { return json_({ok:false,error:'JSON invalide.'}); }
    if (body.action === 'addSuggestion') return json_(addSuggestionApp_(body.suggestion || {}));
    if (body.action === 'updateSuggestionStatus') return json_(updateSuggestionStatusApp_(body.id || '', body.status || ''));
    if (body.action === 'updateSuggestion') return json_(updateSuggestionApp_(body.suggestion || {}));
    if (body.action === 'deleteSuggestionNow') return json_(deleteSuggestionNowApp_(body.id || body.row || ''));
    if (body.action === 'deleteArchivedSuggestionNow') return json_(deleteArchivedSuggestionNowApp_(body.id || body.row || ''));
    if (body.action === 'restoreArchivedSuggestion') return json_(restoreArchivedSuggestionApp_(body.id || body.row || ''));
    return json_({ok:false,error:'Action POST inconnue.'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message ? err.message : err)});
  }
}

function suggestionsAdminSheet_() {
  const ss = SpreadsheetApp.openById(SUGGESTIONS_SPREADSHEET_ID);
  const sh = ss.getSheetByName(SUGGESTIONS_SHEET_NAME);
  if (!sh) throw new Error('Onglet "Tableau suggestion" introuvable.');
  return sh;
}

function suggestionsAdminRow_(sh, row) {
  const v = sh.getRange(row, 1, 1, 9).getDisplayValues()[0];
  return {
    id:String(row), row:row,
    title:String(v[0] || '').trim(), category:String(v[1] || '').trim(), name:String(v[2] || '').trim(),
    status:String(v[3] || '').trim() || 'Pas commencé', date:String(v[4] || '').trim(), email:String(v[5] || '').trim(),
    summary:String(v[6] || '').trim(), place:String(v[7] || '').trim(), text:String(v[8] || '').trim(), source:'Site'
  };
}

function listSuggestionsApp_() {
  const sh = suggestionsAdminSheet_();
  const last = sh.getLastRow();
  const currentSeason = typeof suggestionSeason_ === 'function' ? suggestionSeason_(new Date()) : '';
  if (last < 2) return {ok:true,suggestions:[],season:currentSeason};

  const range = sh.getRange(2, 1, last - 1, 9);
  const display = range.getDisplayValues();
  const raw = range.getValues();
  const out = [];

  for (let i = 0; i < display.length; i++) {
    const v = display[i];
    const title = String(v[0] || '').trim();
    const text = String(v[8] || '').trim();
    if (!title && !text) continue;

    const status = String(v[3] || '').trim() || 'Pas commencé';
    let season = '';
    if (typeof suggestionSeason_ === 'function' && typeof suggestionDate_ === 'function') {
      season = suggestionSeason_(suggestionDate_(raw[i][4]));
      if (season !== currentSeason) continue;
      if (typeof SUGGESTIONS_TERMINAL_STATUSES !== 'undefined' && SUGGESTIONS_TERMINAL_STATUSES.indexOf(status) >= 0) continue;
    }

    const row = i + 2;
    out.push({
      id:String(row), row:row,
      title:title,
      category:String(v[1] || '').trim(),
      name:String(v[2] || '').trim(),
      status:status,
      date:String(v[4] || '').trim(),
      email:String(v[5] || '').trim(),
      summary:String(v[6] || '').trim(),
      place:String(v[7] || '').trim(),
      text:text,
      source:'Site',
      season:season
    });
  }

  out.reverse();
  return {ok:true,suggestions:out,season:currentSeason};
}

function updateSuggestionApp_(o) {
  o = o || {};
  const row = Number(o.row || o.id || 0), sh = suggestionsAdminSheet_();
  if (!Number.isInteger(row) || row < 2 || row > sh.getLastRow()) return {ok:false,error:'Suggestion introuvable.'};
  if (Object.prototype.hasOwnProperty.call(o,'status')) {
    const status = String(o.status || '').trim();
    if (SUGGESTIONS_STATUSES.indexOf(status) < 0) return {ok:false,error:'Statut invalide.'};
  }
  const fields = {title:1,category:2,name:3,status:4,date:5,email:6,summary:7,place:8,text:9};
  Object.keys(fields).forEach(function(key){ if(Object.prototype.hasOwnProperty.call(o,key)) sh.getRange(row,fields[key]).setValue(o[key]); });
  SpreadsheetApp.flush();
  const status = Object.prototype.hasOwnProperty.call(o,'status') ? String(o.status || '').trim() : '';
  const willArchive = status && typeof SUGGESTIONS_TERMINAL_STATUSES !== 'undefined' && SUGGESTIONS_TERMINAL_STATUSES.indexOf(status) >= 0;
  if (Object.prototype.hasOwnProperty.call(o,'status') && typeof markSuggestionTerminal_ === 'function') markSuggestionTerminal_(sh,row,status);
  if (willArchive) return {ok:true,archived:true,status:status};
  return {ok:true,suggestion:suggestionsAdminRow_(sh,row)};
}

function updateSuggestionStatusApp_(id,status) {
  status = String(status || '').trim();
  if (SUGGESTIONS_STATUSES.indexOf(status) < 0) return {ok:false,error:'Statut invalide.'};
  return updateSuggestionApp_({id:id,status:status});
}

function addSuggestionApp_(o) {
  o = o || {};
  const sh = suggestionsAdminSheet_();
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return {ok:false,error:'Une autre suggestion est en cours de traitement.'};
  try {
    detectNewSuggestionsApp_(sh);
    const title = String(o.title || o.titre || '').trim(), text = String(o.text || o.suggestion || '').trim();
    if (!title && !text) return {ok:false,error:'La proposition est vide.'};
    const requestedStatus = String(o.status || '').trim();
    const status = SUGGESTIONS_STATUSES.indexOf(requestedStatus) >= 0 ? requestedStatus : 'Pas commencé';
    sh.appendRow([title || text.substring(0,80),String(o.category || o.nature || '').trim(),String(o.name || '').trim(),status,new Date(),String(o.email || '').trim(),String(o.summary || '').trim(),String(o.place || '').trim(),text]);
    SpreadsheetApp.flush();
    const row = sh.getLastRow();
    const s = suggestionsAdminRow_(sh,row);
    const notif = createAdminSuggestionNotification_(s);
    if (notif.ok) PropertiesService.getScriptProperties().setProperty(SUGGESTIONS_LAST_ROW_PROP,String(row));
    if (typeof markSuggestionTerminal_ === 'function') markSuggestionTerminal_(sh,row,status);
    if (typeof SUGGESTIONS_TERMINAL_STATUSES !== 'undefined' && SUGGESTIONS_TERMINAL_STATUSES.indexOf(status) >= 0) return {ok:true,archived:true,status:status,notification:notif};
    return {ok:true,suggestion:s,notification:notif};
  } finally {
    lock.releaseLock();
  }
}

function createAdminSuggestionNotification_(s) {
  const payload = {action:'createNotification',notification:{type:'suggestion',title:'Nouvelle suggestion',message:s.title || s.summary || s.text,targetPermissions:['suggestions','superadmin'],data:{suggestionId:String(s.id),row:Number(s.row || 0),source:'Site'}}};
  try {
    const r = UrlFetchApp.fetch(ADMIN_API_URL,{method:'post',contentType:'text/plain;charset=utf-8',payload:JSON.stringify(payload),muteHttpExceptions:true,followRedirects:true});
    const code = r.getResponseCode(), text = r.getContentText();
    if (code < 200 || code >= 300) return {ok:false,error:'Notification Administration HTTP '+code,response:text};
    let body;
    try { body = JSON.parse(text || '{}'); }
    catch (_) { return {ok:false,error:'Réponse Notifications invalide',response:text}; }
    if (!body || body.ok !== true) return {ok:false,error:String((body && body.error) || 'Notification refusée par l’API'),response:text};
    return {ok:true,id:String(body.id || ''),createdAt:String(body.createdAt || '')};
  } catch (e) {
    return {ok:false,error:'Notification administration impossible : '+String(e && e.message ? e.message : e)};
  }
}

function detectNewSuggestionsApp_(sh) {
  sh = sh || suggestionsAdminSheet_();
  const props = PropertiesService.getScriptProperties(), last = sh.getLastRow(), raw = props.getProperty(SUGGESTIONS_LAST_ROW_PROP);
  if (raw === null) {
    props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(last));
    return {ok:true,newCount:0,initialized:true};
  }
  let previous = Number(raw || 1);
  if (!Number.isFinite(previous) || previous < 1) previous = 1;
  if (last < previous) {
    props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(last));
    return {ok:true,newCount:0,recalibrated:true};
  }
  let count = 0, seen = previous;
  for (let row = Math.max(2,previous + 1); row <= last; row++) {
    const s = suggestionsAdminRow_(sh,row);
    if (!s.title && !s.text) { seen = row; continue; }
    const sent = createAdminSuggestionNotification_(s);
    if (!sent.ok) {
      props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(seen));
      console.warn('Notification suggestion ligne '+row+' non créée : '+sent.error);
      return {ok:false,newCount:count,failedRow:row,error:sent.error};
    }
    seen = row;
    props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(seen));
    count++;
  }
  return {ok:true,newCount:count,lastSeenRow:seen};
}

function withSuggestionWatchLock_(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return {ok:true,skipped:true,reason:'already-running'};
  try { return fn(); }
  finally { lock.releaseLock(); }
}

function installerSurveillanceSuggestionsApp() {
  const triggers = ScriptApp.getProjectTriggers();
  const managed = ['surveillerSuggestionsApp','surveillerSuggestionsEditionApp','surveillerSuggestionsFormulaireApp'];
  triggers.filter(function(t){return managed.indexOf(t.getHandlerFunction()) >= 0;}).forEach(function(t){ScriptApp.deleteTrigger(t);});

  const ss = SpreadsheetApp.openById(SUGGESTIONS_SPREADSHEET_ID);
  PropertiesService.getScriptProperties().setProperty(SUGGESTIONS_LAST_ROW_PROP,String(suggestionsAdminSheet_().getLastRow()));
  if (typeof suggestionsArchiveSheet_ === 'function') suggestionsArchiveSheet_();

  ScriptApp.newTrigger('surveillerSuggestionsEditionApp').forSpreadsheet(ss).onEdit().create();
  try {
    ScriptApp.newTrigger('surveillerSuggestionsFormulaireApp').forSpreadsheet(ss).onFormSubmit().create();
  } catch (e) {
    console.warn('Déclencheur formulaire non créé : '+e);
  }
  ScriptApp.newTrigger('surveillerSuggestionsApp').timeBased().everyMinutes(1).create();

  return diagnosticSurveillanceSuggestionsApp();
}

function surveillerSuggestionsEditionApp(e) {
  return withSuggestionWatchLock_(function(){
    try {
      const range = e && e.range, sh = range && range.getSheet ? range.getSheet() : null;
      if (sh && sh.getName() !== SUGGESTIONS_SHEET_NAME) return {ok:true,ignored:true};
      if (range && (range.getLastRow() < 2 || range.getColumn() > 9 || range.getLastColumn() < 1)) return {ok:true,ignored:true};
      return detectNewSuggestionsApp_(sh || suggestionsAdminSheet_());
    } catch (err) {
      console.warn('Surveillance immédiate Suggestions impossible : '+err);
      return {ok:false,error:String(err)};
    }
  });
}

function surveillerSuggestionsFormulaireApp(e) {
  return withSuggestionWatchLock_(function(){
    try {
      const range = e && e.range, sh = range && range.getSheet ? range.getSheet() : null;
      if (sh && sh.getName() !== SUGGESTIONS_SHEET_NAME) return {ok:true,ignored:true};
      return detectNewSuggestionsApp_(sh || suggestionsAdminSheet_());
    } catch (err) {
      console.warn('Surveillance formulaire Suggestions impossible : '+err);
      return {ok:false,error:String(err)};
    }
  });
}

function surveillerSuggestionsApp() {
  return withSuggestionWatchLock_(function(){
    const detection = detectNewSuggestionsApp_(suggestionsAdminSheet_());
    if (typeof archiveDueSuggestionsApp_ === 'function') archiveDueSuggestionsApp_();
    return detection;
  });
}

function diagnosticSurveillanceSuggestionsApp() {
  const sh = suggestionsAdminSheet_();
  const props = PropertiesService.getScriptProperties();
  const triggers = ScriptApp.getProjectTriggers().map(function(t){
    return {handler:t.getHandlerFunction(),eventType:String(t.getEventType()),source:String(t.getTriggerSource())};
  });
  return {
    ok:true,
    lastRow:sh.getLastRow(),
    lastSeenRow:Number(props.getProperty(SUGGESTIONS_LAST_ROW_PROP) || 0),
    triggers:triggers,
    hasMinuteTrigger:triggers.some(function(t){return t.handler==='surveillerSuggestionsApp';}),
    hasEditTrigger:triggers.some(function(t){return t.handler==='surveillerSuggestionsEditionApp';}),
    hasFormTrigger:triggers.some(function(t){return t.handler==='surveillerSuggestionsFormulaireApp';})
  };
}

// Test manuel : crée une vraie notification à partir de la dernière suggestion sans modifier le marqueur de surveillance.
function testerNotificationSuggestionApp() {
  const sh = suggestionsAdminSheet_(), row = sh.getLastRow();
  if (row < 2) return {ok:false,error:'Aucune suggestion à tester.'};
  const s = suggestionsAdminRow_(sh,row);
  if (!s.title && !s.text) return {ok:false,error:'La dernière ligne est vide.'};
  const result = createAdminSuggestionNotification_(s);
  if (!result.ok) throw new Error(result.error + (result.response ? ' | '+result.response : ''));
  return result;
}
