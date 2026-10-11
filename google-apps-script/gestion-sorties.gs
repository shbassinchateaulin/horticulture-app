/**
 * Gestion des sorties — module autonome Google Sheets / Apps Script.
 * À installer dans le projet Apps Script lié au classeur de gestion.
 * AUCUN envoi n'est actif tant que SETTINGS!B2 n'est pas "OUI".
 * Les liens de paiement personnels doivent être fournis par un connecteur
 * HelloAsso sécurisé : ne jamais réutiliser le lien public d'inscription.
 */
const SG={
 raw:'https://raw.githubusercontent.com/shbassinchateaulin/horticulture-contenus/main/sorties/index.json',
 headers:{
  Sorties:['ID','Nom','Date sortie','URL HelloAsso','État','Notifié le','Tarif adhérent (€)','Tarif non-adhérent (€)','Tarifs validés le','Responsable e-mail'],
  Echeances:['ID sortie','N°','Date envoi','Date limite','Montant (€)','Variable (OUI/NON)','Rappel envoyé le'],
  Inscrits:['ID inscription','ID sortie','Nom','Prénom','E-mail','Adhérent (OUI/NON)','Formule','Montant réglé (€)','Lien de paiement personnel','Source'],
  Paiements:['ID inscription','ID sortie','N° échéance','Montant dû (€)','Montant confirmé (€)','Envoyé le','Relancé le','Statut','Référence HelloAsso'],
  Parametres:['Clé','Valeur']
 }
};
function sgBook_(){const s=SpreadsheetApp.getActiveSpreadsheet();if(!s)throw Error('Lier le script à un Google Sheets.');return s}
function sgTab_(n){return sgBook_().getSheetByName(n)}
function sgRows_(n){const a=sgTab_(n).getDataRange().getValues();return a.slice(1).map((r,i)=>({r,i:i+2}))}
function sgKey_(k){const r=sgRows_('Parametres').find(x=>x.r[0]===k);return r?String(r.r[1]).trim():''}
function sgDate_(v){if(v instanceof Date)return Utilities.formatDate(v,'Europe/Paris','yyyy-MM-dd');return String(v||'').slice(0,10)}
function sgToday_(){return Utilities.formatDate(new Date(),'Europe/Paris','yyyy-MM-dd')}
function sgMail_(to,subject,body){if(!to||!/^\S+@\S+\.\S+$/.test(to))return false;if(sgKey_('ENVOIS_ACTIFS')!=='OUI')return false;MailApp.sendEmail({to,subject,body,name:'Société d’Horticulture du Bassin de Châteaulin'});return true}
function installerGestionSorties(){
 const ss=sgBook_();Object.keys(SG.headers).forEach(n=>{let s=ss.getSheetByName(n);if(!s)s=ss.insertSheet(n);if(s.getLastRow()===0)s.appendRow(SG.headers[n]);s.setFrozenRows(1);s.getRange(1,1,1,SG.headers[n].length).setFontWeight('bold').setBackground('#dce9df');});
 const p=sgTab_('Parametres');if(p.getLastRow()===1)[['ENVOIS_ACTIFS','NON'],['EMAIL_ASSOCIATION',''],['URL_ADMINISTRATION',''],['SOURCE_INSCRIPTIONS','Import contrôlé depuis HelloAsso'],['NOTE','Les liens de paiement doivent être personnels et vérifiés']].forEach(x=>p.appendRow(x));
 ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='traitementQuotidienSorties').forEach(t=>ScriptApp.deleteTrigger(t));
 ScriptApp.newTrigger('traitementQuotidienSorties').timeBased().everyDays(1).atHour(9).create();
}
function sgEntries_(raw){let a=Array.isArray(raw)?raw:(raw.sorties||raw.items||raw.data||[]);return Array.isArray(a)?a:[]}
function detecterNouvellesSorties(){
 const res=UrlFetchApp.fetch(SG.raw,{muteHttpExceptions:true});if(res.getResponseCode()!==200)throw Error('Source sorties inaccessible');
 const entries=sgEntries_(JSON.parse(res.getContentText()));const s=sgTab_('Sorties'),ids=new Set(sgRows_('Sorties').map(x=>String(x.r[0])));let count=0;
 for(const e of entries){const id=String(e.id||e.slug||e.numero||'').trim();if(!id||ids.has(id))continue;
 const name=String(e.title||e.titre||e.name||'Sortie');const url=String(e.helloAssoUrl||e.bookingUrl||'');
 s.appendRow([id,name,e.date||e.startDate||'',url,'À configurer','','','','',sgKey_('EMAIL_ASSOCIATION')]);ids.add(id);count++;
 const email=sgKey_('EMAIL_ASSOCIATION');if(sgMail_(email,'Nouvelle sortie à configurer : '+name,'Une nouvelle sortie a été détectée : '+name+'\n\nOuvrez votre Google Sheets et configurez les tarifs et échéances dans Sorties et Echeances.\n'+sgBook_().getUrl()))s.getRange(s.getLastRow(),6).setValue(new Date());
 }return count;
}
function sgEuros_(v){return Number(String(v).replace(',','.'))||0}
function sgPayRow_(id,n){return sgRows_('Paiements').find(x=>String(x.r[0])===String(id)&&Number(x.r[2])===Number(n))}
function sgPayConfirmed_(id){return sgRows_('Paiements').filter(x=>String(x.r[0])===String(id)).reduce((a,x)=>a+sgEuros_(x.r[4]),0)}
function sgDue_(participant,sortie,echeance){
 const [,, , ,amount,variable]=echeance.r; if(String(variable).toUpperCase()!=='OUI')return sgEuros_(amount);
 if(!sortie.r[8])return null;
 const member=String(participant.r[5]).toUpperCase()==='OUI';const total=sgEuros_(sortie.r[member?6:7]);
 if(total<=0)return null;
 // Montant du dernier appel = tarif total moins paiements confirmés.
 return Math.max(0,Math.round((total-sgPayConfirmed_(participant.r[0]))*100)/100);
}
function sgUpsertPay_(participant,sortie,echeance,due){
 const id=String(participant.r[0]),n=Number(echeance.r[1]);let p=sgPayRow_(id,n);
 if(!p){sgTab_('Paiements').appendRow([id,sortie.r[0],n,due,0,'','','À envoyer','']);p=sgPayRow_(id,n)}
 return p;
}
function envoyerEcheances(){
 const today=sgToday_(),sorties=new Map(sgRows_('Sorties').map(x=>[String(x.r[0]),x]));
 for(const e of sgRows_('Echeances')){
  const sid=String(e.r[0]),s=sorties.get(sid);if(!s||String(s.r[4])!=='Activée'||sgDate_(e.r[2])!==today)continue;
  for(const p of sgRows_('Inscrits').filter(x=>String(x.r[1])===sid)){
   const due=sgDue_(p,s,e);if(due===null||due<=0)continue;
   const pay=sgUpsertPay_(p,s,e,due);if(pay.r[5]||sgEuros_(pay.r[4])>=due)continue;
   const link=String(p.r[8]||'').trim();
   // Blocage volontaire : pas de faux lien personnel, ni d'e-mail sans lien valide.
   if(!/^https:\/\//.test(link))continue;
   const deadline=sgDate_(e.r[3]);
   const body='Bonjour '+String(p.r[3]||p.r[2])+',\n\nPour la sortie « '+s.r[1]+' », votre versement n°'+e.r[1]+' est de '+due.toFixed(2)+' €.\nDate limite : '+deadline+'\nVotre lien de paiement personnel : '+link+'\n\nMerci,\nL’association.';
   if(sgMail_(String(p.r[4]),'Règlement sortie — '+s.r[1],body)){sgTab_('Paiements').getRange(pay.i,6).setValue(new Date());sgTab_('Paiements').getRange(pay.i,8).setValue('Demandé')}
  }
 }
}
function relancerImpayes(){
 const today=sgToday_(),smap=new Map(sgRows_('Sorties').map(x=>[String(x.r[0]),x])),pmap=new Map(sgRows_('Inscrits').map(x=>[String(x.r[0]),x]));
 for(const e of sgRows_('Echeances')){
  const deadline=sgDate_(e.r[3]);if(!/^\d{4}-\d{2}-\d{2}$/.test(deadline))continue;
  const d=new Date(deadline+'T12:00:00Z');d.setUTCDate(d.getUTCDate()-2);
  if(d.toISOString().slice(0,10)!==today)continue;
  for(const pay of sgRows_('Paiements').filter(x=>String(x.r[1])===String(e.r[0])&&Number(x.r[2])===Number(e.r[1]))){
   if(!pay.r[5]||pay.r[6]||sgEuros_(pay.r[4])>=sgEuros_(pay.r[3]))continue;
   const p=pmap.get(String(pay.r[0])),s=smap.get(String(e.r[0]));if(!p||!s||!/^https:\/\//.test(String(p.r[8])))continue;
   const balance=Math.max(0,sgEuros_(pay.r[3])-sgEuros_(pay.r[4]));
   if(sgMail_(String(p.r[4]),'Rappel de règlement — '+s.r[1],'Bonjour,\n\nIl reste '+balance.toFixed(2)+' € à régler avant le '+deadline+' pour « '+s.r[1]+' ».\nLien personnel : '+p.r[8]+'\n\nMerci.'))sgTab_('Paiements').getRange(pay.i,7).setValue(new Date());
  }
 }
}
function rappelerTarifsVariables(){
 const today=sgToday_(),email=sgKey_('EMAIL_ASSOCIATION');
 for(const s of sgRows_('Sorties')){
  const variable=sgRows_('Echeances').filter(e=>String(e.r[0])===String(s.r[0])&&String(e.r[5]).toUpperCase()==='OUI');
  if(!variable.length||s.r[8])continue;
  for(const e of variable){
   const send=new Date(sgDate_(e.r[2])+'T12:00:00Z');if(isNaN(send))continue;
   const offset=(send.toISOString().slice(0,10)==='2027-05-14')?7:7;
   const request=new Date(send);request.setUTCDate(request.getUTCDate()-offset);
   const reminder=new Date(send);reminder.setUTCDate(reminder.getUTCDate()-2);
   if(today!==request.toISOString().slice(0,10)&&today!==reminder.toISOString().slice(0,10))continue;
   sgMail_(String(s.r[9]||email),'Tarifs définitifs à valider — '+s.r[1],'Merci de renseigner les tarifs adhérent et non-adhérent puis la date de validation dans votre tableau Sorties avant le '+sgDate_(e.r[2])+'.\n'+sgBook_().getUrl());
  }
 }
}
function traitementQuotidienSorties(){if(!sgTab_('Parametres'))return;detecterNouvellesSorties();rappelerTarifsVariables();envoyerEcheances();relancerImpayes();}
