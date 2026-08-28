// Suggestions.gs — API d'administration du tableau "Tableau suggestion"
// IMPORTANT : ce fichier est indépendant du Code.gs/Formulaire.html du site public.
// Il ne modifie pas le circuit formulaire -> Google Sheet -> mail existant.

const SUGGESTIONS_SPREADSHEET_ID = '1FBSKEkT6eyzDLGWw8G-AOZagZMKED15LLFUKdvm6Jqs';
const SUGGESTIONS_SHEET_NAME = 'Tableau suggestion';
const ADMIN_API_URL = 'https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SUGGESTIONS_LAST_ROW_PROP = 'suggestionsAdmin:lastSeenRow';
const SUGGESTIONS_STATUSES = ['Pas commencé','En cours','Bloqué','Terminé','Non retenu'];

function suggestionsAdminSheet_() {
  const ss = SpreadsheetApp.openById(SUGGESTIONS_SPREADSHEET_ID);
  const sh = ss.getSheetByName(SUGGESTIONS_SHEET_NAME);
  if (!sh) throw new Error('Onglet "Tableau suggestion" introuvable.');
  return sh;
}

function suggestionsAdminRow_(sh, row) {
  const v = sh.getRange(row, 1, 1, 9).getDisplayValues()[0];
  return {
    id: String(row),
    row: row,
    title: String(v[0] || '').trim(),
    category: String(v[1] || '').trim(),
    name: String(v[2] || '').trim(),
    status: String(v[3] || '').trim() || 'Pas commencé',
    date: String(v[4] || '').trim(),
    email: String(v[5] || '').trim(),
    summary: String(v[6] || '').trim(),
    place: String(v[7] || '').trim(),
    text: String(v[8] || '').trim(),
    source: 'Site'
  };
}

function listSuggestionsApp_() {
  const sh = suggestionsAdminSheet_();
  detectNewSuggestionsApp_(sh);
  const out = [];
  for (let row = 2; row <= sh.getLastRow(); row++) {
    const s = suggestionsAdminRow_(sh, row);
    if (s.title || s.text) out.push(s);
  }
  out.reverse();
  return { ok: true, suggestions: out };
}

function updateSuggestionApp_(o) {
  o = o || {};
  const row = Number(o.row || o.id || 0);
  const sh = suggestionsAdminSheet_();
  if (row < 2 || row > sh.getLastRow()) return { ok:false, error:'Suggestion introuvable.' };

  // Modification contrôlée des 9 colonnes existantes.
  const fields = {
    title:1, category:2, name:3, status:4, date:5,
    email:6, summary:7, place:8, text:9
  };
  Object.keys(fields).forEach(function(k) {
    if (Object.prototype.hasOwnProperty.call(o, k)) {
      if (k === 'status' && SUGGESTIONS_STATUSES.indexOf(String(o[k])) < 0) return;
      sh.getRange(row, fields[k]).setValue(o[k]);
    }
  });
  return { ok:true, suggestion:suggestionsAdminRow_(sh,row) };
}

function updateSuggestionStatusApp_(id, status) {
  status = String(status || '').trim();
  if (SUGGESTIONS_STATUSES.indexOf(status) < 0) return {ok:false,error:'Statut invalide.'};
  return updateSuggestionApp_({id:id,status:status});
}

function addSuggestionApp_(o) {
  o = o || {};
  const sh = suggestionsAdminSheet_();
  const title = String(o.title || o.titre || '').trim();
  const text = String(o.text || o.suggestion || '').trim();
  if (!title && !text) return {ok:false,error:'La proposition est vide.'};
  sh.appendRow([
    title || text.substring(0,80),
    String(o.category || o.nature || '').trim(),
    String(o.name || '').trim(),
    SUGGESTIONS_STATUSES.indexOf(String(o.status || '')) >= 0 ? String(o.status) : 'Pas commencé',
    new Date(),
    String(o.email || '').trim(),
    String(o.summary || '').trim(),
    String(o.place || '').trim(),
    text
  ]);
  const row = sh.getLastRow();
  // Une proposition créée depuis l'administration est déjà connue de l'app :
  // on évite qu'elle soit détectée ensuite comme une nouvelle soumission du site.
  PropertiesService.getScriptProperties().setProperty(SUGGESTIONS_LAST_ROW_PROP,String(row));
  return {ok:true,suggestion:suggestionsAdminRow_(sh,row)};
}

function createAdminSuggestionNotification_(s) {
  const payload = {
    action:'createNotification',
    notification:{
      type:'suggestion',
      title:'Nouvelle suggestion',
      message:s.title || s.summary || s.text,
      targetPermissions:['suggestions'],
      data:{suggestionId:String(s.id),row:s.row,source:'Site'}
    }
  };
  try {
    UrlFetchApp.fetch(ADMIN_API_URL,{
      method:'post',
      contentType:'text/plain;charset=utf-8',
      payload:JSON.stringify(payload),
      muteHttpExceptions:true,
      followRedirects:true
    });
  } catch(e) {
    console.warn('Notification administration impossible : '+e);
  }
}

function detectNewSuggestionsApp_(sh) {
  sh = sh || suggestionsAdminSheet_();
  const props = PropertiesService.getScriptProperties();
  const last = sh.getLastRow();
  const raw = props.getProperty(SUGGESTIONS_LAST_ROW_PROP);
  if (raw === null) {
    // Première installation : les anciennes lignes ne déclenchent pas une avalanche de notifications.
    props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(last));
    return {ok:true,newCount:0,initialized:true};
  }
  let previous = Number(raw || 1);
  if (last < previous) previous = last;
  let count = 0;
  for (let row = Math.max(2,previous+1); row <= last; row++) {
    const s = suggestionsAdminRow_(sh,row);
    if (!s.title && !s.text) continue;
    createAdminSuggestionNotification_(s);
    count++;
  }
  props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(last));
  return {ok:true,newCount:count};
}

// À exécuter UNE FOIS manuellement dans Apps Script pour créer la surveillance automatique.
// Le formulaire public reste inchangé : ce déclencheur observe seulement les nouvelles lignes.
function installerSurveillanceSuggestionsApp() {
  ScriptApp.getProjectTriggers()
    .filter(function(t){return t.getHandlerFunction()==='surveillerSuggestionsApp';})
    .forEach(function(t){ScriptApp.deleteTrigger(t);});
  ScriptApp.newTrigger('surveillerSuggestionsApp').timeBased().everyMinutes(1).create();
  // Baseline immédiate : pas de notifications pour l'historique déjà présent.
  PropertiesService.getScriptProperties().setProperty(
    SUGGESTIONS_LAST_ROW_PROP,
    String(suggestionsAdminSheet_().getLastRow())
  );
  return {ok:true};
}

function surveillerSuggestionsApp() {
  return detectNewSuggestionsApp_(suggestionsAdminSheet_());
}

// Fonctions API prévues pour un endpoint Apps Script séparé dédié à l'application.
function suggestionsAppApiGet_(action) {
  if (action === 'listSuggestions') return listSuggestionsApp_();
  return null;
}
function suggestionsAppApiPost_(body) {
  body = body || {};
  if (body.action === 'addSuggestion') return addSuggestionApp_(body.suggestion || {});
  if (body.action === 'updateSuggestionStatus') return updateSuggestionStatusApp_(body.id || '',body.status || '');
  if (body.action === 'updateSuggestion') return updateSuggestionApp_(body.suggestion || {});
  return null;
}
