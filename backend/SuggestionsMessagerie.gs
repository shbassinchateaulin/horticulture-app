// SuggestionsMessagerie.gs — à ajouter au projet Apps Script Suggestions.
// Dans doPost de Suggestions.gs, ajouter :
// if (body.action === 'sendSuggestionMessage') return json_(sendSuggestionMessageApp_(body.message || {}));

const SUGGESTIONS_MESSAGE_HISTORY = 'Historique messages';

function suggestionsMessageHistory_(){
  const ss=SpreadsheetApp.openById(SUGGESTIONS_SPREADSHEET_ID);
  let sh=ss.getSheetByName(SUGGESTIONS_MESSAGE_HISTORY);
  if(!sh) sh=ss.insertSheet(SUGGESTIONS_MESSAGE_HISTORY);
  if(sh.getLastRow()===0) sh.appendRow(['ID','Date','Suggestion','Destinataire','Nom','Objet','Message','Statut']);
  return sh;
}
function suggestionsMailEsc_(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')}
function sendSuggestionMessageApp_(o){
  o=o||{};
  const to=String(o.to||'').trim(), name=String(o.name||'').trim(), text=String(o.message||'').trim();
  const title=String(o.suggestionTitle||'').trim(), ref=String(o.suggestionId||'').trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) return {ok:false,error:'Adresse e-mail invalide.'};
  if(!text) return {ok:false,error:'Écrivez un message.'};
  if(text.length>10000) return {ok:false,error:'Le message est trop long.'};
  const subject=String(o.subject||'').trim()||'À propos de votre suggestion';
  const hello=name?'Bonjour '+suggestionsMailEsc_(name)+',':'Bonjour,';
  const suggestion=title?'<div style="margin:18px 0;padding:14px 16px;background:#f1f7f3;border-left:4px solid #07583f;border-radius:10px"><div style="font-size:11px;color:#718078;text-transform:uppercase;font-weight:700">Votre suggestion</div><strong>'+suggestionsMailEsc_(title)+'</strong></div>':'';
  const body=suggestionsMailEsc_(text).replace(/\n/g,'<br>');
  const html='<div style="background:#f4f7f5;padding:28px 12px;font-family:Arial,sans-serif;color:#173126"><div style="max-width:640px;margin:auto;background:white;border:1px solid #dfe8e2;border-radius:18px;overflow:hidden"><div style="background:#07583f;color:white;padding:20px 24px"><div style="font-size:19px;font-weight:700">Société d’Horticulture et d’Art Floral</div><div style="font-size:12px;opacity:.85">du Bassin de Châteaulin</div></div><div style="padding:24px;font-size:14px;line-height:1.6"><p>'+hello+'</p><p>Vous nous avez récemment transmis une suggestion. Nous revenons vers vous concernant celle-ci.</p>'+suggestion+'<div style="margin:20px 0;padding:18px;background:#fafcfb;border:1px solid #e4ebe7;border-radius:12px">'+body+'</div><p>Cordialement,<br><strong>Société d’Horticulture et d’Art Floral du Bassin de Châteaulin</strong></p></div></div></div>';
  const plain=(name?'Bonjour '+name+',':'Bonjour,')+'\n\nVous nous avez récemment transmis une suggestion. Nous revenons vers vous concernant celle-ci.'+(title?'\n\nVotre suggestion : '+title:'')+'\n\n'+text+'\n\nCordialement,\nSociété d’Horticulture et d’Art Floral du Bassin de Châteaulin';
  GmailApp.sendEmail(to,subject,plain,{htmlBody:html,name:'Société d’Horticulture et d’Art Floral du Bassin de Châteaulin'});
  const id=Utilities.getUuid(); suggestionsMessageHistory_().appendRow([id,new Date(),ref,to,name,subject,text,'Envoyé']);
  return {ok:true,id:id,to:to};
}