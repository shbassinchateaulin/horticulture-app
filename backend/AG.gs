// AG.gs — base partagée Consultation AG
// À ajouter dans le même projet Apps Script que Code.gs et Notifications.gs.
// Les onglets sont créés automatiquement dans le classeur lié au projet.

const AG_DB_SPREADSHEET_ID='1FTCq4E3AA6jRfZpJBQEJPGTYzNw6mN4u3d2cpA4ARkU';
const AG_CAMPAIGNS_SHEET='AG Questionnaires';
const AG_RESPONSES_SHEET='AG Réponses';
const AG_AUDIT_SHEET='AG Journal';
const AG_DELETIONS_SHEET='AG Suppressions';

const AG_CAMPAIGN_HEADERS=[
  'id','title','year','status','createdAt','updatedAt','trashedAt',
  'sourceJson','settingsJson','sectionsJson','createdBy'
];
const AG_RESPONSE_HEADERS=[
  'id','campaignId','respondentFirstName','respondentLastName','respondent',
  'channel','createdAt','updatedAt','answersJson','completion'
];
const AG_AUDIT_HEADERS=['id','campaignId','at','action','detail'];
const AG_DELETION_HEADERS=['campaignId','deletedAt','deletedBy'];

function agDb_(){return SpreadsheetApp.openById(AG_DB_SPREADSHEET_ID)}
function agSheet_(name,headers){
  const ss=agDb_();
  let sh=ss.getSheetByName(name);
  if(!sh)sh=ss.insertSheet(name);
  if(sh.getLastRow()===0)sh.appendRow(headers);
  else{
    const current=sh.getRange(1,1,1,Math.max(headers.length,sh.getLastColumn())).getValues()[0];
    headers.forEach((h,i)=>{if(String(current[i]||'')!==h)sh.getRange(1,i+1).setValue(h)});
  }
  return sh;
}
function agEnsureDb_(){
  agSheet_(AG_CAMPAIGNS_SHEET,AG_CAMPAIGN_HEADERS);
  agSheet_(AG_RESPONSES_SHEET,AG_RESPONSE_HEADERS);
  agSheet_(AG_AUDIT_SHEET,AG_AUDIT_HEADERS);
  agSheet_(AG_DELETIONS_SHEET,AG_DELETION_HEADERS);
}
function agJsonParse_(v,fallback){
  try{return JSON.parse(String(v||''))}catch(_){return fallback}
}
function agIsSuper_(u){
  const k=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  return k(u&&u.username)==='superadmin'||k(u&&u.role).includes('superadmin')||k(u&&u.function).includes('superadmin');
}
function agAuthorize_(userId,generation){
  userId=String(userId||'').trim();
  generation=String(generation||'').trim();
  if(!userId||!generation)return{ok:false,error:'Session AG manquante.'};
  const u=listUsers_().find(x=>String(x.id)===userId&&x.active);
  if(!u)return{ok:false,error:'Utilisateur introuvable ou inactif.'};
  const allowed=agIsSuper_(u)||(u.permissions||[]).map(String).includes('consultation_ag');
  if(!allowed)return{ok:false,error:'Accès Consultation AG refusé.'};
  const server=sessionGeneration_(userId);
  if(!server||server!==generation)return{ok:false,error:'Session expirée.',sessionExpired:true,generation:server||''};
  return{ok:true,user:u};
}
function agCampaignFromRow_(r){
  return{
    id:String(r[0]||''),
    title:String(r[1]||''),
    year:String(r[2]||''),
    status:String(r[3]||'draft'),
    createdAt:String(r[4]||''),
    updatedAt:String(r[5]||''),
    trashedAt:String(r[6]||'')||undefined,
    source:agJsonParse_(r[7],{}),
    settings:agJsonParse_(r[8],{}),
    sections:agJsonParse_(r[9],[]),
    createdBy:String(r[10]||''),
    responses:[],
    audit:[]
  };
}
function agResponseFromRow_(r){
  return{
    id:String(r[0]||''),
    respondentFirstName:String(r[2]||''),
    respondentLastName:String(r[3]||''),
    respondent:String(r[4]||''),
    channel:String(r[5]||'digital'),
    createdAt:String(r[6]||''),
    updatedAt:String(r[7]||''),
    answers:agJsonParse_(r[8],{}),
    completion:Number(r[9]||0)
  };
}
function agAuditFromRow_(r){
  return{
    id:String(r[0]||''),
    at:String(r[2]||''),
    action:String(r[3]||''),
    detail:String(r[4]||'')
  };
}
function agDeletedIds_(){
  const sh=agSheet_(AG_DELETIONS_SHEET,AG_DELETION_HEADERS);
  if(sh.getLastRow()<2)return[];
  return sh.getDataRange().getValues().slice(1).filter(r=>r[0]).map(r=>String(r[0]));
}
function agIsDeleted_(campaignId){
  const id=String(campaignId||'');
  return agDeletedIds_().includes(id);
}
function agMarkDeleted_(campaignId,userId){
  const sh=agSheet_(AG_DELETIONS_SHEET,AG_DELETION_HEADERS);
  const id=String(campaignId||''),at=new Date().toISOString(),by=String(userId||'');
  if(sh.getLastRow()>=2){
    const vals=sh.getRange(2,1,sh.getLastRow()-1,1).getValues();
    for(let i=0;i<vals.length;i++){
      if(String(vals[i][0])===id){
        sh.getRange(i+2,1,1,3).setValues([[id,at,by]]);
        return;
      }
    }
  }
  sh.appendRow([id,at,by]);
}
function agListCampaigns_(userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  agEnsureDb_();
  const csh=agSheet_(AG_CAMPAIGNS_SHEET,AG_CAMPAIGN_HEADERS);
  const rsh=agSheet_(AG_RESPONSES_SHEET,AG_RESPONSE_HEADERS);
  const ash=agSheet_(AG_AUDIT_SHEET,AG_AUDIT_HEADERS);
  const campaigns=csh.getLastRow()<2?[]:csh.getDataRange().getValues().slice(1).filter(r=>r[0]).map(agCampaignFromRow_);
  const map={};campaigns.forEach(c=>map[c.id]=c);
  if(rsh.getLastRow()>=2)rsh.getDataRange().getValues().slice(1).forEach(r=>{const cid=String(r[1]||'');if(r[0]&&map[cid])map[cid].responses.push(agResponseFromRow_(r))});
  if(ash.getLastRow()>=2)ash.getDataRange().getValues().slice(1).forEach(r=>{const cid=String(r[1]||'');if(r[0]&&map[cid])map[cid].audit.push(agAuditFromRow_(r))});
  campaigns.forEach(c=>{
    c.responses.sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt)));
    c.audit.sort((a,b)=>String(b.at).localeCompare(String(a.at)));
  });
  campaigns.sort((a,b)=>String(b.updatedAt||b.createdAt).localeCompare(String(a.updatedAt||a.createdAt)));
  return{ok:true,campaigns:campaigns,deletedIds:agDeletedIds_(),database:'Google Sheets'};
}
function agDeleteRowsByCampaign_(sh,campaignId,campaignCol){
  if(sh.getLastRow()<2)return;
  const vals=sh.getRange(2,campaignCol,sh.getLastRow()-1,1).getValues();
  for(let i=vals.length-1;i>=0;i--)if(String(vals[i][0]||'')===String(campaignId))sh.deleteRow(i+2);
}
function agSaveCampaign_(campaign,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  campaign=campaign||{};
  if(!campaign.id)return{ok:false,error:'ID questionnaire manquant.'};
  agEnsureDb_();
  if(agIsDeleted_(campaign.id))return{ok:false,error:'Ce questionnaire a été supprimé définitivement.',deleted:true,campaignId:String(campaign.id)};
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    agMarkDeleted_(campaignId,auth.user&&auth.user.id||userId);
    const csh=agSheet_(AG_CAMPAIGNS_SHEET,AG_CAMPAIGN_HEADERS);
    const rsh=agSheet_(AG_RESPONSES_SHEET,AG_RESPONSE_HEADERS);
    const ash=agSheet_(AG_AUDIT_SHEET,AG_AUDIT_HEADERS);
    const vals=csh.getLastRow()<2?[]:csh.getDataRange().getValues();
    let row=0;
    for(let i=1;i<vals.length;i++)if(String(vals[i][0])===String(campaign.id)){row=i+1;break}
    const createdAt=String(campaign.createdAt||new Date().toISOString());
    const updatedAt=String(campaign.updatedAt||new Date().toISOString());
    const createdBy=String(campaign.createdBy||auth.user.id||'');
    const data=[
      String(campaign.id),String(campaign.title||''),String(campaign.year||''),String(campaign.status||'draft'),
      createdAt,updatedAt,String(campaign.trashedAt||''),
      JSON.stringify(campaign.source||{}),JSON.stringify(campaign.settings||{}),JSON.stringify(campaign.sections||[]),createdBy
    ];
    if(row)csh.getRange(row,1,1,AG_CAMPAIGN_HEADERS.length).setValues([data]);
    else csh.appendRow(data);

    agDeleteRowsByCampaign_(rsh,campaign.id,2);
    const responses=(campaign.responses||[]).map(r=>[
      String(r.id||Utilities.getUuid()),String(campaign.id),
      String(r.respondentFirstName||''),String(r.respondentLastName||''),String(r.respondent||''),
      String(r.channel||'digital'),String(r.createdAt||updatedAt),String(r.updatedAt||r.createdAt||updatedAt),
      JSON.stringify(r.answers||{}),Number(r.completion||0)
    ]);
    if(responses.length)rsh.getRange(rsh.getLastRow()+1,1,responses.length,AG_RESPONSE_HEADERS.length).setValues(responses);

    agDeleteRowsByCampaign_(ash,campaign.id,2);
    const audit=(campaign.audit||[]).map(a=>[
      String(a.id||Utilities.getUuid()),String(campaign.id),String(a.at||updatedAt),String(a.action||''),String(a.detail||'')
    ]);
    if(audit.length)ash.getRange(ash.getLastRow()+1,1,audit.length,AG_AUDIT_HEADERS.length).setValues(audit);

    SpreadsheetApp.flush();
    return{ok:true,campaignId:String(campaign.id),updatedAt:updatedAt};
  }finally{lock.releaseLock()}
}
function agDeleteCampaign_(campaignId,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  campaignId=String(campaignId||'').trim();if(!campaignId)return{ok:false,error:'ID questionnaire manquant.'};
  agEnsureDb_();
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
    const csh=agSheet_(AG_CAMPAIGNS_SHEET,AG_CAMPAIGN_HEADERS);
    const rsh=agSheet_(AG_RESPONSES_SHEET,AG_RESPONSE_HEADERS);
    const ash=agSheet_(AG_AUDIT_SHEET,AG_AUDIT_HEADERS);
    if(csh.getLastRow()>=2){
      const vals=csh.getRange(2,1,csh.getLastRow()-1,1).getValues();
      for(let i=vals.length-1;i>=0;i--)if(String(vals[i][0])===campaignId)csh.deleteRow(i+2);
    }
    agDeleteRowsByCampaign_(rsh,campaignId,2);
    agDeleteRowsByCampaign_(ash,campaignId,2);
    SpreadsheetApp.flush();
    return{ok:true};
  }finally{lock.releaseLock()}
}
function agDatabaseInfo_(userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  agEnsureDb_();
  const ss=agDb_();
  return{ok:true,spreadsheetId:ss.getId(),spreadsheetName:ss.getName(),sheets:[AG_CAMPAIGNS_SHEET,AG_RESPONSES_SHEET,AG_AUDIT_SHEET,AG_DELETIONS_SHEET]};
}
function initialiserBaseConsultationAG(){
  agEnsureDb_();
  const ss=agDb_();
  return 'Base Consultation AG prête dans « '+ss.getName()+' »';
}
