// AGAI.gs — Gemini AI engines for Consultation AG
// Script Properties required: GEMINI_API_KEY
// Optional: GEMINI_MODEL (default: gemini-3.6-flash)

const AG_AI_DEFAULT_MODEL='gemini-3.6-flash';
const AG_AI_MAX_FILE_BYTES=8*1024*1024;

function agAiConfig_(){
  const p=PropertiesService.getScriptProperties();
  const key=String(p.getProperty('GEMINI_API_KEY')||'').trim();
  const model=String(p.getProperty('GEMINI_MODEL')||AG_AI_DEFAULT_MODEL).trim();
  if(!key)return{ok:false,error:'Gemini n’est pas configuré. Ajoutez GEMINI_API_KEY dans les propriétés du script.'};
  return{ok:true,key:key,model:model};
}
function agAiCleanJson_(text){
  text=String(text||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
  try{return JSON.parse(text)}catch(_){
    const a=text.indexOf('{'),b=text.lastIndexOf('}');
    if(a>=0&&b>a)return JSON.parse(text.slice(a,b+1));
    throw new Error('Réponse IA non exploitable.');
  }
}
function agAiCall_(parts,schema){
  const cfg=agAiConfig_();if(!cfg.ok)return cfg;
  const url='https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(cfg.model)+':generateContent?key='+encodeURIComponent(cfg.key);
  const payload={
    contents:[{role:'user',parts:parts}],
    generationConfig:{temperature:0.1,responseMimeType:'application/json',responseSchema:schema}
  };
  const r=UrlFetchApp.fetch(url,{method:'post',contentType:'application/json',payload:JSON.stringify(payload),muteHttpExceptions:true});
  const status=r.getResponseCode(),body=r.getContentText();
  let j={};try{j=JSON.parse(body)}catch(_){}
  if(status<200||status>=300)return{ok:false,error:'Gemini : '+(j&&j.error&&j.error.message?j.error.message:'erreur HTTP '+status)};
  const text=(((j.candidates||[])[0]||{}).content||{}).parts||[];
  const merged=text.map(x=>x.text||'').join('').trim();
  if(!merged)return{ok:false,error:'Gemini n’a renvoyé aucun résultat.'};
  try{return{ok:true,data:agAiCleanJson_(merged),model:cfg.model}}catch(e){return{ok:false,error:String(e.message||e)}}
}
function agAiFilePart_(file){
  file=file||{};
  const mime=String(file.mimeType||'').trim(),data=String(file.data||'').replace(/^data:[^;]+;base64,/,'');
  if(!data)return null;
  const approx=Math.floor(data.length*3/4);
  if(approx>AG_AI_MAX_FILE_BYTES)throw new Error('Le fichier est trop volumineux pour l’analyse IA (8 Mo maximum).');
  return{inlineData:{mimeType:mime||'application/octet-stream',data:data}};
}
function agAiQuestionnaireSchema_(){return{
  type:'OBJECT',required:['title','sections'],properties:{
    title:{type:'STRING'},
    sections:{type:'ARRAY',items:{type:'OBJECT',required:['title','questions'],properties:{
      title:{type:'STRING'},description:{type:'STRING'},
      questions:{type:'ARRAY',items:{type:'OBJECT',required:['label','type','required','options'],properties:{
        label:{type:'STRING'},type:{type:'STRING',enum:['text','yesno','scale','single','multi']},required:{type:'BOOLEAN'},
        options:{type:'ARRAY',items:{type:'STRING'}},instruction:{type:'STRING'},minChoices:{type:'INTEGER'},maxChoices:{type:'INTEGER'}
      }}}
    }}}
  }
}}
function agAiResponsesSchema_(){return{
  type:'OBJECT',required:['responses'],properties:{
    responses:{type:'ARRAY',items:{type:'OBJECT',required:['answers'],properties:{
      respondentFirstName:{type:'STRING'},respondentLastName:{type:'STRING'},answers:{type:'OBJECT'}
    }}},
    warnings:{type:'ARRAY',items:{type:'STRING'}}
  }
}}
function agAiQuestionnairePrompt_(){return[
  'Tu es le moteur IA de création de questionnaires de la Société d’Horticulture et d’Art Floral du Bassin de Châteaulin.',
  'Analyse intégralement le document fourni et reconstruis le questionnaire dans sa structure logique.',
  'IMPORTANT : une question du document = un objet question distinct. Ne rassemble jamais plusieurs questions dans le même label.',
  'Respecte l’ordre, les sections, les intitulés, les choix proposés et les consignes.',
  'Déduis le type : text = réponse libre, yesno = Oui/Non, scale = échelle 1 à 5, single = un seul choix, multi = plusieurs choix.',
  'Pour single/multi, place chaque choix dans options. Pour yesno et scale, options peut être vide.',
  'Interprète les consignes : "une seule réponse", "2 réponses", "entre 2 et 4", "maximum 3", etc. Mets une consigne claire dans instruction et minChoices/maxChoices pour multi.',
  'Ne transforme pas un titre, une introduction, une date ou une explication en question.',
  'Si un document contient 10 questions, le JSON doit normalement contenir 10 objets question distincts.',
  'Ne crée aucune information absente. En cas d’ambiguïté, choisis la structure la plus fidèle et laisse required=false.',
  'Réponds uniquement selon le schéma JSON demandé.'
].join('\n')}
function agAnalyzeQuestionnaireAI_(payload,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  payload=payload||{};
  const parts=[{text:agAiQuestionnairePrompt_()}];
  if(payload.file&&payload.file.data){
    try{parts.push(agAiFilePart_(payload.file))}catch(e){return{ok:false,error:String(e.message||e)}}
  }
  if(String(payload.text||'').trim())parts.push({text:'CONTENU EXTRAIT DU DOCUMENT :\n'+String(payload.text).slice(0,120000)});
  if(parts.length<2)return{ok:false,error:'Aucun contenu à analyser.'};
  const result=agAiCall_(parts,agAiQuestionnaireSchema_());if(!result.ok)return result;
  const d=result.data||{};
  if(!Array.isArray(d.sections)||!d.sections.length)return{ok:false,error:'Gemini n’a détecté aucune section exploitable.'};
  let count=0;d.sections.forEach(s=>{if(Array.isArray(s.questions))count+=s.questions.length});
  if(!count)return{ok:false,error:'Gemini n’a détecté aucune question exploitable.'};
  return{ok:true,questionnaire:d,questionCount:count,model:result.model};
}
function agAiResponsesPrompt_(campaign){
  const qs=[];(campaign.sections||[]).forEach(s=>(s.questions||[]).forEach(q=>qs.push({id:String(q.id||''),label:String(q.label||''),type:String(q.type||'text'),options:q.options||[],minChoices:q.minChoices||null,maxChoices:q.maxChoices||null})));
  return [
    'Tu es le moteur IA de dépouillement des réponses papier de la Société d’Horticulture et d’Art Floral du Bassin de Châteaulin.',
    'Le questionnaire EXISTE DÉJÀ. Tu ne dois jamais créer, supprimer, fusionner ou renommer les questions.',
    'Analyse le fichier fourni et récupère uniquement les réponses des personnes.',
    'Chaque bulletin / ligne / personne doit devenir un objet distinct dans responses.',
    'Dans answers, utilise EXCLUSIVEMENT les identifiants de questions fournis ci-dessous comme clés.',
    'Pour text : chaîne. Pour yesno/single/scale : une valeur. Pour multi : tableau de valeurs.',
    'N’invente jamais une réponse illisible ou absente : omets la clé correspondante.',
    'Si le fichier est un tableau, une ligne de répondant = une response. Si c’est la photo d’un seul bulletin, renvoie une seule response.',
    'Ajoute dans warnings les ambiguïtés importantes.',
    'QUESTIONNAIRE DE RÉFÉRENCE : '+JSON.stringify(qs),
    'Réponds uniquement selon le schéma JSON demandé.'
  ].join('\n')
}
function agAnalyzeResponsesAI_(payload,userId,generation){
  const auth=agAuthorize_(userId,generation);if(!auth.ok)return auth;
  payload=payload||{};const campaign=payload.campaign||{};
  if(!campaign.id||!Array.isArray(campaign.sections))return{ok:false,error:'Questionnaire de référence manquant.'};
  const parts=[{text:agAiResponsesPrompt_(campaign)}];
  if(payload.file&&payload.file.data){try{parts.push(agAiFilePart_(payload.file))}catch(e){return{ok:false,error:String(e.message||e)}}}
  if(String(payload.text||'').trim())parts.push({text:'CONTENU À DÉPOUILLER :\n'+String(payload.text).slice(0,120000)});
  if(parts.length<2)return{ok:false,error:'Aucun contenu à analyser.'};
  const result=agAiCall_(parts,agAiResponsesSchema_());if(!result.ok)return result;
  const d=result.data||{};if(!Array.isArray(d.responses)||!d.responses.length)return{ok:false,error:'Gemini n’a détecté aucune réponse exploitable.'};
  return{ok:true,responses:d.responses,warnings:Array.isArray(d.warnings)?d.warnings:[],model:result.model};
}
