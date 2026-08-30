// AdherentsImportAI.gs — extraction intelligente d'une liste d'adhérents
// Réutilise le moteur Gemini déjà configuré dans AGAI.gs (GEMINI_API_KEY).

function adherentsImportAiSchema_(){return{
  type:'OBJECT',required:['adherents'],properties:{
    adherents:{type:'ARRAY',items:{type:'OBJECT',required:['firstName','lastName'],properties:{
      firstName:{type:'STRING'},lastName:{type:'STRING'},address:{type:'STRING'},phone:{type:'STRING'},email:{type:'STRING'},
      source:{type:'STRING'},dateAdhesion:{type:'STRING'},notes:{type:'STRING'}
    }}},warnings:{type:'ARRAY',items:{type:'STRING'}}
  }
}}

function adherentsAnalyzeImportAI_(payload){
  payload=payload||{};
  const parts=[{text:[
    "Tu extrais une liste d'adhérents pour la Société d'Horticulture et d'Art Floral du Bassin de Châteaulin.",
    "Analyse le document, tableau, PDF, photo ou scan fourni.",
    "Une personne = un objet distinct dans adherents.",
    "Récupère uniquement les informations réellement présentes : prénom, nom, adresse, téléphone, e-mail, date d'adhésion et notes.",
    "Si l'origine est clairement HelloAsso, mets source=HelloAsso, sinon source=Manuel.",
    "Pour dateAdhesion, utilise YYYY-MM-DD quand la date est lisible, sinon chaîne vide.",
    "Ne crée jamais une personne ou une donnée absente. Ignore les lignes de titres, totaux, commentaires et lignes vides.",
    "Ajoute dans warnings les ambiguïtés importantes.",
    "Réponds uniquement selon le schéma JSON demandé."
  ].join('\n')}];
  if(payload.file&&payload.file.data){try{parts.push(agAiFilePart_(payload.file))}catch(e){return{ok:false,error:String(e.message||e)}}}
  if(String(payload.text||'').trim())parts.push({text:'CONTENU DU FICHIER :\n'+String(payload.text).slice(0,120000)});
  if(parts.length<2)return{ok:false,error:'Aucun document à analyser.'};
  const r=agAiCall_(parts,adherentsImportAiSchema_());if(!r.ok)return r;
  const d=r.data||{},rows=Array.isArray(d.adherents)?d.adherents:[];
  if(!rows.length)return{ok:false,error:"Aucun adhérent n'a été détecté dans ce document."};
  return{ok:true,adherents:rows,warnings:Array.isArray(d.warnings)?d.warnings:[],model:r.model};
}
