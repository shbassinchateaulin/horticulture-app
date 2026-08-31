// Messagerie.gs — messagerie intégrée de l'application d'administration
// À copier dans le même projet Apps Script que Code.gs puis redéployer le Web App.

const MESSAGERIE_HISTORY_SHEET = 'Historique messages';
const MESSAGERIE_SENDER_NAME = 'Société d’Horticulture et d’Art Floral du Bassin de Châteaulin';
const MESSAGERIE_LOGO_URL = 'https://shbassinchateaulin.github.io/horticulture-app/logo-admin-transparent.png';

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
  let heading = 'Un message pour vous';
  let eyebrow = 'Société d’Horticulture et d’Art Floral';
  if (context === 'suggestion') {
    intro = 'Vous nous avez récemment transmis une suggestion. Nous revenons vers vous concernant celle-ci.';
    subject = 'À propos de votre suggestion';
    contextLabel = String(o.contextTitle || o.title || '').trim();
    heading = 'À propos de votre suggestion';
    eyebrow = 'Votre suggestion a retenu notre attention';
  } else if (context === 'adherent' || context === 'adherents') {
    intro = 'Nous vous contactons dans le cadre de votre adhésion à notre association.';
    subject = 'Votre adhésion — Société d’Horticulture';
    heading = 'Un message concernant votre adhésion';
    eyebrow = 'Société d’Horticulture et d’Art Floral';
  }
  if (String(o.subject || '').trim()) subject = String(o.subject).trim();

  const hello = recipientName ? 'Bonjour ' + messagerieEsc_(recipientName) + ',' : 'Bonjour,';
  const bodyHtml = messagerieEsc_(message).replace(/\n/g,'<br>');
  const contextHtml = contextLabel
    ? '<div style="margin:28px 0 0;background:#f1f5ed;border-radius:22px;padding:22px 24px;text-align:left"><div style="font-size:13px;font-weight:700;color:#56645b;margin-bottom:8px">Votre suggestion</div><div style="font-family:Georgia,Times New Roman,serif;font-size:20px;line-height:1.35;color:#294f3a;font-weight:700">'+messagerieEsc_(contextLabel)+'</div></div>'
    : '';

  const html = '<!doctype html><html><body style="margin:0;padding:0;background:#f7f4ed;font-family:Arial,Helvetica,sans-serif;color:#303a34">'
    +'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ed;padding:30px 12px"><tr><td align="center">'
    +'<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#ffffff;border-radius:32px;overflow:hidden">'
    +'<tr><td style="padding:44px 46px 24px;text-align:center">'
    +'<img src="'+MESSAGERIE_LOGO_URL+'" alt="Société d’Horticulture" width="118" style="display:block;margin:0 auto 24px;max-width:118px;height:auto">'
    +'<div style="font-size:12px;line-height:1.4;color:#6f786f;text-transform:uppercase;letter-spacing:1.5px;font-weight:700">'+messagerieEsc_(eyebrow)+'</div>'
    +'<h1 style="margin:12px 0 10px;font-family:Georgia,Times New Roman,serif;font-size:34px;line-height:1.15;color:#315f45;font-weight:700">'+messagerieEsc_(heading)+'</h1>'
    +'<p style="margin:0 auto;max-width:540px;font-size:16px;line-height:1.65;color:#646d66">'+messagerieEsc_(intro)+'</p>'
    +contextHtml
    +'</td></tr>'
    +'<tr><td style="padding:8px 46px 42px">'
    +'<div style="border-top:1px solid #e8ece7;padding-top:28px;text-align:left">'
    +'<p style="margin:0 0 18px;font-size:16px;line-height:1.7;color:#333d37">'+hello+'</p>'
    +'<div style="font-size:16px;line-height:1.75;color:#333d37">'+bodyHtml+'</div>'
    +'<p style="margin:30px 0 0;font-size:16px;line-height:1.65;color:#333d37">Bien cordialement,<br><strong style="color:#315f45">'+messagerieEsc_(MESSAGERIE_SENDER_NAME)+'</strong></p>'
    +'</div></td></tr>'
    +'<tr><td style="padding:0 46px 38px;text-align:center;color:#8a928c;font-size:11px;line-height:1.6">'
    +'Ce message vous est adressé par la Société d’Horticulture et d’Art Floral du Bassin de Châteaulin.'
    +'</td></tr>'
    +'</table></td></tr></table></body></html>';

  const plain = (recipientName ? 'Bonjour '+recipientName+',' : 'Bonjour,')+'\n\n'+intro+(contextLabel?'\n\nVotre suggestion : '+contextLabel:'')+'\n\n'+message+'\n\nBien cordialement,\n'+MESSAGERIE_SENDER_NAME;

  MailApp.sendEmail({
    to:to,
    subject:subject,
    body:plain,
    htmlBody:html,
    name:MESSAGERIE_SENDER_NAME
  });

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
