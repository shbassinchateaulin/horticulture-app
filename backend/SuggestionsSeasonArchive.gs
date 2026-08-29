// Module complémentaire pour Suggestions.gs
// Saison : 1er novembre -> 31 octobre.
// Les statuts Terminé / Non retenu sont déplacés immédiatement vers
// "Archives suggestions" afin d'être visibles tout de suite dans les archives.

const SUGGESTIONS_ARCHIVE_SHEET_NAME = 'Archives suggestions';
const SUGGESTIONS_TERMINAL_STATUSES = ['Terminé','Non retenu'];
const SUGGESTIONS_ARCHIVE_PROP_PREFIX = 'suggestionsAdmin:terminal:';

function suggestionSeason_(date) {
  const d = date instanceof Date && !isNaN(date) ? date : new Date();
  const y = d.getFullYear();
  return d.getMonth() >= 10 ? y + '-' + (y + 1) : (y - 1) + '-' + y;
}

function suggestionDate_(value) {
  if (value instanceof Date && !isNaN(value)) return value;
  const s = String(value || '').trim();
  let m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  const d = new Date(s);
  return isNaN(d) ? new Date() : d;
}

function suggestionsArchiveSheet_() {
  const ss = SpreadsheetApp.openById(SUGGESTIONS_SPREADSHEET_ID);
  let sh = ss.getSheetByName(SUGGESTIONS_ARCHIVE_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SUGGESTIONS_ARCHIVE_SHEET_NAME);
    sh.appendRow(['Titre','Nature','Nom et prénom','Statut','Date reçue','E-mail','Résumé','Lieu / organisme','Suggestion complète','Saison','Date archivage']);
    sh.setFrozenRows(1);
  }
  return sh;
}

function suggestionKey_(rowValues) {
  const raw = rowValues.slice(0,9).map(String).join('|');
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
  return bytes.map(function(b){ return ('0' + ((b + 256) % 256).toString(16)).slice(-2); }).join('').slice(0,24);
}

function markSuggestionTerminal_(sh,row,status) {
  const vals = sh.getRange(row,1,1,9).getValues()[0];
  const props = PropertiesService.getScriptProperties();
  props.deleteProperty(SUGGESTIONS_ARCHIVE_PROP_PREFIX + suggestionKey_(vals));
  if (SUGGESTIONS_TERMINAL_STATUSES.indexOf(status) >= 0) {
    archiveRow_(sh,row,'status');
    props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(sh.getLastRow()));
  }
}

function listActiveSuggestionsSeasonApp_() {
  archiveDueSuggestionsApp_();
  const sh = suggestionsAdminSheet_();
  detectNewSuggestionsApp_(sh);
  const current = suggestionSeason_(new Date());
  const out=[];
  for(let row=2;row<=sh.getLastRow();row++){
    const raw=sh.getRange(row,1,1,9).getValues()[0];
    const s=suggestionsAdminRow_(sh,row);
    if(!s.title&&!s.text)continue;
    const season=suggestionSeason_(suggestionDate_(raw[4]));
    if(season!==current)continue;
    if(SUGGESTIONS_TERMINAL_STATUSES.indexOf(s.status)>=0)continue;
    s.season=season;
    out.push(s);
  }
  out.reverse();
  return {ok:true,suggestions:out,season:current};
}

function listSuggestionArchivesApp_() {
  archiveDueSuggestionsApp_();
  const sh=suggestionsArchiveSheet_(),out=[];
  if(sh.getLastRow()>=2){
    const values=sh.getRange(2,1,sh.getLastRow()-1,11).getDisplayValues();
    values.forEach(function(v,i){out.push({id:'archive-'+(i+2),row:i+2,title:v[0],category:v[1],name:v[2],status:v[3],date:v[4],email:v[5],summary:v[6],place:v[7],text:v[8],season:v[9],archivedAt:v[10],archived:true});});
  }
  out.reverse();
  return {ok:true,archives:out,season:suggestionSeason_(new Date())};
}

function archiveRow_(sh,row,reason) {
  if(row < 2 || row > sh.getLastRow()) return;
  const vals=sh.getRange(row,1,1,9).getValues()[0];
  if(!vals.some(function(v){return String(v||'').trim();}))return;
  const season=suggestionSeason_(suggestionDate_(vals[4]));
  suggestionsArchiveSheet_().appendRow(vals.concat([season,new Date()]));
  PropertiesService.getScriptProperties().deleteProperty(SUGGESTIONS_ARCHIVE_PROP_PREFIX+suggestionKey_(vals));
  sh.deleteRow(row);
}

function archiveDueSuggestionsApp_() {
  const sh=suggestionsAdminSheet_(),current=suggestionSeason_(new Date());
  for(let row=sh.getLastRow();row>=2;row--){
    const vals=sh.getRange(row,1,1,9).getValues()[0];
    if(!vals.some(function(v){return String(v||'').trim();}))continue;
    const status=String(vals[3]||'').trim(),season=suggestionSeason_(suggestionDate_(vals[4]));
    if(season!==current){archiveRow_(sh,row,'season');continue;}
    if(SUGGESTIONS_TERMINAL_STATUSES.indexOf(status)>=0){archiveRow_(sh,row,'status');}
  }
  PropertiesService.getScriptProperties().setProperty(SUGGESTIONS_LAST_ROW_PROP,String(sh.getLastRow()));
  return {ok:true};
}

function restoreArchivedSuggestionApp_(id) {
  const archiveRow = Number(String(id || '').replace('archive-',''));
  const archiveSh = suggestionsArchiveSheet_();
  if (!Number.isInteger(archiveRow) || archiveRow < 2 || archiveRow > archiveSh.getLastRow()) {
    return {ok:false,error:'Archive introuvable.'};
  }

  const vals = archiveSh.getRange(archiveRow,1,1,11).getValues()[0];
  if (!vals.slice(0,9).some(function(v){return String(v||'').trim();})) {
    return {ok:false,error:'Archive vide.'};
  }

  const activeSh = suggestionsAdminSheet_();
  const restored = vals.slice(0,9);

  // Une archive restaurée redevient une suggestion active.
  // On la remet en "Pas commencé" et à la date actuelle pour qu'elle appartienne
  // à la saison active et ne soit pas immédiatement ré-archivée.
  restored[3] = 'Pas commencé';
  restored[4] = new Date();

  activeSh.appendRow(restored);
  SpreadsheetApp.flush();
  const newRow = activeSh.getLastRow();
  archiveSh.deleteRow(archiveRow);

  PropertiesService.getScriptProperties().setProperty(
    SUGGESTIONS_LAST_ROW_PROP,
    String(newRow)
  );

  return {
    ok:true,
    restored:true,
    suggestion:suggestionsAdminRow_(activeSh,newRow)
  };
}

function deleteSuggestionNowApp_(id) {
  const row=Number(id||0),sh=suggestionsAdminSheet_();
  if(!Number.isInteger(row)||row<2||row>sh.getLastRow())return {ok:false,error:'Suggestion introuvable.'};
  const vals=sh.getRange(row,1,1,9).getValues()[0];
  PropertiesService.getScriptProperties().deleteProperty(SUGGESTIONS_ARCHIVE_PROP_PREFIX+suggestionKey_(vals));
  sh.deleteRow(row);
  PropertiesService.getScriptProperties().setProperty(SUGGESTIONS_LAST_ROW_PROP,String(sh.getLastRow()));
  return {ok:true};
}

function deleteArchivedSuggestionNowApp_(id) {
  const row=Number(String(id||'').replace('archive-','')),sh=suggestionsArchiveSheet_();
  if(!Number.isInteger(row)||row<2||row>sh.getLastRow())return {ok:false,error:'Archive introuvable.'};
  sh.deleteRow(row);return {ok:true};
}

function entretienSuggestionsApp_(){
  archiveDueSuggestionsApp_();
  return detectNewSuggestionsApp_(suggestionsAdminSheet_());
}
