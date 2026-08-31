// Messagerie.gs — messagerie intégrée de l'application d'administration
// À copier dans le même projet Apps Script que Code.gs puis redéployer le Web App.

const MESSAGERIE_HISTORY_SHEET = 'Historique messages';
const MESSAGERIE_SENDER_NAME = 'Société d’Horticulture et d’Art Floral du Bassin de Châteaulin';

function messagerieSpreadsheet_() {
  if (typeof adminSpreadsheet_ === 'function') return adminSpreadsheet_();
  if (typeof getSpreadsheet_ === 'function') return getSpreadsheet_();
  if (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID) return SpreadsheetApp.openById(SPREADSHEET_ID);
  return SpreadsheetApp.getActiveSpreadsheet();
}

function messagerieHistorySheet_() {
  const ss = messagerieSpreadsheet_();
  if (!ss) throw new Error('Classeur Administration introuvable.');
  let sh = ss.getSheetByName(MESSAGERIE_HISTORY_SHEET);
  if (!sh) sh = ss.insertSheet(MESSAGERIE_HISTORY_SHEET);
  if (sh.getLastRow() === 0) sh.appendRow(['ID','Date','Utilisateur ID','Utilisateur','Contexte','Référence','Destinataire','Nom destinataire','Objet','Message','Statut']);
  return sh;
}

function messagerieEsc_(s) {
  return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function messagerieValidEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim());
}

function messagerieDisplayName_(o) {
  return String(o.recipientName || o.name || '').trim();
}

function sendIntegratedMessage_(o) {
  o = o || {};
  const to = String(o.to || o.email || '').trim();
  const message = String(o.message || '').trim();
  const context = String(o.context || 'general').trim().toLowerCase();
  const reference = String(o.reference || o.contextId || '').trim();
  const recipientName = messagerieDisplayName_(o);
  const userId = String(o.userId || '').trim();
  const userName = String(o.userName || o.senderName || '').trim() || 'Administration';
  if (!messagerieValidEmail_(to)) return {ok:false,error:'Adresse e-mail du destinataire invalide.'};
  if (!message) return {ok:false,error:'Écris un message avant de l’envoyer.'};
  if (message.length > 10000) return {ok:false,error:'Le message est trop long.'};

  let intro = 'Nous revenons vers vous à la suite de votre échange avec notre association.';
  let subject = 'Message de la Société d’Horticulture';
  let contextLabel = '';
  if (context === 'suggestion') {
    intro = 'Vous nous avez récemment transmis une suggestion. Nous revenons vers vous concernant celle-ci.';
    subject = 'À propos de votre suggestion';
    contextLabel = String(o.contextTitle || o.title || '').trim();
  } else if (context === 'adherent' || context === 'adherents') {
    intro = 'Nous vous contactons dans le cadre de votre adhésion à notre association.';
    subject = 'Votre adhésion — Société d’Horticulture';
  }
  if (String(o.subject || '').trim()) subject = String(o.subject).trim();

  const hello = recipientName ? 'Bonjour ' + messagerieEsc_(recipientName) + ',' : 'Bonjour,';
  const contextHtml = contextLabel ? '<div style="margin:18px 0;padding:14px 16px;background:#f2f7f4;border-left:4px solid #07583f;border-radius:10px"><div style="font-size:12px;color:#64756c;margin-bottom:4px">Votre suggestion</div><strong style="color:#173126">'+messagerieEsc_(contextLabel)+'</strong></div>' : '';
  const bodyHtml = messagerieEsc_(message).replace(/\n/g,'<br>');
  const html = '<div style="background:#f4f7f5;padding:28px 12px;font-family:Arial,sans-serif;color:#173126"><div style="max-width:640px;margin:auto;background:#fff;border:1px solid #dfe8e2;border-radius:18px;overflow:hidden"><div style="background:#07583f;color:white;padding:20px 24px"><div style="font-size:19px;font-weight:700">Société d’Horticulture et d’Art Floral</div><div style="font-size:12px;opacity:.85;margin-top:3px">du Bassin de Châteaulin</div></div><div style="padding:24px;font-size:14px;line-height:1.6"><p>'+hello+'</p><p>'+messagerieEsc_(intro)+'</p>'+contextHtml+'<div style="margin:20px 0;padding:18px;background:#fafcfb;border:1px solid #e4ebe7;border-radius:12px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:#78877f;font-weight:700;margin-bottom:8px">Message de notre équipe</div>'+bodyHtml+'</div><p style="margin-top:24px">Cordialement,<br><strong>'+messagerieEsc_(MESSAGERIE_SENDER_NAME)+'</strong></p></div></div></div>';
  const plain = (recipientName ? 'Bonjour '+recipientName+',' : 'Bonjour,')+'\n\n'+intro+(contextLabel?'\n\nVotre suggestion : '+contextLabel:'')+'\n\nMessage de notre équipe :\n'+message+'\n\nCordialement,\n'+MESSAGERIE_SENDER_NAME;

  const options = {name:MESSAGERIE_SENDER_NAME,htmlBody:html};
  const alias = String(PropertiesService.getScriptProperties().getProperty('MESSAGERIE_FROM_ALIAS') || '').trim();
  if (alias) {
    const aliases = GmailApp.getAliases().map(String);
    if (aliases.indexOf(alias) >= 0) options.from = alias;
  }
  GmailApp.sendEmail(to, subject, plain, options);

  const id = Utilities.getUuid(), now = new Date();
  messagerieHistorySheet_().appendRow([id,now,userId,userName,context,reference,to,recipientName,subject,message,'Envoyé']);
  return {ok:true,id:id,sentAt:now.toISOString(),to:to,subject:subject};
}

function listIntegratedMessages_(o) {
  o = o || {};
  const context = String(o.context || '').trim().toLowerCase(), reference = String(o.reference || o.contextId || '').trim();
  const sh = messagerieHistorySheet_(), last = sh.getLastRow();
  if (last < 2) return {ok:true,messages:[]};
  const v = sh.getRange(2,1,last-1,11).getValues(), out=[];
  v.forEach(function(r){
    if (context && String(r[4]||'').toLowerCase() !== context) return;
    if (reference && String(r[5]||'') !== reference) return;
    out.push({id:String(r[0]||''),date:r[1] instanceof Date?r[1].toISOString():String(r[1]||''),userId:String(r[2]||''),userName:String(r[3]||''),context:String(r[4]||''),reference:String(r[5]||''),to:String(r[6]||''),recipientName:String(r[7]||''),subject:String(r[8]||''),message:String(r[9]||''),status:String(r[10]||'')});
  });
  out.reverse();
  return {ok:true,messages:out.slice(0,50)};
}
