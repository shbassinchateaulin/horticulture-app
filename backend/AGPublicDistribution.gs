// AGPublicDistribution.gs — diffusion adhérents + questionnaire public AG
// Utilise la base centrale définie dans Adherents.gs.

const AG_DISTRIBUTION_SHEET='AG Diffusion';
const AG_DISTRIBUTION_HEADERS=['id','campaignId','memberId','firstName','lastName','email','tokenHash','kind','sentAt','respondedAt','lastError','createdAt'];
const AG_PUBLIC_APP_URL='https://shbassinchateaulin.github.io/horticulture-app/consultation.html';
const AG_PUBLIC_SHARE_PREFIX='AG_PUBLIC_SHARE_';
const AG_PUBLIC_RESPONSES_SHEET='AG Réponses publiques';

function agDistributionSheet_(){return adherentsSheet_(AG_DISTRIBUTION_SHEET,AG_DISTRIBUTION_HEADERS)}
function agPublicResponsesSheet_(){return agSheet_(AG_PUBLIC_RESPONSES_SHEET,AG_RESPONSE_HEADERS)}
function agActiveMembers_(){
  return activeAdherents_().map(m=>({
    id:String(m.id||''),firstName:String(m.firstName||''),lastName:String(m.lastName||''),
    email:String(m.email||'').trim().toLowerCase(),active:m.active!==false,season:String(m.season||'')
  }));
}
function agRandomToken_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'')}
function agTokenHash_(token){return sha256_(String(token||''))}
function agCampaignServer_(id){
  agEnsureDb_();
  const sh=agSheet_(AG_CAMPAIGNS_SHEET,AG_CAMPAIGN_HEADERS);if(sh.getLastRow()<2)return null;
  const rows=sh.getDataRange().getValues().slice(1),r=rows.find(x=>String(x[0])===String(id));if(!r)return null;
  const c=agCampaignFromRow_(r),seen={};
  const addRows=shx=>{if(shx.getLastRow()<2)return;shx.getDataRange().getValues().slice(1).forEach(x=>{if(String(x[1])!==String(id)||!x[0])return;const rid=String(x[0]);if(seen[rid])return;seen[rid]=1;c.responses.push(agResponseFromRow_(x))})};
  addRows(agSheet_(AG_RESPONSES_SHEET,AG_RESPONSE_HEADERS));
  addRows(agPublicResponsesSheet_());
  const ash=agSheet_(AG_AUDIT_SHEET,AG_AUDIT_HEADERS);if(ash.getLastRow()>=2)ash.getDataRange().getValues().slice(1).forEach(x=>{if(String(x[1])===String(id)&&x[0])c.audit.push(agAuditFromRow_(x))});
  c.responses.sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt)));
  c.audit.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  return c;
}
function agFindDistributionByToken_(token){
  const sh=agDistributionSheet_();if(sh.getLastRow()<2)return null;
  const wanted=agTokenHash_(token),rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++)if(String(rows[i][6]||'')===wanted)return{sheet:sh,row:i+1,data:rows[i]};
  return null;
}
function agPublicShareToken_(campaignId){
  campaignId=String(campaignId||'');if(!campaignId)return'';
  const props=PropertiesService.getScriptProperties(),key=AG_PUBLIC_SHARE_PREFIX+campaignId;
  let token=props.getProperty(key);if(!token){token=campaignId+'.'+agRandomToken_();props.setProperty(key,token)}return token;
}
function agPublicShareCampaignId_(token){
  token=String(token||'');const p=token.indexOf('.');if(p<1)return'';
  const campaignId=token.slice(0,p),saved=PropertiesService.getScriptProperties().getProperty(AG_PUBLIC_SHARE_PREFIX+campaignId);
  return saved&&saved===token?campaignId:'';
}
function agGetPublicShare_(campaignId,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  const c=agCampaignServer_(campaignId);if(!c)return{ok:false,error:'Questionnaire introuvable.'};
  const token=agPublicShareToken_(campaignId);
  return{ok:true,campaignId:String(campaignId),status:String(c.status||''),token:token,url:AG_PUBLIC_APP_URL+'?t='+encodeURIComponent(token)};
}
function agGetLiveCampaign_(campaignId,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  const c=agCampaignServer_(campaignId);if(!c)return{ok:false,error:'Questionnaire introuvable.'};
  return{ok:true,campaign:c,responseCount:(c.responses||[]).length};
}
function agDistributionSummary_(campaignId,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  adherentsEnsureDb_();
  const members=agActiveMembers_(),withEmail=members.filter(m=>m.email);
  const sh=agDistributionSheet_(),rows=sh.getLastRow()<2?[]:sh.getDataRange().getValues().slice(1).filter(r=>String(r[1])===String(campaignId)&&String(r[7]||'')==='member');
  const sent=rows.filter(r=>r[8]).length,responded=rows.filter(r=>r[9]).length,failed=rows.filter(r=>r[10]).length;
  const c=agCampaignServer_(campaignId),responses=(c&&c.responses||[]).length;
  return{ok:true,totalMembers:members.length,withEmail:withEmail.length,withoutEmail:members.length-withEmail.length,prepared:rows.length,sent:sent,responded:responded,responses:responses,failed:failed,remaining:Math.max(0,sent-responded),mailQuota:MailApp.getRemainingDailyQuota(),membersSpreadsheetId:ADHERENTS_SPREADSHEET_ID};
}
function agPrepareDistribution_(campaignId,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  const c=agCampaignServer_(campaignId);if(!c)return{ok:false,error:'Questionnaire introuvable.'};
  adherentsEnsureDb_();
  const members=agActiveMembers_(),sh=agDistributionSheet_();
  const existing=sh.getLastRow()<2?[]:sh.getDataRange().getValues().slice(1);
  const existingKeys=new Set(existing.filter(r=>String(r[1])===String(campaignId)&&String(r[7]||'')==='member').map(r=>String(r[2])+'|'+String(r[5]).toLowerCase()));
  let created=0;
  members.filter(m=>m.email).forEach(m=>{const key=String(m.id)+'|'+m.email;if(existingKeys.has(key))return;const token=agRandomToken_(),id=Utilities.getUuid(),at=new Date().toISOString();sh.appendRow([id,String(campaignId),m.id,m.firstName,m.lastName,m.email,agTokenHash_(token),'member','','','',at]);created++});
  SpreadsheetApp.flush();const summary=agDistributionSummary_(campaignId,userId,generation);summary.created=created;return summary;
}
function agMailHtml_(c,firstName,link,reminder){
  const hello=firstName?'Bonjour '+escapeHtml_(firstName)+',':'Bonjour,';
  const lead=reminder?'Nous nous permettons de vous rappeler que la consultation est toujours ouverte.':'La Société d’Horticulture et d’Art Floral du Bassin de Châteaulin vous invite à participer à sa consultation.';
  return '<div style="margin:0;background:#f3f7f4;padding:28px 12px;font-family:Arial,sans-serif;color:#173126"><div style="max-width:640px;margin:auto;background:#fff;border:1px solid #dfe8e2;border-radius:20px;overflow:hidden"><div style="background:#07583f;padding:28px 30px;color:#fff"><div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85">Société d’Horticulture et d’Art Floral</div><div style="font-size:21px;font-weight:700;margin-top:4px">du Bassin de Châteaulin</div></div><div style="padding:30px"><p style="margin-top:0">'+hello+'</p><p>'+lead+'</p><div style="background:#edf7f1;border-radius:14px;padding:18px;margin:22px 0"><div style="font-size:12px;color:#5f7168;text-transform:uppercase;font-weight:700">Consultation — Assemblée générale</div><div style="font-size:22px;font-weight:800;color:#07583f;margin-top:5px">'+escapeHtml_(c.title||'Questionnaire AG')+'</div>'+(c.year?'<div style="margin-top:5px;color:#65776e">'+escapeHtml_(c.year)+'</div>':'')+'</div><p>Votre avis nous aide à préparer les activités, sorties et projets de l’association. Le questionnaire ne prend que quelques minutes.</p><p style="text-align:center;margin:30px 0"><a href="'+link+'" style="display:inline-block;background:#08704c;color:white;text-decoration:none;font-weight:800;padding:15px 24px;border-radius:11px">Répondre au questionnaire</a></p><p style="font-size:12px;color:#708079">Ce lien vous est personnel. Merci de ne pas le transférer.</p><p style="margin-bottom:0">Merci pour votre participation.<br><b>Le Bureau</b></p></div></div></div>';
}
function agRegenerateTokenForRow_(sh,row){const token=agRandomToken_();sh.getRange(row,7).setValue(agTokenHash_(token));return token}
function agSendInvitations_(campaignId,userId,generation,reminder){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  const c=agCampaignServer_(campaignId);if(!c)return{ok:false,error:'Questionnaire introuvable.'};
  if(c.status!=='open')return{ok:false,error:'Ouvre d’abord la consultation avant d’envoyer les e-mails.'};
  agPrepareDistribution_(campaignId,userId,generation);
  const sh=agDistributionSheet_(),rows=sh.getDataRange().getValues();let sent=0,skipped=0,failed=0,quota=MailApp.getRemainingDailyQuota();
  for(let i=1;i<rows.length;i++){
    const r=rows[i];if(String(r[1])!==String(campaignId)||String(r[7])!=='member')continue;
    const alreadySent=!!r[8],alreadyResponded=!!r[9];if((!reminder&&alreadySent)||(reminder&&(!alreadySent||alreadyResponded))){skipped++;continue}
    if(quota<=0){sh.getRange(i+1,11).setValue('Quota e-mail atteint');failed++;continue}
    const email=String(r[5]||'').trim();if(!email){skipped++;continue}
    const token=agRegenerateTokenForRow_(sh,i+1),link=AG_PUBLIC_APP_URL+'?t='+encodeURIComponent(token);
    try{const subject=(reminder?'Rappel — ':'')+'Votre avis compte — '+String(c.title||'Consultation AG');MailApp.sendEmail({to:email,subject:subject,body:'Bonjour '+String(r[3]||'')+',\n\nRépondez à la consultation : '+link+'\n\nMerci pour votre participation.\nLe Bureau',htmlBody:agMailHtml_(c,String(r[3]||''),link,!!reminder),name:"Société d’Horticulture du Bassin de Châteaulin"});sh.getRange(i+1,9).setValue(new Date().toISOString());sh.getRange(i+1,11).clearContent();sent++;quota--}catch(err){sh.getRange(i+1,11).setValue(String(err));failed++}
  }
  SpreadsheetApp.flush();const summary=agDistributionSummary_(campaignId,userId,generation);summary.sentNow=sent;summary.skipped=skipped;summary.failedNow=failed;return summary;
}
function agPublicCampaign_(token,previewId){
  if(previewId){const c=agCampaignServer_(previewId);if(!c||c.status!=='open')return{ok:false,error:'Cette consultation n’est pas disponible.'};return{ok:true,preview:true,campaign:{id:c.id,title:c.title,year:c.year,status:c.status,settings:c.settings,sections:c.sections}}}
  const sharedId=agPublicShareCampaignId_(token);if(sharedId){const c=agCampaignServer_(sharedId);if(!c||c.status!=='open')return{ok:false,error:'Cette consultation est clôturée ou indisponible.'};return{ok:true,shared:true,alreadyResponded:false,member:{firstName:'',lastName:''},campaign:{id:c.id,title:c.title,year:c.year,status:c.status,settings:c.settings,sections:c.sections}}}
  const d=agFindDistributionByToken_(token);if(!d)return{ok:false,error:'Lien invalide ou expiré.'};const r=d.data,c=agCampaignServer_(String(r[1]||''));if(!c||c.status!=='open')return{ok:false,error:'Cette consultation est clôturée ou indisponible.'};return{ok:true,alreadyResponded:!!r[9],member:{firstName:String(r[3]||''),lastName:String(r[4]||'')},campaign:{id:c.id,title:c.title,year:c.year,status:c.status,settings:c.settings,sections:c.sections}};
}
function agSubmitPublicResponse_(token,answers){
  const sharedId=agPublicShareCampaignId_(token);let d=null,r=null,c=null,shared=false;
  if(sharedId){shared=true;c=agCampaignServer_(sharedId)}else{d=agFindDistributionByToken_(token);if(!d)return{ok:false,error:'Lien invalide ou expiré.'};r=d.data;if(r[9])return{ok:false,error:'Une réponse a déjà été enregistrée avec ce lien.',alreadyResponded:true};c=agCampaignServer_(String(r[1]||''))}
  if(!c||c.status!=='open')return{ok:false,error:'Cette consultation n’est plus ouverte.'};answers=answers||{};const qs=(c.sections||[]).flatMap(s=>s.questions||[]);
  const missing=qs.filter(q=>q.required&&(Array.isArray(answers[q.id])?answers[q.id].length===0:String(answers[q.id]??'').trim()===''));if(missing.length)return{ok:false,error:'Certaines questions obligatoires ne sont pas renseignées.'};
  const identity=((c.settings||{}).identityMode||((c.settings||{}).anonymous?'anonymous':'optional')),first=shared||identity==='anonymous'?'':String(r[3]||''),last=shared||identity==='anonymous'?'':String(r[4]||'');
  const filled=qs.filter(q=>Array.isArray(answers[q.id])?answers[q.id].length:String(answers[q.id]??'').trim()).length,at=new Date().toISOString(),responseId=Utilities.getUuid(),completion=qs.length?Math.round(filled*100/qs.length):0;
  agPublicResponsesSheet_().appendRow([responseId,c.id,first,last,[first,last].filter(Boolean).join(' '),shared?'public':'email',at,at,JSON.stringify(answers),completion]);
  if(!shared)d.sheet.getRange(d.row,10).setValue(at);
  agSheet_(AG_AUDIT_SHEET,AG_AUDIT_HEADERS).appendRow([Utilities.getUuid(),c.id,at,'Réponse numérique reçue',shared?'Lien public / QR code':'Questionnaire en ligne']);
  SpreadsheetApp.flush();return{ok:true,message:'Merci, votre réponse a bien été enregistrée.'};
}

const agBaseDoGet_=doGet;
doGet=function(e){
  const a=String((e&&e.parameter&&e.parameter.action)||'');
  if(a==='getAGPublic')return json_(agPublicCampaign_(e.parameter.t||'',e.parameter.preview||''));
  if(a==='getAGDistributionSummary')return json_(agDistributionSummary_(e.parameter.campaignId||'',e.parameter.userId||'',e.parameter.generation||''));
  if(a==='getAGCampaignLive')return json_(agGetLiveCampaign_(e.parameter.campaignId||'',e.parameter.userId||'',e.parameter.generation||''));
  return agBaseDoGet_(e);
};
const agBaseDoPost_=doPost;
doPost=function(e){
  try{const b=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');if(b.action==='prepareAGDistribution')return json_(agPrepareDistribution_(b.campaignId||'',b.userId||'',b.generation||''));if(b.action==='sendAGInvitations')return json_(agSendInvitations_(b.campaignId||'',b.userId||'',b.generation||'',false));if(b.action==='remindAGInvitations')return json_(agSendInvitations_(b.campaignId||'',b.userId||'',b.generation||'',true));if(b.action==='getAGPublicShare')return json_(agGetPublicShare_(b.campaignId||'',b.userId||'',b.generation||''));if(b.action==='submitAGPublicResponse')return json_(agSubmitPublicResponse_(b.t||'',b.answers||{}))}catch(err){return json_({ok:false,error:String(err)})}
  return agBaseDoPost_(e);
};

function initialiserBaseAdherentsEtDiffusionAG(){const ss=adherentsEnsureDb_();agDistributionSheet_();agPublicResponsesSheet_();return 'Base Adhérents et diffusion AG prête dans « '+ss.getName()+' »'}
