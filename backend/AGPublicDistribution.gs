// AGPublicDistribution.gs — diffusion adhérents + questionnaire public AG
// Extension non destructive du routeur Code.gs.

const AG_MEMBERS_SHEET='Adhérents';
const AG_MEMBERS_HEADERS=['id','firstName','lastName','email','active','season','updatedAt'];
const AG_DISTRIBUTION_SHEET='AG Diffusion';
const AG_DISTRIBUTION_HEADERS=['id','campaignId','memberId','firstName','lastName','email','tokenHash','kind','sentAt','respondedAt','lastError','createdAt'];
const AG_PUBLIC_APP_URL='https://shbassinchateaulin.github.io/horticulture-app/consultation.html';

function agMembersSheet_(){
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  let sh=ss.getSheetByName(AG_MEMBERS_SHEET);
  if(!sh)sh=ss.insertSheet(AG_MEMBERS_SHEET);
  if(sh.getLastRow()===0)sh.appendRow(AG_MEMBERS_HEADERS);
  else{
    const row=sh.getRange(1,1,1,Math.max(sh.getLastColumn(),AG_MEMBERS_HEADERS.length)).getValues()[0];
    AG_MEMBERS_HEADERS.forEach((h,i)=>{if(String(row[i]||'')!==h)sh.getRange(1,i+1).setValue(h)});
  }
  return sh;
}
function agDistributionSheet_(){return agSheet_(AG_DISTRIBUTION_SHEET,AG_DISTRIBUTION_HEADERS)}
function agMemberRows_(){
  const sh=agMembersSheet_();if(sh.getLastRow()<2)return[];
  return sh.getDataRange().getValues().slice(1).filter(r=>r[0]||r[3]).map(r=>({
    id:String(r[0]||Utilities.getUuid()),firstName:String(r[1]||''),lastName:String(r[2]||''),
    email:String(r[3]||'').trim().toLowerCase(),active:String(r[4]).toLowerCase()!=='false',season:String(r[5]||'')
  }));
}
function agActiveMembers_(){return agMemberRows_().filter(m=>m.active)}
function agRandomToken_(){return Utilities.getUuid().replace(/-/g,'')+Utilities.getUuid().replace(/-/g,'')}
function agTokenHash_(token){return sha256_(String(token||''))}
function agCampaignServer_(id){
  agEnsureDb_();
  const sh=agSheet_(AG_CAMPAIGNS_SHEET,AG_CAMPAIGN_HEADERS);if(sh.getLastRow()<2)return null;
  const rows=sh.getDataRange().getValues().slice(1);
  const r=rows.find(x=>String(x[0])===String(id));
  if(!r)return null;
  const c=agCampaignFromRow_(r);
  const rsh=agSheet_(AG_RESPONSES_SHEET,AG_RESPONSE_HEADERS);
  if(rsh.getLastRow()>=2)rsh.getDataRange().getValues().slice(1).forEach(x=>{if(String(x[1])===String(id))c.responses.push(agResponseFromRow_(x))});
  return c;
}
function agFindDistributionByToken_(token){
  const sh=agDistributionSheet_();if(sh.getLastRow()<2)return null;
  const wanted=agTokenHash_(token),rows=sh.getDataRange().getValues();
  for(let i=1;i<rows.length;i++)if(String(rows[i][6]||'')===wanted)return{sheet:sh,row:i+1,data:rows[i]};
  return null;
}
function agDistributionSummary_(campaignId,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  const members=agActiveMembers_(),withEmail=members.filter(m=>m.email);
  const sh=agDistributionSheet_(),rows=sh.getLastRow()<2?[]:sh.getDataRange().getValues().slice(1).filter(r=>String(r[1])===String(campaignId));
  const sent=rows.filter(r=>r[8]).length,responded=rows.filter(r=>r[9]).length,failed=rows.filter(r=>r[10]).length;
  return{ok:true,totalMembers:members.length,withEmail:withEmail.length,withoutEmail:members.length-withEmail.length,prepared:rows.length,sent:sent,responded:responded,failed:failed,remaining:Math.max(0,sent-responded),mailQuota:MailApp.getRemainingDailyQuota()};
}
function agPrepareDistribution_(campaignId,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  const c=agCampaignServer_(campaignId);if(!c)return{ok:false,error:'Questionnaire introuvable.'};
  const members=agActiveMembers_(),sh=agDistributionSheet_();
  const existing=sh.getLastRow()<2?[]:sh.getDataRange().getValues().slice(1);
  const existingKeys=new Set(existing.filter(r=>String(r[1])===String(campaignId)).map(r=>String(r[2])+'|'+String(r[5]).toLowerCase()));
  const created=[];
  members.filter(m=>m.email).forEach(m=>{
    const key=String(m.id)+'|'+m.email;
    if(existingKeys.has(key))return;
    const token=agRandomToken_(),id=Utilities.getUuid(),at=new Date().toISOString();
    sh.appendRow([id,String(campaignId),m.id,m.firstName,m.lastName,m.email,agTokenHash_(token),'member','','','',at]);
    created.push({id:id,memberId:m.id,email:m.email,token:token});
  });
  SpreadsheetApp.flush();
  const summary=agDistributionSummary_(campaignId,userId,generation);
  summary.created=created.length;
  return summary;
}
function agMailHtml_(c,firstName,link,reminder){
  const hello=firstName?'Bonjour '+escapeHtml_(firstName)+',':'Bonjour,';
  const lead=reminder?'Nous nous permettons de vous rappeler que la consultation est toujours ouverte.':'La Société d’Horticulture et d’Art Floral du Bassin de Châteaulin vous invite à participer à sa consultation.';
  return '<div style="margin:0;background:#f3f7f4;padding:28px 12px;font-family:Arial,sans-serif;color:#173126">'+
    '<div style="max-width:640px;margin:auto;background:#fff;border:1px solid #dfe8e2;border-radius:20px;overflow:hidden">'+
      '<div style="background:linear-gradient(135deg,#07583f,#063d2f);padding:28px 30px;color:#fff">'+
        '<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.85">Société d’Horticulture et d’Art Floral</div>'+
        '<div style="font-size:21px;font-weight:700;margin-top:4px">du Bassin de Châteaulin</div>'+
      '</div>'+
      '<div style="padding:30px">'+
        '<p style="margin-top:0">'+hello+'</p><p>'+lead+'</p>'+
        '<div style="background:#edf7f1;border-radius:14px;padding:18px;margin:22px 0"><div style="font-size:12px;color:#5f7168;text-transform:uppercase;font-weight:700">Consultation — Assemblée générale</div><div style="font-size:22px;font-weight:800;color:#07583f;margin-top:5px">'+escapeHtml_(c.title||'Questionnaire AG')+'</div>'+(c.year?'<div style="margin-top:5px;color:#65776e">'+escapeHtml_(c.year)+'</div>':'')+'</div>'+
        '<p>Votre avis nous aide à préparer les activités, sorties et projets de l’association. Le questionnaire ne prend que quelques minutes.</p>'+
        '<p style="text-align:center;margin:30px 0"><a href="'+link+'" style="display:inline-block;background:#08704c;color:white;text-decoration:none;font-weight:800;padding:15px 24px;border-radius:11px">Répondre au questionnaire</a></p>'+
        '<p style="font-size:12px;color:#708079">Ce lien vous est personnel. Merci de ne pas le transférer.</p>'+
        '<p style="margin-bottom:0">Merci pour votre participation.<br><b>Le Bureau</b></p>'+
      '</div>'+
    '</div></div>';
}
function agSendInvitations_(campaignId,userId,generation,reminder){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  const c=agCampaignServer_(campaignId);if(!c)return{ok:false,error:'Questionnaire introuvable.'};
  if(c.status!=='open')return{ok:false,error:'Ouvre d’abord la consultation avant d’envoyer les e-mails.'};
  agPrepareDistribution_(campaignId,userId,generation);
  const sh=agDistributionSheet_(),rows=sh.getDataRange().getValues();
  let sent=0,skipped=0,failed=0,quota=MailApp.getRemainingDailyQuota();
  for(let i=1;i<rows.length;i++){
    const r=rows[i];if(String(r[1])!==String(campaignId)||String(r[7])!=='member')continue;
    const alreadySent=!!r[8],alreadyResponded=!!r[9];
    if((!reminder&&alreadySent)||(reminder&&(!alreadySent||alreadyResponded))){skipped++;continue}
    if(quota<=0){sh.getRange(i+1,11).setValue('Quota e-mail atteint');failed++;continue}
    const email=String(r[5]||'').trim();if(!email){skipped++;continue}
    const tokenRow=agRegenerateTokenForRow_(sh,i+1,r);
    const link=AG_PUBLIC_APP_URL+'?t='+encodeURIComponent(tokenRow.token);
    try{
      const subject=(reminder?'Rappel — ':'')+'Votre avis compte — '+String(c.title||'Consultation AG');
      MailApp.sendEmail({to:email,subject:subject,body:'Bonjour '+String(r[3]||'')+',\n\nRépondez à la consultation : '+link+'\n\nMerci pour votre participation.\nLe Bureau',htmlBody:agMailHtml_(c,String(r[3]||''),link,!!reminder),name:"Société d’Horticulture du Bassin de Châteaulin"});
      sh.getRange(i+1,9).setValue(new Date().toISOString());sh.getRange(i+1,11).clearContent();sent++;quota--;
    }catch(err){sh.getRange(i+1,11).setValue(String(err));failed++}
  }
  SpreadsheetApp.flush();
  const summary=agDistributionSummary_(campaignId,userId,generation);summary.sentNow=sent;summary.skipped=skipped;summary.failedNow=failed;return summary;
}
function agRegenerateTokenForRow_(sh,row,r){
  const token=agRandomToken_();sh.getRange(row,7).setValue(agTokenHash_(token));return{token:token};
}
function agPublicCampaign_(token,previewId){
  if(previewId){
    const c=agCampaignServer_(previewId);if(!c||c.status!=='open')return{ok:false,error:'Cette consultation n’est pas disponible.'};
    return{ok:true,preview:true,campaign:{id:c.id,title:c.title,year:c.year,status:c.status,settings:c.settings,sections:c.sections}};
  }
  const d=agFindDistributionByToken_(token);if(!d)return{ok:false,error:'Lien invalide ou expiré.'};
  const r=d.data,c=agCampaignServer_(String(r[1]||''));if(!c||c.status!=='open')return{ok:false,error:'Cette consultation est clôturée ou indisponible.'};
  return{ok:true,alreadyResponded:!!r[9],member:{firstName:String(r[3]||''),lastName:String(r[4]||'')},campaign:{id:c.id,title:c.title,year:c.year,status:c.status,settings:c.settings,sections:c.sections}};
}
function agSubmitPublicResponse_(token,answers){
  const d=agFindDistributionByToken_(token);if(!d)return{ok:false,error:'Lien invalide ou expiré.'};
  const r=d.data;if(r[9])return{ok:false,error:'Une réponse a déjà été enregistrée avec ce lien.',alreadyResponded:true};
  const c=agCampaignServer_(String(r[1]||''));if(!c||c.status!=='open')return{ok:false,error:'Cette consultation n’est plus ouverte.'};
  answers=answers||{};const qs=(c.sections||[]).flatMap(s=>s.questions||[]);
  const missing=qs.filter(q=>q.required&&(Array.isArray(answers[q.id])?answers[q.id].length===0:String(answers[q.id]??'').trim()===''));
  if(missing.length)return{ok:false,error:'Certaines questions obligatoires ne sont pas renseignées.'};
  const identity=((c.settings||{}).identityMode||((c.settings||{}).anonymous?'anonymous':'optional'));
  const first=identity==='anonymous'?'':String(r[3]||''),last=identity==='anonymous'?'':String(r[4]||'');
  const filled=qs.filter(q=>Array.isArray(answers[q.id])?answers[q.id].length:String(answers[q.id]??'').trim()).length;
  const at=new Date().toISOString(),responseId=Utilities.getUuid(),completion=qs.length?Math.round(filled*100/qs.length):0;
  const rsh=agSheet_(AG_RESPONSES_SHEET,AG_RESPONSE_HEADERS);
  rsh.appendRow([responseId,c.id,first,last,[first,last].filter(Boolean).join(' '),'email',at,at,JSON.stringify(answers),completion]);
  d.sheet.getRange(d.row,10).setValue(at);
  const ash=agSheet_(AG_AUDIT_SHEET,AG_AUDIT_HEADERS);ash.appendRow([Utilities.getUuid(),c.id,at,'Réponse numérique reçue','Questionnaire en ligne']);
  SpreadsheetApp.flush();
  return{ok:true,message:'Merci, votre réponse a bien été enregistrée.'};
}

// Extension du routeur principal sans modifier Code.gs.
const agBaseDoGet_=doGet;
doGet=function(e){
  const a=String((e&&e.parameter&&e.parameter.action)||'');
  if(a==='getAGPublic')return json_(agPublicCampaign_(e.parameter.t||'',e.parameter.preview||''));
  if(a==='getAGDistributionSummary')return json_(agDistributionSummary_(e.parameter.campaignId||'',e.parameter.userId||'',e.parameter.generation||''));
  return agBaseDoGet_(e);
};
const agBaseDoPost_=doPost;
doPost=function(e){
  try{
    const b=JSON.parse((e&&e.postData&&e.postData.contents)||'{}');
    if(b.action==='prepareAGDistribution')return json_(agPrepareDistribution_(b.campaignId||'',b.userId||'',b.generation||''));
    if(b.action==='sendAGInvitations')return json_(agSendInvitations_(b.campaignId||'',b.userId||'',b.generation||'',false));
    if(b.action==='remindAGInvitations')return json_(agSendInvitations_(b.campaignId||'',b.userId||'',b.generation||'',true));
    if(b.action==='submitAGPublicResponse')return json_(agSubmitPublicResponse_(b.t||'',b.answers||{}));
  }catch(err){return json_({ok:false,error:String(err)})}
  return agBaseDoPost_(e);
};

function initialiserBaseAdherentsEtDiffusionAG(){agMembersSheet_();agDistributionSheet_();return 'Base Adhérents et diffusion AG prête.'}
