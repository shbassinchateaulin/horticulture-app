// Suggestions.gs — backend du Google Sheet Suggestions
// À ajouter dans le projet Apps Script LIÉ AU GOOGLE SHEET DES SUGGESTIONS.
// Ce fichier ne dépend pas directement du projet Apps Script Administration.

const SUGGESTIONS_SPREADSHEET_ID='1FBSKEkT6eyzDLGWw8G-AOZagZMKED15LLFUKdvm6Jqs';
const ADMIN_API_URL='https://script.google.com/macros/s/AKfycbwim8t9oVshwze47JG0KeuvdiE3hqjwM6pXts9KA48HSd-jLOP5A3V2cyfN6nVMSp5H/exec';
const SUGGESTION_STATUS_HEADER='Statut application';
const SUGGESTION_ID_HEADER='ID application';
const SUGGESTION_UPDATED_HEADER='Mis à jour application';
const SUGGESTION_SOURCE_HEADER='Source application';
const SUGGESTION_LAST_ROW_PROP='suggestions:lastSeenRow:';

function suggestionsDb_(){
  try{return SpreadsheetApp.getActiveSpreadsheet()}catch(e){return SpreadsheetApp.openById(SUGGESTIONS_SPREADSHEET_ID)}
}
function normalizeHeader_(s){return String(s||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function suggestionTextColumn_(headers){
  const exact=['suggestion','suggestions','votre suggestion','proposition','propositions','idee','idée','message'];
  let i=headers.findIndex(h=>exact.includes(normalizeHeader_(h)));
  if(i>=0)return i;
  return headers.findIndex(h=>{const n=normalizeHeader_(h);return n.includes('suggest')||n.includes('proposition')||n.includes('idee')});
}
function suggestionsSheet_(){
  const ss=suggestionsDb_(),sheets=ss.getSheets();
  for(const sh of sheets){
    if(sh.getLastColumn()<1)continue;
    const headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
    if(suggestionTextColumn_(headers)>=0)return ensureSuggestionColumns_(sh);
  }
  throw new Error('Aucun onglet contenant une colonne Suggestion / Proposition / Idée n’a été trouvé.');
}
function ensureSuggestionColumns_(sh){
  let headers=sh.getRange(1,1,1,Math.max(1,sh.getLastColumn())).getDisplayValues()[0];
  [SUGGESTION_STATUS_HEADER,SUGGESTION_ID_HEADER,SUGGESTION_UPDATED_HEADER,SUGGESTION_SOURCE_HEADER].forEach(h=>{
    if(!headers.some(x=>normalizeHeader_(x)===normalizeHeader_(h))){
      sh.getRange(1,sh.getLastColumn()+1).setValue(h);
      headers=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
    }
  });
  return sh;
}
function suggestionCols_(sh){
  const h=sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0],norm=h.map(normalizeHeader_);
  const find=(names)=>{for(const name of names){const i=norm.findIndex(x=>x===normalizeHeader_(name)||x.includes(normalizeHeader_(name)));if(i>=0)return i}return-1};
  return{headers:h,text:suggestionTextColumn_(h),status:find([SUGGESTION_STATUS_HEADER]),id:find([SUGGESTION_ID_HEADER]),updated:find([SUGGESTION_UPDATED_HEADER]),source:find([SUGGESTION_SOURCE_HEADER]),date:find(['horodateur','timestamp','date','date de soumission']),name:find(['nom et prénom','nom','prenom','prénom']),email:find(['adresse e-mail','adresse email','e-mail','email']),category:find(['catégorie','categorie','type'])};
}
function ensureSuggestionId_(sh,row,cols){
  let id=String(sh.getRange(row,cols.id+1).getValue()||'').trim();
  if(!id){id=Utilities.getUuid();sh.getRange(row,cols.id+1).setValue(id)}
  return id;
}
function suggestionRowObject_(sh,row,cols){
  const raw=sh.getRange(row,1,1,sh.getLastColumn()).getDisplayValues()[0],value=i=>i>=0?String(raw[i]||'').trim():'';
  return{id:ensureSuggestionId_(sh,row,cols),row:row,text:value(cols.text),status:value(cols.status)||'Nouvelle',date:value(cols.date),name:value(cols.name),email:value(cols.email),category:value(cols.category),source:value(cols.source)||'Site',updatedAt:value(cols.updated)};
}
function listSuggestions_(){
  const sh=suggestionsSheet_(),cols=suggestionCols_(sh),last=sh.getLastRow();
  syncNewSuggestions_(sh,cols,last);
  if(last<2)return{ok:true,suggestions:[],sheetName:sh.getName()};
  const out=[];
  for(let row=2;row<=last;row++){
    const text=String(sh.getRange(row,cols.text+1).getDisplayValue()||'').trim();
    if(text)out.push(suggestionRowObject_(sh,row,cols));
  }
  out.reverse();
  return{ok:true,suggestions:out,sheetName:sh.getName()};
}
function syncNewSuggestions_(sh,cols,lastRow){
  const props=PropertiesService.getScriptProperties(),key=SUGGESTION_LAST_ROW_PROP+sh.getSheetId(),stored=props.getProperty(key);
  if(stored===null){props.setProperty(key,String(lastRow));return}
  const from=Math.max(2,Number(stored||1)+1);
  if(lastRow<from){props.setProperty(key,String(lastRow));return}
  for(let row=from;row<=lastRow;row++){
    const text=String(sh.getRange(row,cols.text+1).getDisplayValue()||'').trim();
    if(!text)continue;
    const s=suggestionRowObject_(sh,row,cols);
    if(cols.status>=0&&!String(sh.getRange(row,cols.status+1).getValue()||'').trim())sh.getRange(row,cols.status+1).setValue('Nouvelle');
    if(cols.source>=0&&!String(sh.getRange(row,cols.source+1).getValue()||'').trim())sh.getRange(row,cols.source+1).setValue('Site');
    notifyAdministrationSuggestion_(s);
    sendSuggestionMail_(s);
  }
  props.setProperty(key,String(lastRow));
}
function notifyAdministrationSuggestion_(s){
  const payload={action:'createNotification',notification:{type:'suggestion',title:'Nouvelle suggestion',message:String(s.text||''),targetPermissions:['suggestions'],data:{suggestionId:String(s.id||''),row:Number(s.row||0),source:'Site'}}};
  try{
    const r=UrlFetchApp.fetch(ADMIN_API_URL,{method:'post',contentType:'text/plain;charset=utf-8',payload:JSON.stringify(payload),muteHttpExceptions:true,followRedirects:true});
    const code=r.getResponseCode();
    if(code<200||code>=300)console.warn('Notification Administration HTTP '+code+': '+r.getContentText());
  }catch(e){console.warn('Notification Administration impossible: '+e)}
}
function sendSuggestionMail_(s){
  const props=PropertiesService.getScriptProperties();
  let to=String(props.getProperty('SUGGESTIONS_EMAIL')||'').trim();
  if(!to){try{to=String(Session.getEffectiveUser().getEmail()||'').trim()}catch(e){}}
  if(!to)return;
  const who=s.name?(' par '+s.name):'';
  MailApp.sendEmail({to:to,subject:'Nouvelle suggestion reçue',body:'Une nouvelle suggestion a été reçue'+who+'.\n\n'+s.text+'\n\nConsultez-la dans l’application d’administration.',name:"Société d’Horticulture du Bassin de Châteaulin"});
}
function addSuggestion_(o){
  o=o||{};const text=String(o.text||'').trim();if(!text)return{ok:false,error:'La proposition est vide.'};
  const sh=suggestionsSheet_(),cols=suggestionCols_(sh),row=sh.getLastRow()+1,values=new Array(sh.getLastColumn()).fill(''),id=Utilities.getUuid(),now=new Date().toISOString();
  values[cols.text]=text;
  if(cols.status>=0)values[cols.status]=String(o.status||'Nouvelle');
  if(cols.id>=0)values[cols.id]=id;
  if(cols.updated>=0)values[cols.updated]=now;
  if(cols.source>=0)values[cols.source]=String(o.source||'Application');
  if(cols.name>=0)values[cols.name]=String(o.name||'');
  if(cols.email>=0)values[cols.email]=String(o.email||'');
  if(cols.category>=0)values[cols.category]=String(o.category||'');
  sh.getRange(row,1,1,values.length).setValues([values]);
  PropertiesService.getScriptProperties().setProperty(SUGGESTION_LAST_ROW_PROP+sh.getSheetId(),String(row));
  const s=suggestionRowObject_(sh,row,suggestionCols_(sh));
  notifyAdministrationSuggestion_(s);
  sendSuggestionMail_(s);
  return{ok:true,suggestion:s};
}
function updateSuggestionStatus_(id,status){
  id=String(id||'').trim();status=String(status||'').trim();
  const allowed=['Nouvelle','À étudier','Retenue','Refusée','Réalisée'];
  if(!id||!allowed.includes(status))return{ok:false,error:'Statut invalide.'};
  const sh=suggestionsSheet_(),cols=suggestionCols_(sh);
  for(let row=2;row<=sh.getLastRow();row++){
    if(String(sh.getRange(row,cols.id+1).getValue()||'')===id){
      sh.getRange(row,cols.status+1).setValue(status);
      sh.getRange(row,cols.updated+1).setValue(new Date().toISOString());
      return{ok:true};
    }
  }
  return{ok:false,error:'Suggestion introuvable.'};
}

// Ces deux fonctions sont à appeler depuis le doGet/doPost EXISTANT du projet Suggestions.
function suggestionsApiGet_(action){
  if(action==='listSuggestions')return listSuggestions_();
  return null;
}
function suggestionsApiPost_(body){
  if(body.action==='addSuggestion')return addSuggestion_(body.suggestion||{});
  if(body.action==='updateSuggestionStatus')return updateSuggestionStatus_(body.id||'',body.status||'');
  return null;
}
