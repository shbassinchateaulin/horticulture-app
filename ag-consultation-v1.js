(()=>{
'use strict';
const STORE='horticulture-ag-pro-v2';
const DRAFT='horticulture-ag-pro-draft-v2';
const APP_VERSION=2;
let activeId='',draft=null,screen='home';

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const uid=(p='id')=>p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const now=()=>new Date().toISOString();
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

function db(){
  try{
    const raw=JSON.parse(localStorage.getItem(STORE)||'{"version":2,"campaigns":[]}');
    if(Array.isArray(raw))return {version:2,campaigns:raw};
    return {version:APP_VERSION,campaigns:Array.isArray(raw.campaigns)?raw.campaigns:[]};
  }catch{return {version:APP_VERSION,campaigns:[]}}
}
function saveDB(data){localStorage.setItem(STORE,JSON.stringify(data))}
function campaigns(){return db().campaigns.filter(c=>!c.trashedAt)}
function trashCampaigns(){return db().campaigns.filter(c=>!!c.trashedAt)}
function saveCampaign(c){
  const d=db(),i=d.campaigns.findIndex(x=>x.id===c.id);
  c.updatedAt=now();
  if(i<0)d.campaigns.unshift(c);else d.campaigns[i]=c;
  saveDB(d);return c;
}
function getCampaign(id){return campaigns().find(x=>x.id===id)||null}
function getAnyCampaign(id){return db().campaigns.find(x=>x.id===id)||null}
function removeCampaign(id){const d=db();d.campaigns=d.campaigns.filter(x=>x.id!==id);saveDB(d)}
function moveToTrash(id){const c=getAnyCampaign(id);if(!c||c.status!=='closed')return false;c.trashedAt=now();audit(c,'Mis à la corbeille');saveCampaign(c);return true}
function restoreFromTrash(id){const c=getAnyCampaign(id);if(!c)return false;delete c.trashedAt;audit(c,'Restauré depuis la corbeille');saveCampaign(c);return true}
function identityMode(c){return c?.settings?.identityMode||((c?.settings?.anonymous===true)?'anonymous':'optional')}
function audit(c,action,detail=''){c.audit=c.audit||[];c.audit.unshift({id:uid('log'),at:now(),action,detail});c.audit=c.audit.slice(0,80)}
function saveDraft(){if(draft)localStorage.setItem(DRAFT,JSON.stringify(draft))}
function clearDraft(){localStorage.removeItem(DRAFT)}
function restoreDraft(){try{return JSON.parse(localStorage.getItem(DRAFT)||'null')}catch{return null}}

function main(){return $('main.app')||$('.app')}
function root(){
  let s=$('#agConsultation');
  if(!s){s=document.createElement('section');s.id='agConsultation';s.className='view';main()?.appendChild(s)}
  return s;
}
function showRoot(){
  $$('.view').forEach(v=>v.classList.remove('active'));
  root().classList.add('active');
  window.scrollTo(0,0);
}
function backHome(){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $('#home')?.classList.add('active');
  window.scrollTo(0,0);
}

function style(){
  if($('#agProStyle'))return;
  const s=document.createElement('style');s.id='agProStyle';
  s.textContent=
  '#agConsultation{padding-bottom:48px;color:#173126}'+
  '.agTop{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}.agTop h1{margin:0;font-size:30px;color:#173126}.agTop p{margin:6px 0 0;color:#6e7f76;font-size:13px;line-height:1.5}'+
  '.agBtn,.agPrimary,.agDanger{border-radius:11px;padding:10px 14px;font-weight:800;cursor:pointer;font-size:13px}.agBtn{border:1px solid #dce5df;background:#fff;color:#29483d}.agPrimary{border:0;background:#07583f;color:#fff}.agDanger{border:1px solid #f0cccc;background:#fff5f5;color:#b42318}'+
  '.agToolbar{display:flex;gap:8px;flex-wrap:wrap}.agPanel{background:#fff;border:1px solid #e0e7e3;border-radius:18px;padding:18px;box-shadow:0 5px 18px #063d2f08;margin-bottom:14px}.agPanel h2,.agPanel h3{margin:0 0 12px}'+
  '.agKpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.agKpi{background:#fff;border:1px solid #e0e7e3;border-radius:15px;padding:15px}.agKpi b{font-size:26px;color:#07583f;display:block}.agKpi span{font-size:11px;color:#718078}'+
  '.agGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.agCard{background:#fff;border:1px solid #e0e7e3;border-radius:16px;padding:16px;box-shadow:0 5px 18px #063d2f08}.agCard h3{margin:8px 0 5px}.agMeta{font-size:11px;color:#74837b;line-height:1.45}.agStatus{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:5px 9px;font-size:10px;font-weight:850}.agStatus.draft{background:#f0f2f1;color:#5f6b65}.agStatus.open{background:#e7f7ec;color:#0f6b3f}.agStatus.closed{background:#fff0e8;color:#9c4d1a}'+
  '.agSourceGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.agSource{border:1px solid #dce5df;background:#fff;border-radius:16px;padding:18px;text-align:left;cursor:pointer;min-height:135px}.agSource:hover{border-color:#9fc3af;box-shadow:0 8px 22px #063d2f0e}.agSource strong{display:block;font-size:15px}.agSource small{display:block;margin-top:7px;color:#718078;line-height:1.45}'+
  '.agField{margin-top:12px}.agField label{display:block;font-size:11px;font-weight:850;margin-bottom:6px;color:#41564c}.agField input,.agField textarea,.agField select{width:100%;box-sizing:border-box;border:1px solid #d7e2db;border-radius:10px;padding:10px;background:#fff;color:#173126}.agField textarea{min-height:90px;resize:vertical}.agTwo{display:grid;grid-template-columns:1fr 1fr;gap:12px}'+
  '.agSection{border:1px solid #dfe7e2;border-radius:16px;margin-top:14px;overflow:hidden}.agSectionHead{display:flex;align-items:center;gap:8px;background:#f6faf7;padding:12px}.agSectionHead input{flex:1;border:1px solid #d7e2db;border-radius:9px;padding:9px;font-weight:800}.agQuestion{padding:13px;border-top:1px solid #edf0ee}.agQuestionTop{display:grid;grid-template-columns:1fr 165px auto;gap:8px;align-items:center}.agQuestionTop input,.agQuestionTop select{width:100%;border:1px solid #d7e2db;border-radius:9px;padding:9px}.agQActions{display:flex;gap:5px}.agIconBtn{border:1px solid #dce5df;background:#fff;border-radius:8px;width:34px;height:34px;cursor:pointer}.agRemove{color:#b42318;background:#fff5f5;border-color:#f0cccc}.agRequired{display:flex;gap:7px;align-items:center;font-size:11px;color:#607168;margin-top:8px}'+
  '.agPreview{border:1px solid #dfe7e2;border-radius:14px;background:#fbfdfb;padding:16px}.agPreviewQ{padding:12px 0;border-top:1px solid #e6ece8}.agPreviewQ:first-child{border-top:0}.agPreviewQ b{display:block;margin-bottom:8px}.agPreviewQ input,.agPreviewQ textarea,.agPreviewQ select{width:100%;box-sizing:border-box;border:1px solid #d7e2db;border-radius:9px;padding:9px}.agPreviewQ textarea{min-height:75px}'+
  '.agTabs{display:flex;gap:7px;overflow:auto;margin-bottom:14px}.agTab{border:1px solid #dce5df;background:#fff;border-radius:999px;padding:8px 12px;white-space:nowrap;font-size:11px;font-weight:800;cursor:pointer}.agTab.active{background:#07583f;color:#fff;border-color:#07583f}'+
  '.agTable{width:100%;border-collapse:collapse;font-size:12px}.agTable th,.agTable td{padding:10px;border-bottom:1px solid #edf0ee;text-align:left;vertical-align:top}.agTable th{color:#5f7168;font-size:10px;text-transform:uppercase;letter-spacing:.03em}.agEmpty{padding:34px;text-align:center;border:1px dashed #ccd8d1;border-radius:14px;color:#718078}'+
  '.agCollector{max-width:760px;margin:auto}.agAnswer{padding:14px 0;border-top:1px solid #edf0ee}.agAnswer:first-child{border-top:0}.agAnswer b{display:block;margin-bottom:8px;font-size:13px}.agAnswer input,.agAnswer textarea,.agAnswer select{width:100%;box-sizing:border-box;border:1px solid #d7e2db;border-radius:10px;padding:10px}.agAnswer textarea{min-height:88px}.agChoiceList{display:grid;gap:6px}.agChoice{display:flex!important;align-items:center;gap:8px;font-weight:500!important}.agChoice input{width:auto!important}'+
  '.agResult{padding:15px 0;border-top:1px solid #edf0ee}.agResult:first-child{border-top:0}.agResult h4{margin:0 0 6px}.agResult small{color:#73827a}.agBarRow{display:grid;grid-template-columns:minmax(100px,1fr) 70px;gap:10px;align-items:center;margin-top:8px}.agBar{height:9px;background:#edf3ef;border-radius:99px;overflow:hidden}.agBar span{height:100%;display:block;background:#0b7b57}.agPercent{text-align:right;font-size:11px;font-weight:800}.agKeywords{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}.agKeyword{background:#edf7f0;color:#07583f;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:800}.agQuote{background:#f8fbf9;border:1px solid #e5ece8;border-radius:10px;padding:10px;margin-top:7px;font-size:12px;line-height:1.45}'+
  '.agDrop{border:2px dashed #cbd8d1;border-radius:16px;padding:28px;text-align:center;background:#fbfdfb}.agDrop input{margin-top:12px}.agProgress{margin-top:10px;font-size:12px;color:#607168}.agPhoto{max-width:100%;max-height:300px;border-radius:12px;margin-top:12px;border:1px solid #dde6e0}'+
  '.agBanner{background:linear-gradient(135deg,#073f31,#0d6b4b);color:#fff;border-radius:18px;padding:18px;margin-bottom:14px;display:flex;justify-content:space-between;gap:18px;align-items:center}.agBanner h2{margin:0}.agBanner p{margin:5px 0 0;color:#dcebe4;font-size:12px}.agBanner .agStatus{background:#ffffff18;color:#fff}'+
  '.agNotice{background:#f0f7f3;border:1px solid #dbe9e1;border-radius:12px;padding:11px;font-size:12px;color:#496057}.agWarn{background:#fff7e9;border-color:#f2dfb6;color:#77511d}'+
  '.agAudit{max-height:260px;overflow:auto}.agAuditItem{padding:9px 0;border-top:1px solid #edf0ee;font-size:11px}.agAuditItem:first-child{border-top:0}.agAuditItem b{display:block}.agAuditItem span{color:#77857e}'+
  '@media(max-width:1050px){.agKpis{grid-template-columns:repeat(2,1fr)}.agGrid{grid-template-columns:repeat(2,1fr)}.agSourceGrid{grid-template-columns:repeat(2,1fr)}}'+
  '@media(max-width:700px){.agTop{display:block}.agTop .agToolbar{margin-top:10px}.agKpis,.agGrid,.agSourceGrid,.agTwo{grid-template-columns:1fr}.agQuestionTop{grid-template-columns:1fr}.agQActions{justify-content:flex-end}.agBanner{display:block}.agBanner .agToolbar{margin-top:10px}.agTable{display:block;overflow:auto}}'+
  '@media print{body>*:not(.appShell){display:none!important}.top,.bottom,.drawer,.agToolbar,.agTabs,.back{display:none!important}.appShell{display:block!important}.app{max-width:none!important;padding:0!important}#agConsultation{display:block!important}.agPanel,.agCard{box-shadow:none!important;break-inside:avoid}}';
  document.head.appendChild(s);
}

function statusLabel(v){return v==='open'?'Ouvert':v==='closed'?'Clôturé':'Brouillon'}
function statusClass(v){return v==='open'?'open':v==='closed'?'closed':'draft'}
function allQuestions(c){return (c.sections||[]).flatMap(s=>s.questions||[])}
function totalResponses(){return campaigns().reduce((n,c)=>n+(c.responses||[]).length,0)}
function avgCompletion(c){
  const qs=allQuestions(c);if(!qs.length||!(c.responses||[]).length)return 0;
  const values=c.responses.map(r=>qs.filter(q=>{const v=r.answers?.[q.id];return Array.isArray(v)?v.length>0:String(v??'').trim()!==''}).length/qs.length);
  return Math.round(values.reduce((a,b)=>a+b,0)/values.length*100);
}

function home(){
  screen='home';showRoot();style();
  const list=campaigns(),open=list.filter(c=>c.status==='open').length,resp=totalResponses(),last=list[0];
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Consultation AG</h1><p>Questionnaires, collecte, dépouillement et synthèse pour l’Assemblée générale.</p></div><div class="agToolbar"><button class="agBtn" data-backup>Exporter la sauvegarde</button><button class="agBtn" data-restore>Importer une sauvegarde</button><button class="agPrimary" data-new>＋ Nouveau questionnaire</button></div></div>'+
    '<div class="agKpis">'+
      '<div class="agKpi"><b>'+list.length+'</b><span>questionnaires</span></div>'+
      '<div class="agKpi"><b>'+open+'</b><span>consultation(s) ouverte(s)</span></div>'+
      '<div class="agKpi"><b>'+resp+'</b><span>réponses enregistrées</span></div>'+
      '<div class="agKpi"><b>'+(last?new Date(last.updatedAt||last.createdAt).toLocaleDateString('fr-FR'):'—')+'</b><span>dernière activité</span></div>'+
    '</div>'+
    '<div class="agGrid">'+
    (list.length?list.map(c=>
      '<article class="agCard" data-id="'+esc(c.id)+'">'+
      '<span class="agStatus '+statusClass(c.status)+'">'+statusLabel(c.status)+'</span>'+
      '<h3>'+esc(c.title||'Questionnaire AG')+'</h3>'+
      '<div class="agMeta">'+esc(c.year||'')+' • '+allQuestions(c).length+' question(s) • '+(c.responses||[]).length+' réponse(s)<br>Complétion moyenne : '+avgCompletion(c)+' %</div>'+
      '<div class="agToolbar" style="margin-top:13px"><button class="agBtn" data-open>Ouvrir</button><button class="agBtn" data-results>Résultats</button></div>'+
      '</article>'
    ).join(''):'<div class="agEmpty" style="grid-column:1/-1">Aucun questionnaire. Crée le premier à partir du document Word, d’une photo, d’un modèle ou manuellement.</div>')+
    '</div><input data-restore-file type="file" accept=".json,application/json" hidden>';
  $('[data-back]',root()).onclick=backHome;
  $('[data-new]',root()).onclick=newWizard;
  $('[data-backup]',root()).onclick=exportBackup;
  $('[data-restore]',root()).onclick=()=>$('[data-restore-file]',root()).click();
  $('[data-restore-file]',root()).onchange=importBackup;
  $$('[data-id]',root()).forEach(card=>{
    const id=card.dataset.id;
    $('[data-open]',card).onclick=()=>campaign(id,'overview');
    $('[data-results]',card).onclick=()=>campaign(id,'results');
  });
}

function newWizard(){
  screen='new';showRoot();
  const old=restoreDraft();
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Nouveau questionnaire AG</h1><p>Choisis comment créer le questionnaire. Le brouillon est sauvegardé automatiquement.</p></div></div>'+
    (old?'<div class="agNotice agWarn" style="margin-bottom:14px">Un brouillon non terminé existe. <button class="agBtn" data-resume style="margin-left:8px">Reprendre le brouillon</button></div>':'')+
    '<div class="agSourceGrid">'+
      '<button class="agSource" data-source="template"><strong>✨ Modèle professionnel</strong><small>Partir d’un questionnaire AG déjà structuré : satisfaction, activités, communication et améliorations.</small></button>'+
      '<button class="agSource" data-source="word"><strong>📄 Document Word</strong><small>Importer un .docx et transformer automatiquement le texte en questions à vérifier.</small></button>'+
      '<button class="agSource" data-source="photo"><strong>📷 Photo / scan</strong><small>Prendre une photo du questionnaire papier et l’utiliser comme référence. OCR optionnel à la demande.</small></button>'+
      '<button class="agSource" data-source="manual"><strong>✍️ Création manuelle</strong><small>Créer librement sections, questions, types de réponses et options.</small></button>'+
    '</div>';
  $('[data-back]',root()).onclick=home;
  $('[data-resume]',root())?.addEventListener('click',()=>{draft=old;builder()});
  $$('[data-source]',root()).forEach(b=>b.onclick=()=>startSource(b.dataset.source));
}

function blankCampaign(){
  const y=new Date().getFullYear();
  return {id:uid('ag'),title:'Consultation Assemblée générale '+y,year:String(y),status:'draft',createdAt:now(),updatedAt:now(),source:{type:'manual',name:''},settings:{anonymous:true,allowMultiple:true,showProgress:true},sections:[{id:uid('sec'),title:'Questionnaire',description:'',questions:[]}],responses:[],audit:[]};
}
function templateCampaign(){
  const c=blankCampaign();c.source={type:'template',name:'Modèle AG'};
  c.sections=[
    {id:uid('sec'),title:'Satisfaction générale',description:'Votre avis sur le fonctionnement de l’association',questions:[
      {id:uid('q'),label:'Êtes-vous satisfait(e) du fonctionnement général de l’association ?',type:'scale',required:true,options:[]},
      {id:uid('q'),label:'Les activités proposées correspondent-elles à vos attentes ?',type:'yesno',required:true,options:[]},
      {id:uid('q'),label:'Comment évaluez-vous la qualité des sorties et activités ?',type:'scale',required:false,options:[]}
    ]},
    {id:uid('sec'),title:'Communication et organisation',description:'Information, inscriptions et fonctionnement',questions:[
      {id:uid('q'),label:'Êtes-vous satisfait(e) de l’information transmise aux adhérents ?',type:'scale',required:false,options:[]},
      {id:uid('q'),label:'Quel moyen de communication préférez-vous ?',type:'single',required:false,options:['E-mail','Site internet','Courrier','Téléphone','Autre']},
      {id:uid('q'),label:'L’organisation des inscriptions vous paraît-elle simple ?',type:'yesno',required:false,options:[]}
    ]},
    {id:uid('sec'),title:'Améliorations et idées',description:'Priorités pour la prochaine saison',questions:[
      {id:uid('q'),label:'Quels sont les points qui pourraient être améliorés ?',type:'text',required:false,options:[]},
      {id:uid('q'),label:'Quelles nouvelles activités ou sorties souhaiteriez-vous ?',type:'text',required:false,options:[]},
      {id:uid('q'),label:'Avez-vous une remarque ou une suggestion pour le bureau ?',type:'text',required:false,options:[]}
    ]}
  ];
  return c;
}

function startSource(type){
  draft=type==='template'?templateCampaign():blankCampaign();
  draft.source.type=type;
  audit(draft,'Création du questionnaire','Source : '+type);
  saveDraft();
  if(type==='word')wordImport();
  else if(type==='photo')photoImport();
  else builder();
}

function loadScript(src,name){
  return new Promise((resolve,reject)=>{
    if(window[name])return resolve(window[name]);
    const existing=$('script[data-ag-lib="'+name+'"]');
    if(existing){existing.addEventListener('load',()=>resolve(window[name]),{once:true});return}
    const s=document.createElement('script');s.src=src;s.async=true;s.dataset.agLib=name;s.onload=()=>resolve(window[name]);s.onerror=()=>reject(new Error('Chargement impossible'));document.head.appendChild(s);
  });
}
function parseTextQuestions(text){
  const raw=String(text||'').split(/\r?\n/).map(x=>x.replace(/^\s*(?:\d+[.)-]|[-•])\s*/,'').trim()).filter(Boolean);
  const likely=raw.filter(x=>x.endsWith('?')||/^(quels?|quelles?|comment|pensez|souhaitez|avez-vous|etes-vous|êtes-vous|est-ce|dans quelle|sur une echelle|sur une échelle)/i.test(x));
  const lines=(likely.length>=2?likely:raw).slice(0,50);
  return lines.map(t=>({id:uid('q'),label:t,type:/oui|non/i.test(t)?'yesno':'text',required:false,options:[]}));
}

function wordImport(){
  showRoot();
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Importer le document Word</h1><p>Le document est lu uniquement quand tu le demandes. Rien ne tourne en arrière-plan.</p></div></div>'+
    '<div class="agPanel"><div class="agDrop"><b>Document .docx</b><div class="agMeta">Sélectionne le questionnaire utilisé actuellement.</div><input data-file type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></div><div class="agProgress" data-msg></div><div class="agToolbar" style="margin-top:14px"><button class="agPrimary" data-read>Analyser le document</button><button class="agBtn" data-manual>Continuer sans analyse</button></div></div>';
  $('[data-back]',root()).onclick=newWizard;
  $('[data-manual]',root()).onclick=builder;
  $('[data-read]',root()).onclick=async()=>{
    const file=$('[data-file]',root()).files[0],msg=$('[data-msg]',root());
    if(!file){msg.textContent='Choisis d’abord un fichier .docx.';return}
    msg.textContent='Lecture du document…';
    try{
      const mammoth=await loadScript('https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js','mammoth');
      const buf=await file.arrayBuffer(),r=await mammoth.extractRawText({arrayBuffer:buf});
      const qs=parseTextQuestions(r.value);
      draft.source.name=file.name;
      draft.sections=[{id:uid('sec'),title:'Questions importées',description:'À vérifier avant publication',questions:qs.length?qs:[{id:uid('q'),label:'',type:'text',required:false,options:[]}]}];
      audit(draft,'Import Word',file.name+' • '+qs.length+' question(s) détectée(s)');
      saveDraft();builder();
    }catch(e){msg.textContent='Impossible de lire ce document automatiquement. Tu peux continuer sans analyse et saisir les questions manuellement.'}
  };
}

function photoImport(){
  showRoot();
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Photo / scan du questionnaire</h1><p>Prends une photo nette. L’OCR est optionnel et ne se lance jamais tout seul.</p></div></div>'+
    '<div class="agPanel"><div class="agDrop"><b>Photo du questionnaire</b><input data-file type="file" accept="image/*" capture="environment"><img class="agPhoto" data-preview style="display:none"></div><div class="agProgress" data-msg></div><div class="agToolbar" style="margin-top:14px"><button class="agPrimary" data-ocr>Extraire le texte (OCR)</button><button class="agBtn" data-manual>Utiliser la photo comme référence</button></div></div>';
  const fileEl=$('[data-file]',root()),preview=$('[data-preview]',root()),msg=$('[data-msg]',root());
  $('[data-back]',root()).onclick=newWizard;
  fileEl.onchange=()=>{const f=fileEl.files[0];if(!f)return;draft.source.name=f.name;preview.src=URL.createObjectURL(f);preview.style.display='block';saveDraft()};
  $('[data-manual]',root()).onclick=builder;
  $('[data-ocr]',root()).onclick=async()=>{
    const file=fileEl.files[0];if(!file){msg.textContent='Choisis ou prends d’abord une photo.';return}
    msg.textContent='Préparation de l’image…';
    try{
      const img=new Image(),url=URL.createObjectURL(file);
      await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url});
      const max=1200,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),cv=document.createElement('canvas');
      cv.width=Math.round(img.naturalWidth*scale);cv.height=Math.round(img.naturalHeight*scale);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);URL.revokeObjectURL(url);
      msg.textContent='Chargement de la reconnaissance de texte…';
      const Tesseract=await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js','Tesseract');
      const r=await Tesseract.recognize(cv,'fra',{logger:m=>{if(m.status==='recognizing text')msg.textContent='Lecture : '+Math.round((m.progress||0)*100)+' %'}});
      const qs=parseTextQuestions(r.data.text);
      draft.sections=[{id:uid('sec'),title:'Questions extraites de la photo',description:'À vérifier',questions:qs.length?qs:[{id:uid('q'),label:'',type:'text',required:false,options:[]}]}];
      audit(draft,'OCR photo',file.name+' • '+qs.length+' question(s) détectée(s)');
      saveDraft();builder();
    }catch(e){msg.textContent='L’OCR n’a pas abouti. Utilise « Utiliser la photo comme référence » pour continuer sans ralentir l’application.'}
  };
}

function builder(){
  screen='builder';showRoot();style();
  if(!draft)draft=restoreDraft()||blankCampaign();
  if(!draft.sections?.length)draft.sections=[{id:uid('sec'),title:'Questionnaire',description:'',questions:[]}];
  root().innerHTML=
    '<button class="back" data-back>← Retour</button>'+
    '<div class="agTop"><div><h1>Concepteur de questionnaire</h1><p>Structure par sections, types de réponses, options, aperçu et sauvegarde automatique du brouillon.</p></div><div class="agToolbar"><button class="agBtn" data-preview>Aperçu</button><button class="agPrimary" data-save>Enregistrer</button></div></div>'+
    '<div class="agPanel"><div class="agTwo"><div class="agField"><label>Titre</label><input data-title value="'+esc(draft.title)+'"></div><div class="agField"><label>Année / saison</label><input data-year value="'+esc(draft.year||'')+'"></div></div><div class="agTwo"><div class="agField"><label>Anonymat</label><select data-anon><option value="1" '+(draft.settings?.anonymous?'selected':'')+'>Réponses anonymes</option><option value="0" '+(!draft.settings?.anonymous?'selected':'')+'>Nom du répondant facultatif</option></select></div><div class="agField"><label>Statut initial</label><select data-status><option value="draft" '+(draft.status==='draft'?'selected':'')+'>Brouillon</option><option value="open" '+(draft.status==='open'?'selected':'')+'>Ouvert</option></select></div></div></div>'+
    '<div data-sections></div>'+
    '<div class="agToolbar"><button class="agBtn" data-add-section>＋ Ajouter une section</button><button class="agPrimary" data-save-bottom>Enregistrer le questionnaire</button></div>';
  const wrap=$('[data-sections]',root());

  function syncHeader(){
    draft.title=$('[data-title]',root()).value;
    draft.year=$('[data-year]',root()).value;
    draft.settings=draft.settings||{};
    draft.settings.anonymous=$('[data-anon]',root()).value==='1';
    draft.status=$('[data-status]',root()).value;
    saveDraft();
  }
  $('[data-title]',root()).oninput=syncHeader;$('[data-year]',root()).oninput=syncHeader;$('[data-anon]',root()).onchange=syncHeader;$('[data-status]',root()).onchange=syncHeader;

  function draw(){
    wrap.innerHTML=draft.sections.map((sec,si)=>
      '<div class="agSection" data-si="'+si+'">'+
      '<div class="agSectionHead"><input data-sec-title value="'+esc(sec.title||'')+'" placeholder="Titre de la section"><button class="agIconBtn" data-up title="Monter">↑</button><button class="agIconBtn" data-down title="Descendre">↓</button><button class="agIconBtn agRemove" data-del-sec title="Supprimer">×</button></div>'+
      '<div style="padding:0 12px 12px"><div class="agField"><label>Description de la section</label><input data-sec-desc value="'+esc(sec.description||'')+'" placeholder="Facultatif"></div><div data-questions>'+
      (sec.questions||[]).map((qu,qi)=>
        '<div class="agQuestion" data-qi="'+qi+'">'+
        '<div class="agQuestionTop"><input data-label value="'+esc(qu.label||'')+'" placeholder="Texte de la question"><select data-type>'+
        '<option value="text" '+(qu.type==='text'?'selected':'')+'>Réponse libre</option>'+
        '<option value="yesno" '+(qu.type==='yesno'?'selected':'')+'>Oui / Non</option>'+
        '<option value="scale" '+(qu.type==='scale'?'selected':'')+'>Note de 1 à 5</option>'+
        '<option value="single" '+(qu.type==='single'?'selected':'')+'>Choix unique</option>'+
        '<option value="multi" '+(qu.type==='multi'?'selected':'')+'>Choix multiples</option>'+
        '</select><div class="agQActions"><button class="agIconBtn" data-q-up>↑</button><button class="agIconBtn" data-q-down>↓</button><button class="agIconBtn" data-dup>⧉</button><button class="agIconBtn agRemove" data-del>×</button></div></div>'+
        ((qu.type==='single'||qu.type==='multi')?'<div class="agField"><label>Options (séparées par des virgules)</label><input data-options value="'+esc((qu.options||[]).join(', '))+'"></div>':'')+
        '<label class="agRequired"><input type="checkbox" data-required '+(qu.required?'checked':'')+'> Question obligatoire</label>'+
        '</div>'
      ).join('')+
      '</div><button class="agBtn" data-add-q style="margin-top:10px">＋ Ajouter une question</button></div></div>'
    ).join('');

    $$('[data-si]',wrap).forEach(secEl=>{
      const si=Number(secEl.dataset.si),sec=draft.sections[si];
      $('[data-sec-title]',secEl).oninput=e=>{sec.title=e.target.value;saveDraft()};
      $('[data-sec-desc]',secEl).oninput=e=>{sec.description=e.target.value;saveDraft()};
      $('[data-up]',secEl).onclick=()=>{if(si>0){[draft.sections[si-1],draft.sections[si]]=[draft.sections[si],draft.sections[si-1]];saveDraft();draw()}};
      $('[data-down]',secEl).onclick=()=>{if(si<draft.sections.length-1){[draft.sections[si+1],draft.sections[si]]=[draft.sections[si],draft.sections[si+1]];saveDraft();draw()}};
      $('[data-del-sec]',secEl).onclick=()=>{if(draft.sections.length===1)return alert('Il faut conserver au moins une section.');draft.sections.splice(si,1);saveDraft();draw()};
      $('[data-add-q]',secEl).onclick=()=>{sec.questions.push({id:uid('q'),label:'',type:'text',required:false,options:[]});saveDraft();draw()};
      $$('[data-qi]',secEl).forEach(qEl=>{
        const qi=Number(qEl.dataset.qi),qu=sec.questions[qi];
        $('[data-label]',qEl).oninput=e=>{qu.label=e.target.value;saveDraft()};
        $('[data-type]',qEl).onchange=e=>{qu.type=e.target.value;if(!Array.isArray(qu.options))qu.options=[];saveDraft();draw()};
        $('[data-required]',qEl).onchange=e=>{qu.required=e.target.checked;saveDraft()};
        $('[data-options]',qEl)?.addEventListener('input',e=>{qu.options=e.target.value.split(',').map(x=>x.trim()).filter(Boolean);saveDraft()});
        $('[data-q-up]',qEl).onclick=()=>{if(qi>0){[sec.questions[qi-1],sec.questions[qi]]=[sec.questions[qi],sec.questions[qi-1]];saveDraft();draw()}};
        $('[data-q-down]',qEl).onclick=()=>{if(qi<sec.questions.length-1){[sec.questions[qi+1],sec.questions[qi]]=[sec.questions[qi],sec.questions[qi+1]];saveDraft();draw()}};
        $('[data-dup]',qEl).onclick=()=>{sec.questions.splice(qi+1,0,{...qu,id:uid('q'),options:[...(qu.options||[])]});saveDraft();draw()};
        $('[data-del]',qEl).onclick=()=>{sec.questions.splice(qi,1);saveDraft();draw()};
      });
    });
  }
  draw();

  function persist(){
    syncHeader();
    draft.title=draft.title.trim()||'Questionnaire Assemblée générale';
    draft.sections.forEach(s=>{s.title=(s.title||'Section').trim()||'Section';s.questions=(s.questions||[]).filter(q=>(q.label||'').trim())});
    if(!allQuestions(draft).length)return alert('Ajoute au moins une question.');
    audit(draft,'Enregistrement du questionnaire',allQuestions(draft).length+' question(s)');
    saveCampaign(draft);activeId=draft.id;clearDraft();draft=null;campaign(activeId,'overview');
  }
  $('[data-back]',root()).onclick=()=>{saveDraft();newWizard()};
  $('[data-add-section]',root()).onclick=()=>{draft.sections.push({id:uid('sec'),title:'Nouvelle section',description:'',questions:[]});saveDraft();draw()};
  $('[data-preview]',root()).onclick=previewDraft;
  $('[data-save]',root()).onclick=persist;$('[data-save-bottom]',root()).onclick=persist;
}

function previewDraft(){
  syncDraftFromStorage();
  showRoot();
  const c=draft||restoreDraft();if(!c)return builder();
  root().innerHTML=
    '<button class="back" data-back>← Retour au concepteur</button>'+
    '<div class="agTop"><div><h1>Aperçu du questionnaire</h1><p>'+esc(c.title)+'</p></div></div>'+
    '<div class="agPreview">'+renderFormFields(c,false)+'</div>';
  $('[data-back]',root()).onclick=builder;
}
function syncDraftFromStorage(){const d=restoreDraft();if(d)draft=d}

function renderFormFields(c,interactive=true,answers={}){
  return (c.sections||[]).map(sec=>
    '<div style="margin-bottom:18px"><h3 style="margin:0 0 4px">'+esc(sec.title)+'</h3>'+(sec.description?'<div class="agMeta">'+esc(sec.description)+'</div>':'')+
    (sec.questions||[]).map(qu=>'<div class="agPreviewQ"><b>'+esc(qu.label)+(qu.required?' *':'')+'</b>'+answerControl(qu,interactive,answers[qu.id])+'</div>').join('')+'</div>'
  ).join('');
}
function answerControl(qu,interactive,val){
  const dis=interactive?'':' disabled';
  if(qu.type==='yesno')return '<select data-answer="'+esc(qu.id)+'"'+dis+'><option value=""></option><option '+(val==='Oui'?'selected':'')+'>Oui</option><option '+(val==='Non'?'selected':'')+'>Non</option></select>';
  if(qu.type==='scale')return '<select data-answer="'+esc(qu.id)+'"'+dis+'><option value=""></option>'+[1,2,3,4,5].map(n=>'<option '+(String(val)===String(n)?'selected':'')+'>'+n+'</option>').join('')+'</select>';
  if(qu.type==='single')return '<select data-answer="'+esc(qu.id)+'"'+dis+'><option value=""></option>'+(qu.options||[]).map(o=>'<option '+(String(val)===String(o)?'selected':'')+'>'+esc(o)+'</option>').join('')+'</select>';
  if(qu.type==='multi')return '<div class="agChoiceList" data-multi="'+esc(qu.id)+'">'+(qu.options||[]).map(o=>'<label class="agChoice"><input type="checkbox" value="'+esc(o)+'" '+(Array.isArray(val)&&val.includes(o)?'checked':'')+dis+'> '+esc(o)+'</label>').join('')+'</div>';
  return '<textarea data-answer="'+esc(qu.id)+'" placeholder="Réponse…"'+dis+'>'+esc(val||'')+'</textarea>';
}

function campaign(id,tab='overview'){
  activeId=id;screen='campaign';showRoot();style();
  const c=getCampaign(id);if(!c)return home();
  root().innerHTML=
    '<button class="back" data-back>← Tous les questionnaires</button>'+
    '<div class="agBanner"><div><span class="agStatus">'+statusLabel(c.status)+'</span><h2>'+esc(c.title)+'</h2><p>'+esc(c.year||'')+' • '+allQuestions(c).length+' question(s) • '+(c.responses||[]).length+' réponse(s)</p></div><div class="agToolbar">'+
    (c.status==='draft'?'<button class="agPrimary" data-open-c>Ouvrir la consultation</button>':c.status==='open'?'<button class="agBtn" data-close-c>Clôturer</button>':'<button class="agBtn" data-reopen>Réouvrir</button>')+
    '<button class="agBtn" data-print>Imprimer</button></div></div>'+
    '<div class="agTabs">'+
      '<button class="agTab '+(tab==='overview'?'active':'')+'" data-tab="overview">Vue d’ensemble</button>'+
      '<button class="agTab '+(tab==='collect'?'active':'')+'" data-tab="collect">Collecte</button>'+
      '<button class="agTab '+(tab==='responses'?'active':'')+'" data-tab="responses">Réponses</button>'+
      '<button class="agTab '+(tab==='results'?'active':'')+'" data-tab="results">Dépouillement</button>'+
      '<button class="agTab '+(tab==='settings'?'active':'')+'" data-tab="settings">Paramètres</button>'+
    '</div><div data-content></div>';
  $('[data-back]',root()).onclick=home;
  $$('[data-tab]',root()).forEach(b=>b.onclick=()=>campaign(id,b.dataset.tab));
  $('[data-open-c]',root())?.addEventListener('click',()=>{c.status='open';audit(c,'Consultation ouverte');saveCampaign(c);campaign(id,'overview')});
  $('[data-close-c]',root())?.addEventListener('click',()=>{c.status='closed';audit(c,'Consultation clôturée');saveCampaign(c);campaign(id,'results')});
  $('[data-reopen]',root())?.addEventListener('click',()=>{c.status='open';audit(c,'Consultation réouverte');saveCampaign(c);campaign(id,'overview')});
  $('[data-print]',root()).onclick=()=>window.print();
  if(tab==='overview')overview(c);else if(tab==='collect')collect(c);else if(tab==='responses')responses(c);else if(tab==='results')results(c);else settings(c);
}

function overview(c){
  const qs=allQuestions(c),resp=c.responses||[];
  $('[data-content]',root()).innerHTML=
    '<div class="agKpis">'+
    '<div class="agKpi"><b>'+resp.length+'</b><span>réponses</span></div>'+
    '<div class="agKpi"><b>'+avgCompletion(c)+' %</b><span>complétion moyenne</span></div>'+
    '<div class="agKpi"><b>'+qs.filter(q=>q.required).length+'</b><span>questions obligatoires</span></div>'+
    '<div class="agKpi"><b>'+new Set(resp.map(r=>r.channel||'manual')).size+'</b><span>mode(s) de collecte</span></div></div>'+
    '<div class="agTwo"><div class="agPanel"><h3>Structure du questionnaire</h3>'+
    (c.sections||[]).map((s,i)=>'<div class="agResult"><b>'+esc((i+1)+'. '+s.title)+'</b><div class="agMeta">'+(s.questions||[]).length+' question(s)</div></div>').join('')+
    '</div><div class="agPanel"><h3>Historique</h3><div class="agAudit">'+((c.audit||[]).length?(c.audit||[]).slice(0,12).map(a=>'<div class="agAuditItem"><b>'+esc(a.action)+'</b><span>'+new Date(a.at).toLocaleString('fr-FR')+(a.detail?' • '+esc(a.detail):'')+'</span></div>').join(''):'<div class="agMeta">Aucune activité.</div>')+'</div></div></div>';
}

function collect(c){
  $('[data-content]',root()).innerHTML=
    '<div class="agTwo"><div class="agPanel"><h3>Questionnaires papier</h3><p class="agMeta">Saisie rapide après l’Assemblée générale. Chaque formulaire enregistré reçoit un numéro.</p><div class="agToolbar"><button class="agPrimary" data-enter>＋ Saisir un questionnaire rempli</button></div></div>'+
    '<div class="agPanel"><h3>Import de réponses</h3><p class="agMeta">Importe un CSV exporté depuis un autre outil. Les colonnes doivent porter le texte des questions.</p><div class="agToolbar"><button class="agBtn" data-csv>Importer un CSV</button></div><input data-csv-file type="file" accept=".csv,text/csv" hidden></div></div>'+
    '<div class="agPanel"><h3>Mode collecte</h3><div class="agNotice">'+(c.status==='open'?'La consultation est ouverte. Tu peux saisir les réponses au fur et à mesure.':'Le questionnaire est actuellement '+statusLabel(c.status).toLowerCase()+'. Tu peux quand même saisir des questionnaires papier.')+'</div></div>';
  $('[data-enter]',root()).onclick=()=>entry(c.id);
  $('[data-csv]',root()).onclick=()=>$('[data-csv-file]',root()).click();
  $('[data-csv-file]',root()).onchange=e=>importResponsesCSV(c,e.target.files[0]);
}

function entry(id,existing=null){
  const c=getCampaign(id);if(!c)return;
  showRoot();screen='entry';
  const number=(c.responses||[]).length+1,answers=existing?.answers||{};
  root().innerHTML=
    '<button class="back" data-back>← Retour à la collecte</button>'+
    '<div class="agTop"><div><h1>Saisie d’un questionnaire</h1><p>Questionnaire papier n° '+number+' • sauvegarde au moment de l’enregistrement</p></div></div>'+
    '<div class="agCollector"><div class="agPanel">'+
    (!c.settings?.anonymous?'<div class="agField"><label>Nom du répondant (facultatif)</label><input data-name value="'+esc(existing?.respondent||'')+'"></div>':'')+
    renderFormFields(c,true,answers)+
    '<div class="agToolbar"><button class="agPrimary" data-save>Enregistrer</button><button class="agBtn" data-next>Enregistrer et saisir le suivant</button></div></div></div>';
  $('[data-back]',root()).onclick=()=>campaign(id,'collect');
  function collectAnswers(){
    const a={};
    allQuestions(c).forEach(qu=>{
      if(qu.type==='multi')a[qu.id]=$$('[data-multi="'+qu.id+'"] input:checked',root()).map(x=>x.value);
      else a[qu.id]=$('[data-answer="'+qu.id+'"]',root())?.value||'';
    });
    return a;
  }
  function valid(a){
    const missing=allQuestions(c).filter(q=>q.required&&(Array.isArray(a[q.id])?a[q.id].length===0:String(a[q.id]??'').trim()===''));
    if(missing.length){alert('Il manque '+missing.length+' réponse(s) obligatoire(s).');return false}return true;
  }
  function store(next){
    const a=collectAnswers();if(!valid(a))return;
    const row={id:existing?.id||uid('resp'),createdAt:existing?.createdAt||now(),updatedAt:now(),channel:'paper',respondent:$('[data-name]',root())?.value||'',answers:a};
    c.responses=c.responses||[];
    const i=c.responses.findIndex(r=>r.id===row.id);if(i<0)c.responses.push(row);else c.responses[i]=row;
    audit(c,'Réponse enregistrée','Questionnaire n° '+c.responses.length);saveCampaign(c);
    next?entry(id):campaign(id,'collect');
  }
  $('[data-save]',root()).onclick=()=>store(false);$('[data-next]',root()).onclick=()=>store(true);
}

function responses(c){
  const rows=c.responses||[];
  $('[data-content]',root()).innerHTML=
    '<div class="agPanel"><div class="agTop" style="margin-bottom:10px"><div><h3>Réponses enregistrées</h3><p>'+rows.length+' questionnaire(s)</p></div><div class="agToolbar"><button class="agBtn" data-export>Exporter CSV</button></div></div>'+
    (rows.length?'<table class="agTable"><thead><tr><th>N°</th><th>Date</th><th>Canal</th><th>Complétion</th><th></th></tr></thead><tbody>'+
    rows.map((r,i)=>{const qs=allQuestions(c),n=qs.filter(q=>{const v=r.answers?.[q.id];return Array.isArray(v)?v.length:String(v??'').trim()}).length,p=qs.length?Math.round(n*100/qs.length):0;return '<tr data-rid="'+esc(r.id)+'"><td>'+(i+1)+'</td><td>'+new Date(r.createdAt).toLocaleString('fr-FR')+'</td><td>'+esc(r.channel||'papier')+'</td><td>'+p+' %</td><td><button class="agBtn" data-edit>Modifier</button> <button class="agDanger" data-del>Supprimer</button></td></tr>'}).join('')+
    '</tbody></table>':'<div class="agEmpty">Aucune réponse enregistrée.</div>')+'</div>';
  $('[data-export]',root()).onclick=()=>exportCSV(c);
  $$('[data-rid]',root()).forEach(tr=>{
    const id=tr.dataset.rid,r=rows.find(x=>x.id===id);
    $('[data-edit]',tr).onclick=()=>entry(c.id,r);
    $('[data-del]',tr).onclick=()=>{if(confirm('Supprimer cette réponse ?')){c.responses=c.responses.filter(x=>x.id!==id);audit(c,'Réponse supprimée');saveCampaign(c);campaign(c.id,'responses')}};
  });
}

const STOP=new Set('avec alors aussi aucun aucune avoir avez bien car ce ces cette dans des du elle elles en est et etre être eux fait faire faut il ils je la le les leur leurs lui mais mes mon ne nos notre nous on ou par pas plus pour que quel quelle quels quelles qui quoi sa sans se ses si son sont sous sur ta te tes toi ton tous toutes tres très tu un une vos votre vous y'.split(' '));
function keywords(values){
  const m=new Map();
  values.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9\s'-]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w)).forEach(w=>m.set(w,(m.get(w)||0)+1));
  return [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10);
}
function improvementQuestion(q){const n=norm(q.label);return /amelior|suggest|remarque|attente|probleme|priorite|idee|souhait/.test(n)}

function results(c){
  const resp=c.responses||[],qs=allQuestions(c),scaleValues=[];
  qs.filter(q=>q.type==='scale').forEach(q=>resp.forEach(r=>{const n=Number(r.answers?.[q.id]);if(n>=1&&n<=5)scaleValues.push(n)}));
  const globalAvg=scaleValues.length?(scaleValues.reduce((a,b)=>a+b,0)/scaleValues.length).toFixed(2):'—';
  const improveTexts=qs.filter(improvementQuestion).flatMap(q=>resp.map(r=>String(r.answers?.[q.id]||'').trim()).filter(Boolean));
  const improveKw=keywords(improveTexts);
  $('[data-content]',root()).innerHTML=
    '<div class="agKpis"><div class="agKpi"><b>'+resp.length+'</b><span>questionnaires dépouillés</span></div><div class="agKpi"><b>'+avgCompletion(c)+' %</b><span>complétion moyenne</span></div><div class="agKpi"><b>'+globalAvg+'</b><span>note moyenne globale / 5</span></div><div class="agKpi"><b>'+improveTexts.length+'</b><span>remarques d’amélioration</span></div></div>'+
    (improveTexts.length?'<div class="agPanel"><h3>🔎 Points d’amélioration détectés</h3><div class="agMeta">Synthèse automatique des questions libres liées aux améliorations, attentes et suggestions.</div><div class="agKeywords">'+improveKw.map(([w,n])=>'<span class="agKeyword">'+esc(w)+' × '+n+'</span>').join('')+'</div>'+improveTexts.slice(0,10).map(t=>'<div class="agQuote">'+esc(t)+'</div>').join('')+'</div>':'')+
    '<div class="agPanel"><div class="agTop" style="margin-bottom:4px"><div><h3>Dépouillement détaillé</h3><p>Calcul automatique question par question.</p></div><div class="agToolbar"><button class="agBtn" data-csv>CSV</button><button class="agBtn" data-print>Imprimer la synthèse</button></div></div>'+
    (resp.length?qs.map((q,i)=>resultBlock(c,q,i)).join(''):'<div class="agEmpty">Aucune réponse à dépouiller.</div>')+'</div>';
  $('[data-csv]',root()).onclick=()=>exportCSV(c);$('[data-print]',root()).onclick=()=>window.print();
}

function resultBlock(c,q,i){
  const vals=(c.responses||[]).map(r=>r.answers?.[q.id]).filter(v=>Array.isArray(v)?v.length:String(v??'').trim()!=='');
  const head='<div class="agResult"><h4>'+(i+1)+'. '+esc(q.label)+'</h4><small>'+vals.length+' réponse(s)</small>';
  if(q.type==='text'){
    const kw=keywords(vals.map(String));
    return head+(kw.length?'<div class="agKeywords">'+kw.map(([w,n])=>'<span class="agKeyword">'+esc(w)+' × '+n+'</span>').join('')+'</div>':'')+vals.slice(0,12).map(v=>'<div class="agQuote">'+esc(v)+'</div>').join('')+'</div>';
  }
  if(q.type==='scale'){
    const nums=vals.map(Number).filter(n=>n>=1&&n<=5),avg=nums.length?(nums.reduce((a,b)=>a+b,0)/nums.length).toFixed(2):'—';
    return head+'<div class="agMeta">Moyenne : <b>'+avg+' / 5</b></div>'+[1,2,3,4,5].map(n=>bar(String(n),nums.filter(v=>v===n).length,nums.length)).join('')+'</div>';
  }
  if(q.type==='multi'){
    const opts=q.options||[],flat=vals.flatMap(v=>Array.isArray(v)?v:[v]);
    return head+opts.map(o=>bar(o,flat.filter(v=>String(v)===String(o)).length,vals.length)).join('')+'</div>';
  }
  const opts=q.type==='yesno'?['Oui','Non']:(q.options||[]);
  return head+opts.map(o=>bar(o,vals.filter(v=>String(v)===String(o)).length,vals.length)).join('')+'</div>';
}
function bar(label,count,total){
  const pct=total?Math.round(count*100/total):0;
  return '<div class="agBarRow"><div><div class="agMeta">'+esc(label)+'</div><div class="agBar"><span style="width:'+pct+'%"></span></div></div><div class="agPercent">'+count+' • '+pct+'%</div></div>';
}

function settings(c){
  $('[data-content]',root()).innerHTML=
    '<div class="agTwo"><div class="agPanel"><h3>Paramètres du questionnaire</h3><div class="agField"><label>Titre</label><input data-title value="'+esc(c.title)+'"></div><div class="agField"><label>Année / saison</label><input data-year value="'+esc(c.year||'')+'"></div><div class="agField"><label>Anonymat</label><select data-anon><option value="1" '+(c.settings?.anonymous?'selected':'')+'>Anonyme</option><option value="0" '+(!c.settings?.anonymous?'selected':'')+'>Nom facultatif</option></select></div><div class="agToolbar" style="margin-top:14px"><button class="agPrimary" data-save>Enregistrer</button><button class="agBtn" data-edit>Modifier les questions</button></div></div>'+
    '<div class="agPanel"><h3>Maintenance</h3><div class="agNotice">Les données de ce module sont sauvegardées dans l’application. Utilise régulièrement « Exporter la sauvegarde » depuis l’accueil de Consultation AG.</div><div class="agToolbar" style="margin-top:14px"><button class="agBtn" data-dup>Dupliquer le questionnaire</button><button class="agDanger" data-delete>Supprimer le questionnaire</button></div></div></div>';
  $('[data-save]',root()).onclick=()=>{c.title=$('[data-title]',root()).value.trim()||c.title;c.year=$('[data-year]',root()).value;c.settings=c.settings||{};c.settings.anonymous=$('[data-anon]',root()).value==='1';audit(c,'Paramètres modifiés');saveCampaign(c);campaign(c.id,'settings')};
  $('[data-edit]',root()).onclick=()=>{draft=JSON.parse(JSON.stringify(c));saveDraft();builder()};
  $('[data-dup]',root()).onclick=()=>{const copy=JSON.parse(JSON.stringify(c));copy.id=uid('ag');copy.title+=' — copie';copy.status='draft';copy.createdAt=now();copy.updatedAt=now();copy.responses=[];copy.audit=[];audit(copy,'Questionnaire dupliqué',c.title);saveCampaign(copy);campaign(copy.id,'overview')};
  $('[data-delete]',root()).onclick=()=>{if(confirm('Supprimer définitivement ce questionnaire et toutes ses réponses ?')){removeCampaign(c.id);home()}};
}

function exportCSV(c){
  const qs=allQuestions(c),rows=[['Numéro','Date','Canal','Répondant',...qs.map(q=>q.label)]];
  (c.responses||[]).forEach((r,i)=>rows.push([i+1,r.createdAt,r.channel||'',r.respondent||'',...qs.map(q=>Array.isArray(r.answers?.[q.id])?r.answers[q.id].join(' | '):(r.answers?.[q.id]||''))]));
  const csv='\ufeff'+rows.map(row=>row.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n');
  downloadBlob(new Blob([csv],{type:'text/csv;charset=utf-8'}),safeName(c.title)+'.csv');
}
function exportBackup(){
  const payload={type:'horticulture-ag-backup',version:APP_VERSION,exportedAt:now(),data:db()};
  downloadBlob(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),'consultation-ag-sauvegarde-'+new Date().toISOString().slice(0,10)+'.json');
}
function importBackup(e){
  const file=e.target.files[0];if(!file)return;
  const r=new FileReader();
  r.onload=()=>{try{const j=JSON.parse(r.result);const data=j.type==='horticulture-ag-backup'?j.data:j;if(!Array.isArray(data.campaigns))throw 0;if(!confirm('Remplacer les données Consultation AG actuelles par cette sauvegarde ?'))return;saveDB({version:APP_VERSION,campaigns:data.campaigns});home()}catch{alert('Sauvegarde non reconnue.')}};
  r.readAsText(file);
}
function importResponsesCSV(c,file){
  if(!file)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const lines=String(r.result).split(/\r?\n/).filter(Boolean),sep=(lines[0].match(/;/g)||[]).length>=(lines[0].match(/,/g)||[]).length?';':',';
    const parse=line=>{const out=[];let cur='',quote=false;for(let i=0;i<line.length;i++){const ch=line[i];if(ch==='"'){if(quote&&line[i+1]==='"'){cur+='"';i++}else quote=!quote}else if(ch===sep&&!quote){out.push(cur);cur=''}else cur+=ch}out.push(cur);return out};
    const head=parse(lines[0]),qs=allQuestions(c),map=qs.map(q=>head.findIndex(h=>norm(h)===norm(q.label)));
    let added=0;
    lines.slice(1).forEach(line=>{const cells=parse(line),answers={};qs.forEach((q,i)=>{const x=map[i];if(x>=0)answers[q.id]=q.type==='multi'?String(cells[x]||'').split('|').map(v=>v.trim()).filter(Boolean):(cells[x]||'')});if(Object.values(answers).some(v=>Array.isArray(v)?v.length:String(v).trim())){c.responses.push({id:uid('resp'),createdAt:now(),updatedAt:now(),channel:'csv',respondent:'',answers});added++}});
    audit(c,'Import CSV',added+' réponse(s) importée(s)');saveCampaign(c);campaign(c.id,'responses');
  }catch{alert('Impossible de lire ce CSV.')}};r.readAsText(file);
}
function safeName(s){return norm(s).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'questionnaire-ag'}
function downloadBlob(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500)}

function hook(){
  $$('[data-module="consultation-ag"],[data-permission="consultation_ag"]').forEach(b=>{
    if(b.dataset.agProHook)return;
    b.dataset.agProHook='1';
    b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();home()},true);
  });
}

style();root();hook();setTimeout(hook,500);window.addEventListener('pageshow',hook);window.addEventListener('horticulture-users-synced',hook);
window.HorticultureAG={open:home,new:newWizard,version:APP_VERSION};
})();