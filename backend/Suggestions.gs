// Code.gs — API autonome "Suggestions" pour l'application d'administration
// IMPORTANT : ce projet Apps Script est séparé du formulaire public.
// Le formulaire public + son Code.gs + son mail restent totalement inchangés.

const SUGGESTIONS_SPREADSHEET_ID = '1FBSKEkT6eyzDLGWw8G-AOZagZMKED15LLFUKdvm6Jqs';
const SUGGESTIONS_SHEET_NAME = 'Tableau suggestion';
const ADMIN_API_URL = 'https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SUGGESTIONS_LAST_ROW_PROP = 'suggestionsAdmin:lastSeenRow';
const SUGGESTIONS_STATUSES = ['Pas commencé','En cours','Bloqué','Terminé','Non retenu'];

function json_(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    const action = String((e && e.parameter && e.parameter.action) || '').trim();

    if (action === 'listSuggestions') {
      return json_(listSuggestionsApp_());
    }

    if (action === 'listSuggestionArchives') {
      // On détecte d'abord les nouvelles lignes afin de ne jamais perdre une notification,
      // puis on effectue l'entretien / archivage.
      detectNewSuggestionsApp_(suggestionsAdminSheet_());
      return json_(listSuggestionArchivesApp_());
    }

    if (action === 'ping') {
      return json_({
        ok:true,
        service:'suggestions-admin',
        season:typeof suggestionSeason_ === 'function' ? suggestionSeason_(new Date()) : ''
      });
    }

    return json_({ok:false,error:'Action GET inconnue.'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message ? err.message : err)});
  }
}

function doPost(e) {
  try {
    let body = {};
    try {
      body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    } catch (_) {
      return json_({ok:false,error:'JSON invalide.'});
    }

    if (body.action === 'addSuggestion') {
      return json_(addSuggestionApp_(body.suggestion || {}));
    }

    if (body.action === 'updateSuggestionStatus') {
      return json_(updateSuggestionStatusApp_(body.id || '', body.status || ''));
    }

    if (body.action === 'updateSuggestion') {
      return json_(updateSuggestionApp_(body.suggestion || {}));
    }

    if (body.action === 'deleteSuggestionNow') {
      return json_(deleteSuggestionNowApp_(body.id || body.row || ''));
    }

    if (body.action === 'deleteArchivedSuggestionNow') {
      return json_(deleteArchivedSuggestionNowApp_(body.id || body.row || ''));
    }

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

  // Très important : détection AVANT tout archivage ou suppression de lignes,
  // sinon une nouvelle suggestion du site pourrait être prise pour une simple nouvelle baseline.
  detectNewSuggestionsApp_(sh);

  if (typeof archiveDueSuggestionsApp_ === 'function') {
    archiveDueSuggestionsApp_();
  }

  const currentSeason = typeof suggestionSeason_ === 'function'
    ? suggestionSeason_(new Date())
    : '';

  const out = [];
  const last = sh.getLastRow();

  for (let row = 2; row <= last; row++) {
    const s = suggestionsAdminRow_(sh, row);
    if (!s.title && !s.text) continue;

    // Si le module saisonnier est présent :
    // - seules les suggestions de la saison active sont visibles ;
    // - Terminé / Non retenu disparaissent immédiatement de l'écran,
    //   tout en restant 24 h dans le Google Sheet avant archivage.
    if (typeof suggestionSeason_ === 'function' && typeof suggestionDate_ === 'function') {
      const rawDate = sh.getRange(row,5).getValue();
      const season = suggestionSeason_(suggestionDate_(rawDate));
      s.season = season;

      if (season !== currentSeason) continue;

      if (typeof SUGGESTIONS_TERMINAL_STATUSES !== 'undefined' &&
          SUGGESTIONS_TERMINAL_STATUSES.indexOf(s.status) >= 0) {
        continue;
      }
    }

    out.push(s);
  }

  out.reverse();
  return {ok:true,suggestions:out,season:currentSeason};
}

function updateSuggestionApp_(o) {
  o = o || {};
  const row = Number(o.row || o.id || 0);
  const sh = suggestionsAdminSheet_();

  if (!Number.isInteger(row) || row < 2 || row > sh.getLastRow()) {
    return {ok:false,error:'Suggestion introuvable.'};
  }

  if (Object.prototype.hasOwnProperty.call(o,'status')) {
    const status = String(o.status || '').trim();
    if (SUGGESTIONS_STATUSES.indexOf(status) < 0) {
      return {ok:false,error:'Statut invalide.'};
    }
  }

  const fields = {
    title:1,
    category:2,
    name:3,
    status:4,
    date:5,
    email:6,
    summary:7,
    place:8,
    text:9
  };

  Object.keys(fields).forEach(function(key) {
    if (Object.prototype.hasOwnProperty.call(o,key)) {
      sh.getRange(row,fields[key]).setValue(o[key]);
    }
  });

  SpreadsheetApp.flush();

  // Démarre / enlève le délai de 24 h si le statut devient
  // Terminé / Non retenu ou revient à un statut actif.
  if (Object.prototype.hasOwnProperty.call(o,'status') &&
      typeof markSuggestionTerminal_ === 'function') {
    markSuggestionTerminal_(sh,row,String(o.status || '').trim());
  }

  return {ok:true,suggestion:suggestionsAdminRow_(sh,row)};
}

function updateSuggestionStatusApp_(id,status) {
  status = String(status || '').trim();
  if (SUGGESTIONS_STATUSES.indexOf(status) < 0) {
    return {ok:false,error:'Statut invalide.'};
  }
  return updateSuggestionApp_({id:id,status:status});
}

function addSuggestionApp_(o) {
  o = o || {};
  const sh = suggestionsAdminSheet_();

  // Avant un ajout manuel, on détecte d'abord les éventuelles nouvelles lignes
  // déposées par le formulaire public afin de ne pas les sauter.
  detectNewSuggestionsApp_(sh);

  const title = String(o.title || o.titre || '').trim();
  const text = String(o.text || o.suggestion || '').trim();

  if (!title && !text) return {ok:false,error:'La proposition est vide.'};

  const requestedStatus = String(o.status || '').trim();
  const status = SUGGESTIONS_STATUSES.indexOf(requestedStatus) >= 0
    ? requestedStatus
    : 'Pas commencé';

  sh.appendRow([
    title || text.substring(0,80),
    String(o.category || o.nature || '').trim(),
    String(o.name || '').trim(),
    status,
    new Date(),
    String(o.email || '').trim(),
    String(o.summary || '').trim(),
    String(o.place || '').trim(),
    text
  ]);

  SpreadsheetApp.flush();
  const row = sh.getLastRow();

  // Une suggestion ajoutée depuis l'administration est déjà connue.
  // Elle ne doit pas générer la notification "nouvelle suggestion du site".
  PropertiesService.getScriptProperties().setProperty(
    SUGGESTIONS_LAST_ROW_PROP,
    String(row)
  );

  if (typeof markSuggestionTerminal_ === 'function') {
    markSuggestionTerminal_(sh,row,status);
  }

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
      data:{
        suggestionId:String(s.id),
        row:Number(s.row || 0),
        source:'Site'
      }
    }
  };

  try {
    const r = UrlFetchApp.fetch(ADMIN_API_URL,{
      method:'post',
      contentType:'text/plain;charset=utf-8',
      payload:JSON.stringify(payload),
      muteHttpExceptions:true,
      followRedirects:true
    });

    const code = r.getResponseCode();
    if (code < 200 || code >= 300) {
      console.warn('Notification Administration HTTP '+code+' : '+r.getContentText());
    }
  } catch (e) {
    console.warn('Notification administration impossible : '+e);
  }
}

function detectNewSuggestionsApp_(sh) {
  sh = sh || suggestionsAdminSheet_();

  const props = PropertiesService.getScriptProperties();
  const last = sh.getLastRow();
  const raw = props.getProperty(SUGGESTIONS_LAST_ROW_PROP);

  if (raw === null) {
    // Première exécution : on prend l'existant comme référence.
    // Aucune ancienne suggestion ne déclenche une notification.
    props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(last));
    return {ok:true,newCount:0,initialized:true};
  }

  let previous = Number(raw || 1);
  if (!Number.isFinite(previous) || previous < 1) previous = 1;

  if (last < previous) {
    props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(last));
    return {ok:true,newCount:0,recalibrated:true};
  }

  let count = 0;
  for (let row = Math.max(2,previous + 1); row <= last; row++) {
    const s = suggestionsAdminRow_(sh,row);
    if (!s.title && !s.text) continue;
    createAdminSuggestionNotification_(s);
    count++;
  }

  props.setProperty(SUGGESTIONS_LAST_ROW_PROP,String(last));
  return {ok:true,newCount:count};
}

// À exécuter UNE SEULE FOIS manuellement après avoir collé / mis à jour le code.
// Cela autorise le script et crée une vérification automatique toutes les minutes.
function installerSurveillanceSuggestionsApp() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers
    .filter(function(t){
      return t.getHandlerFunction() === 'surveillerSuggestionsApp';
    })
    .forEach(function(t){
      ScriptApp.deleteTrigger(t);
    });

  PropertiesService.getScriptProperties().setProperty(
    SUGGESTIONS_LAST_ROW_PROP,
    String(suggestionsAdminSheet_().getLastRow())
  );

  // Crée immédiatement l'onglet d'archives s'il n'existe pas encore.
  if (typeof suggestionsArchiveSheet_ === 'function') {
    suggestionsArchiveSheet_();
  }

  ScriptApp
    .newTrigger('surveillerSuggestionsApp')
    .timeBased()
    .everyMinutes(1)
    .create();

  return {
    ok:true,
    season:typeof suggestionSeason_ === 'function' ? suggestionSeason_(new Date()) : ''
  };
}

function surveillerSuggestionsApp() {
  // Toujours détecter AVANT l'entretien, car l'entretien peut déplacer/supprimer des lignes.
  const detection = detectNewSuggestionsApp_(suggestionsAdminSheet_());

  if (typeof archiveDueSuggestionsApp_ === 'function') {
    archiveDueSuggestionsApp_();
  }

  return detection;
}
