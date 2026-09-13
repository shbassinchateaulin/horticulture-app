(()=>{
'use strict';
if(window.__horticulturePublicationWorkflowV2)return;
window.__horticulturePublicationWorkflowV2=true;

const PUB_STORE='horticulture-publications-v2';
const DRAFT_STORE='horticulture-publication-autosave-v2';
const SORTIES_STORE='horticulture-sorties-safe-v2';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>crypto.randomUUID?crypto.randomUUID():'pub-'+Date.now()+'-'+Math.random().toString(16).slice(2);

function read(key,fallback=[]){try{const v=JSON.parse(localStorage.getItem(key)||'');return v??fallback}catch(_){return fallback}}
function write(key,v){try{localStorage.setItem(key,JSON.stringify(v))}catch(_){}}
function sorties(){const v=read(SORTIES_STORE,[]);return Array.isArray(v)?v:[]}
function publications(){const v=read(PUB_STORE,[]);return Array.isArray(v)?v:[]}
function extra(s){try{return JSON.parse(String(s?.pricing||'{}'))||{}}catch(_){return{}}}
function fmtDate(v){if(!v)return'';try{return new Intl.DateTimeFormat('fr-FR',{dateStyle:'long',timeStyle:'short'}).format(new Date(v))}catch(_){return String(v).replace('T',' à ')}}
function savePublication(p){const rows=publications().filter(x=>x.id!==p.id);rows.unshift(p);write(PUB_STORE,rows)}
function money(v){return Number(v||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}

function addStyle(){
 if($('#pubFlowStyleV2'))return;
 $('#pubFlowStyleV1')?.remove();
 const s=document.createElement('style');
 s.id='pubFlowStyleV2';
 s.textContent=`
 #publish.pubFlow{max-width:1080px;margin:0 auto;padding-bottom:110px}
 .pubBack{border:0;background:transparent;color:#07583f;font-weight:800;padding:6px 0 14px}
 .pubHead{margin-bottom:16px}.pubHead h1{margin:0;font-size:30px}.pubSub{color:#6d7d75;font-size:13px;margin-top:4px}
 .pubSteps{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0 18px}
 .pubStep{border:1px solid #e2e8e4;background:#fff;border-radius:14px;padding:11px;text-align:center;color:#7c8882;font-size:11px;font-weight:800}
 .pubStep.on{background:#eaf6ee;color:#07583f;border-color:#bcd9c7}.pubStep.current{box-shadow:0 0 0 2px #07583f inset}
 .pubType{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 16px}
 .pubTypeBtn{border:1px solid #dfe7e2;background:#fff;border-radius:18px;padding:16px;text-align:left;display:flex;gap:12px;align-items:center}
 .pubTypeBtn.active{border:2px solid #07583f;background:#f2f8f4}.pubTypeIcon{width:42px;height:42px;border-radius:12px;background:#eaf5ed;color:#07583f;display:grid;place-items:center;font-size:20px;flex:0 0 auto}
 .pubTypeBtn b{display:block}.pubTypeBtn small{display:block;color:#6c7972;margin-top:3px;line-height:1.35}
 .pubCard{background:#fff;border:1px solid #e1e8e3;border-radius:20px;padding:18px;box-shadow:0 5px 20px #0a3d2c08}
 .pubCard h2{font-size:18px;margin:0 0 5px}.pubLead{font-size:12px;color:#6d7d75;margin-bottom:15px;line-height:1.45}
 .pubField{display:grid;gap:6px;margin:12px 0}.pubField label{font-size:12px;font-weight:850}
 .pubField input,.pubField textarea,.pubField select{width:100%;border:1px solid #dbe4de;border-radius:13px;padding:12px;background:#fff}
 .pubField textarea{min-height:125px;resize:vertical}.pubGrid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
 .pubChoice{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:10px 0 16px}.pubChoice button{border:1px solid #dce5df;background:#fff;border-radius:14px;padding:14px;text-align:left}
 .pubChoice button.active{border:2px solid #07583f;background:#f4faf6}.pubChoice b{display:block}.pubChoice small{display:block;color:#6d7d75;margin-top:4px}
 .pubNote{border:1px solid #d8e9df;background:#f4faf6;border-radius:13px;padding:12px;color:#416356;font-size:12px;line-height:1.45}
 .pubAuto{display:flex;align-items:center;gap:7px;color:#5f7469;font-size:11px;margin-top:11px}.pubAuto i{width:8px;height:8px;border-radius:50%;background:#28a05c}
 .pubActions{display:flex;gap:9px;flex-wrap:wrap;margin-top:17px}.pubBtn{border:1px solid #dce5df;background:#fff;border-radius:12px;padding:11px 14px;font-weight:800}
 .pubBtn.primary{background:#07583f;color:#fff;border-color:#07583f}.pubBtn.danger{color:#a43c3c;background:#fff8f8;border-color:#edd2d2}
 .pubBtn.ghost{background:#f6f8f7}.pubBtn:disabled{opacity:.45;cursor:not-allowed}
 .pubLoading{display:grid;place-items:center;min-height:260px;text-align:center;color:#07583f}.pubSpinner{width:32px;height:32px;border:3px solid #d6e7dd;border-top-color:#07583f;border-radius:50%;animation:pubSpin .8s linear infinite;margin:auto auto 12px}
 @keyframes pubSpin{to{transform:rotate(360deg)}}
 .pubPreviewShell{background:#e7ebe8;border-radius:22px;padding:18px}.pubBrowser{background:#fff;border:1px solid #d9e2dc;border-radius:17px;overflow:hidden;box-shadow:0 16px 38px #17312616}
 .pubBrowserTop{height:40px;background:#f3f5f4;border-bottom:1px solid #e1e7e3;display:flex;align-items:center;gap:6px;padding:0 12px}.pubDot{width:8px;height:8px;border-radius:50%;background:#c4cbc7}.pubUrl{margin-left:8px;background:#fff;border:1px solid #e0e5e2;border-radius:8px;padding:5px 10px;color:#859089;font-size:10px;flex:1}
 .pubSiteMockHead{background:#fff;padding:15px 18px;border-bottom:1px solid #eef1ef;display:flex;align-items:center;gap:10px}.pubSiteMockHead img{width:38px;height:38px;object-fit:contain}.pubSiteMockHead b{font-size:12px;color:#174333}
 .pubPreviewBody{padding:18px}.pubHero{height:220px;border-radius:15px;background:linear-gradient(135deg,#d8ece0,#b9d9c4);display:grid;place-items:center;color:#557063;overflow:hidden}
 .pubHero img{width:100%;height:100%;object-fit:cover}.pubGallery{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:8px}.pubGallery img{width:100%;height:88px;object-fit:cover;border-radius:10px}
 .pubBadge{display:inline-flex;border-radius:999px;padding:5px 8px;background:#dff2e6;color:#176340;font-size:10px;font-weight:850;margin:14px 0 7px}
 .pubPreviewBody h3{margin:0 0 8px;font-size:25px;color:#173126}.pubMeta{display:flex;gap:12px;flex-wrap:wrap;color:#66756d;font-size:12px;margin:8px 0}.pubPreviewText{font-size:14px;line-height:1.65;color:#33483f;white-space:pre-wrap}
 .pubHello{display:inline-flex;margin-top:13px;background:#07583f;color:#fff;border-radius:11px;padding:10px 13px;font-weight:800}
 .pubEditGrid{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:14px;margin-top:14px}.pubPhotos{display:grid;gap:8px}.pubPhotoRow{display:grid;grid-template-columns:58px 1fr auto;gap:9px;align-items:center;border:1px solid #e3e9e5;border-radius:12px;padding:8px}
 .pubPhotoRow img{width:58px;height:48px;object-fit:cover;border-radius:8px}.pubPhotoRow button{border:0;background:#fff0f0;color:#a43c3c;border-radius:8px;padding:7px 8px}
 .pubCopyGrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pubCopy{border:1px solid #e0e7e2;border-radius:13px;padding:11px;background:#fff}.pubCopyTop{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:6px}.pubCopyTop b{font-size:11px}.pubCopy button{border:1px solid #cfe0d5;background:#f5faf7;color:#07583f;border-radius:8px;padding:6px 8px;font-size:10px;font-weight:800}.pubCopy pre{margin:0;white-space:pre-wrap;font:11px/1.45 system-ui;color:#354c41}
 .pubHelloStage{display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:14px}.pubHelloFrame{border:1px solid #e1e8e3;border-radius:16px;overflow:hidden;background:#fafbfa;min-height:520px}.pubHelloFrameHead{display:flex;justify-content:space-between;align-items:center;padding:11px 12px;background:#fff;border-bottom:1px solid #e1e8e3}.pubHelloFrame iframe{display:block;width:100%;height:470px;border:0;background:#fff}.pubHelloFallback{font-size:11px;color:#6d7d75;padding:10px}
 .pubDone{text-align:center;padding:30px 12px}.pubDoneIcon{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;margin:0 auto 12px;background:#e6f5eb;color:#087a51;font-size:28px}
 .pubList{margin-top:16px}.pubRow{display:grid;grid-template-columns:1fr auto auto;gap:10px;padding:11px 3px;border-bottom:1px solid #edf1ee;align-items:center;font-size:12px}.pubSmall{font-size:11px;color:#748078}
 @media(max-width:800px){
   #publish.pubFlow{padding:4px 0 96px}.pubHead h1{font-size:26px}.pubSteps{gap:5px;margin-top:12px}.pubStep{padding:9px 3px;font-size:9px;border-radius:11px}.pubStep span{display:none}
   .pubType{grid-template-columns:1fr;gap:8px}.pubTypeBtn{padding:13px}.pubGrid2,.pubChoice,.pubCopyGrid,.pubHelloStage,.pubEditGrid{grid-template-columns:1fr}
   .pubCard{padding:14px;border-radius:17px}.pubField input,.pubField textarea,.pubField select{font-size:16px}.pubActions{display:grid;grid-template-columns:1fr}.pubActions .pubBtn{width:100%}
   .pubPreviewShell{padding:8px;border-radius:17px;margin-left:-4px;margin-right:-4px}.pubBrowser{border-radius:13px}.pubPreviewBody{padding:14px}.pubHero{height:185px}.pubPreviewBody h3{font-size:22px}
   .pubGallery{grid-template-columns:1fr 1fr}.pubGallery img{height:105px}.pubHelloFrame{min-height:430px}.pubHelloFrame iframe{height:390px}.pubRow{grid-template-columns:1fr auto}.pubRow>span{display:none}
 }
 `;
 document.head.appendChild(s);
}

function newDraft(type='news'){
 return {id:uid(),type,stage:1,status:'draft',title:'',text:'',generatedTitle:'',generatedText:'',date:'',location:'',images:[],sourceMode:'existing',sourceSortieId:'',helloassoUrl:'',helloDone:false,updatedAt:new Date().toISOString(),createdAt:new Date().toISOString()};
}

function enhance(){
 const root=$('#publish');
 if(!root||root.dataset.pubFlowV2==='1')return;
 addStyle();
 root.dataset.pubFlowV2='1';
 root.classList.add('pubFlow');
 let current=read(DRAFT_STORE,null);
 if(!current||typeof current!=='object')current=newDraft('news');
 let type=current.type||'news';
 let stage=Math.max(1,Math.min(4,Number(current.stage||1)));
 let autosaveTimer=0;

 function autosave(){
   current.type=type;current.stage=stage;current.updatedAt=new Date().toISOString();
   write(DRAFT_STORE,current);
   const t=$('[data-autosave]',root);if(t){t.innerHTML='<i></i> Brouillon enregistré automatiquement';}
 }
 function queueAutosave(){clearTimeout(autosaveTimer);autosaveTimer=setTimeout(autosave,250)}
 function reset(nextType=type){type=nextType;stage=1;current=newDraft(type);autosave();draw()}
 function steps(){
   const labels=type==='sortie'?['Informations','HelloAsso','Aperçu','Publication']:['Contenu','Préparation IA','Aperçu','Publication'];
   return `<div class="pubSteps">${labels.map((x,i)=>`<div class="pubStep ${stage>=i+1?'on':''} ${stage===i+1?'current':''}">${i+1}. <span>${esc(x)}</span></div>`).join('')}</div>`;
 }
 function head(){
   return `<button class="pubBack" data-home>← Retour</button><div class="pubHead"><h1>Publier</h1><div class="pubSub">${stage===1?'Préparez votre contenu. Rien ne sera publié avant la dernière étape.':'Vous pouvez revenir en arrière à tout moment avant la publication.'}</div></div>${steps()}`;
 }
 function typePicker(){
   if(stage!==1)return'';
   return `<div class="pubType"><button class="pubTypeBtn ${type==='news'?'active':''}" data-type="news"><span class="pubTypeIcon">✎</span><span><b>Actualité</b><small>Annonce, compte rendu, information ou événement</small></span></button><button class="pubTypeBtn ${type==='sortie'?'active':''}" data-type="sortie"><span class="pubTypeIcon">↗</span><span><b>Sortie</b><small>Depuis une sortie existante ou avec création HelloAsso semi-automatique</small></span></button></div>`;
 }

 function formNews(){
   return `<div class="pubCard"><h2>Contenu de l’actualité</h2><div class="pubLead">Mettez les informations brutes. À l’étape suivante, le contenu est préparé et les photos sont disposées pour l’aperçu.</div>
   <div class="pubField"><label>Titre *</label><input name="title" value="${esc(current.title)}" placeholder="Titre de l’actualité"></div>
   <div class="pubField"><label>Informations / texte *</label><textarea name="text" placeholder="Écrivez les informations importantes. Le texte pourra être retravaillé ensuite.">${esc(current.text)}</textarea></div>
   <div class="pubGrid2"><div class="pubField"><label>Date</label><input type="date" name="date" value="${esc((current.date||'').slice(0,10))}"></div><div class="pubField"><label>Photos</label><input type="file" name="images" accept="image/*" multiple></div></div>
   ${photoRows(false)}
   <div class="pubAuto" data-autosave><i></i> Brouillon enregistré automatiquement</div>
   <div class="pubActions"><button class="pubBtn primary" data-next>Passer à l’étape suivante</button></div></div>`;
 }
 function formSortie(){
   const opts=sorties().map(s=>`<option value="${esc(s.id)}" ${current.sourceSortieId===String(s.id)?'selected':''}>${esc(s.title||'Sortie sans titre')} — ${esc(fmtDate(extra(s).startDateTime||s.date))}</option>`).join('');
   return `<div class="pubCard"><h2>Choisir la sortie</h2><div class="pubLead">Si la sortie existe déjà dans l’administration, ses informations et son lien HelloAsso sont repris. Sinon, vous créez d’abord la sortie puis la billetterie de façon semi-automatique.</div>
   <div class="pubChoice"><button data-source="existing" class="${current.sourceMode!=='new'?'active':''}"><b>Sortie déjà créée</b><small>Réutiliser une sortie existante</small></button><button data-source="new" class="${current.sourceMode==='new'?'active':''}"><b>Créer une nouvelle sortie</b><small>Préparer HelloAsso avec copier-coller</small></button></div>
   ${current.sourceMode==='new'?newSortieFields():`<div class="pubField"><label>Sortie existante *</label><select name="sourceSortieId"><option value="">Choisir une sortie…</option>${opts}</select></div>${existingSortieSummary()}`}
   <div class="pubField"><label>Photos pour la publication</label><input type="file" name="images" accept="image/*" multiple></div>${photoRows(false)}
   <div class="pubAuto" data-autosave><i></i> Brouillon enregistré automatiquement</div>
   <div class="pubActions"><button class="pubBtn primary" data-next>${current.sourceMode==='new'?'Préparer la sortie et HelloAsso':'Passer à l’étape suivante'}</button></div></div>`;
 }
 function newSortieFields(){
   return `<div class="pubField"><label>Nom de la sortie *</label><input name="title" value="${esc(current.title)}" placeholder="Nom de la sortie"></div>
   <div class="pubField"><label>Description de base *</label><textarea name="text" placeholder="Informations principales de la sortie">${esc(current.text)}</textarea></div>
   <div class="pubGrid2"><div class="pubField"><label>Date / heure *</label><input type="datetime-local" name="date" value="${esc((current.date||'').slice(0,16))}"></div><div class="pubField"><label>Lieu *</label><input name="location" value="${esc(current.location)}" placeholder="Lieu ou adresse"></div></div>
   <div class="pubGrid2"><div class="pubField"><label>Nombre de places</label><input type="number" min="1" name="capacity" value="${esc(current.capacity||40)}"></div><div class="pubField"><label>Tarif</label><input name="priceText" value="${esc(current.priceText||'')}" placeholder="Ex. 12 € adhérent / 18 € non-adhérent"></div></div>`;
 }
 function existingSortieSummary(){
   if(!current.sourceSortieId)return `<div class="pubNote">Choisissez une sortie. Le lien HelloAsso déjà enregistré dans la fiche sera repris automatiquement.</div>`;
   return `<div class="pubNote"><b>${esc(current.title||'Sortie')}</b><br>${current.date?esc(fmtDate(current.date))+'<br>':''}${current.location?esc(current.location)+'<br>':''}${current.helloassoUrl?'HelloAsso déjà associé ✓':'Aucun lien HelloAsso enregistré dans cette sortie.'}</div>`;
 }

 function syncForm(){
   const val=n=>root.querySelector(`[name="${n}"]`)?.value;
   if(root.querySelector('[name="title"]'))current.title=(val('title')||'').trim();
   if(root.querySelector('[name="text"]'))current.text=(val('text')||'').trim();
   if(root.querySelector('[name="date"]'))current.date=val('date')||'';
   if(root.querySelector('[name="location"]'))current.location=(val('location')||'').trim();
   if(root.querySelector('[name="capacity"]'))current.capacity=Number(val('capacity')||40);
   if(root.querySelector('[name="priceText"]'))current.priceText=(val('priceText')||'').trim();
   if(root.querySelector('[name="sourceSortieId"]'))current.sourceSortieId=val('sourceSortieId')||'';
   queueAutosave();
 }
 function loadExisting(id){
   const s=sorties().find(x=>String(x.id)===String(id));if(!s)return;
   const p=extra(s);
   current.sourceSortieId=String(s.id);
   current.title=s.title||'';
   current.text=s.notes||s.description||'';
   current.date=p.startDateTime||s.date||'';
   current.location=s.location||'';
   current.helloassoUrl=p.helloassoUrl||s.helloassoUrl||'';
   current.capacity=p.capacity||'';
   current.priceText=p.mode==='paid'?`Adhérent : ${money(p.memberPrice)} — Non-adhérent : ${money(p.nonMemberPrice)}`:'Gratuit';
   autosave();draw();
 }
 function photoRows(editable=true){
   const imgs=Array.isArray(current.images)?current.images:[];
   if(!imgs.length)return `<div class="pubNote" style="margin-top:8px">Aucune photo ajoutée pour le moment.</div>`;
   return `<div class="pubPhotos">${imgs.map((src,i)=>`<div class="pubPhotoRow"><img src="${esc(src)}" alt=""><span>Photo ${i+1}</span>${editable?`<button type="button" data-remove-photo="${i}">Supprimer</button>`:''}</div>`).join('')}</div>`;
 }
 function addImages(files){
   const list=[...files||[]];if(!list.length)return;
   let left=list.length;
   list.forEach(file=>{const r=new FileReader();r.onload=()=>{current.images=current.images||[];current.images.push(String(r.result||''));left--;if(left===0){autosave();draw()}};r.readAsDataURL(file)});
 }

 function prepareContent(){
   current.generatedTitle=(current.title||'').trim();
   current.generatedText=(current.text||'').trim();
   if(type==='sortie'&&current.location&&current.generatedText&&!current.generatedText.includes(current.location)){
     current.generatedText+=`\n\nLieu : ${current.location}.`;
   }
   current.stage=stage=type==='sortie'&&current.sourceMode==='new'?2:3;
   autosave();
   draw();
 }
 function loadingThenPrepare(){
   syncForm();
   if(!current.title||!current.text)return alert('Ajoutez au minimum un titre et un texte.');
   stage=2;current.stage=2;autosave();
   root.innerHTML=head()+`<div class="pubCard pubLoading"><div><div class="pubSpinner"></div><b>Préparation du contenu…</b><div class="pubLead" style="margin-top:8px">Le texte et les photos sont préparés pour l’aperçu avant publication.</div></div></div>`;
   setTimeout(prepareContent,650);
 }

 function helloTexts(){
   return {
     name:current.title||'',
     short:(current.text||'').split(/\n|\./)[0]+'.',
     description:current.text||'',
     dates:current.date?fmtDate(current.date):'À préciser',
     location:current.location||'À préciser',
     price:current.priceText||'À préciser',
     capacity:current.capacity?`${current.capacity} places maximum`:'À préciser',
     practical:`Sortie organisée par la Société d’Horticulture et d’Art Floral du Bassin de Châteaulin.`
   };
 }
 function copyBox(label,text,key){
   return `<div class="pubCopy"><div class="pubCopyTop"><b>${esc(label)}</b><button type="button" data-copy="${key}">Copier</button></div><pre>${esc(text||'—')}</pre></div>`;
 }
 function helloStage(){
   const t=helloTexts();
   return `<div class="pubCard"><h2>Créer la billetterie HelloAsso</h2><div class="pubLead">Les champs sont prêts. Copiez-les dans HelloAsso. Une fois la billetterie créée, collez son lien ici avant de continuer.</div>
   <div class="pubHelloStage"><div><div class="pubCopyGrid">${copyBox('Nom',t.name,'name')}${copyBox('Description courte',t.short,'short')}${copyBox('Description détaillée',t.description,'description')}${copyBox('Date / horaire',t.dates,'dates')}${copyBox('Lieu',t.location,'location')}${copyBox('Tarif',t.price,'price')}${copyBox('Places',t.capacity,'capacity')}${copyBox('Informations pratiques',t.practical,'practical')}</div></div>
   <div class="pubHelloFrame"><div class="pubHelloFrameHead"><b>HelloAsso</b><a class="pubBtn primary" href="https://admin.helloasso.com/" target="_blank" rel="noopener">Ouvrir ↗</a></div><iframe title="HelloAsso" src="https://admin.helloasso.com/" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe><div class="pubHelloFallback">Si HelloAsso bloque l’affichage intégré, utilisez « Ouvrir ». Les contenus à copier restent disponibles.</div></div></div>
   <div class="pubField"><label>Lien de la billetterie créée *</label><input name="helloassoUrl" value="${esc(current.helloassoUrl||'')}" placeholder="https://www.helloasso.com/..."></div>
   <div class="pubActions"><button class="pubBtn ghost" data-prev>← Retour</button><button class="pubBtn primary" data-hello-next>Passer à l’aperçu</button></div></div>`;
 }

 function previewMock(){
   const imgs=Array.isArray(current.images)?current.images:[];
   const hero=imgs[0];
   const rest=imgs.slice(1);
   const title=current.generatedTitle||current.title||'Titre';
   const text=current.generatedText||current.text||'';
   return `<div class="pubPreviewShell"><div class="pubBrowser"><div class="pubBrowserTop"><i class="pubDot"></i><i class="pubDot"></i><i class="pubDot"></i><div class="pubUrl">sites.google.com/…/publication</div></div>
   <div class="pubSiteMockHead"><img src="logo-admin-transparent.png" alt=""><b>Société d’Horticulture et d’Art Floral du Bassin de Châteaulin</b></div>
   <div class="pubPreviewBody"><div class="pubHero">${hero?`<img src="${esc(hero)}" alt="">`:'Emplacement de la photo principale'}</div>${rest.length?`<div class="pubGallery">${rest.map(x=>`<img src="${esc(x)}" alt="">`).join('')}</div>`:''}
   <span class="pubBadge">${type==='sortie'?'SORTIE':'ACTUALITÉ'}</span><h3>${esc(title)}</h3>
   ${(current.date||current.location)?`<div class="pubMeta">${current.date?`<span>📅 ${esc(fmtDate(current.date))}</span>`:''}${current.location?`<span>📍 ${esc(current.location)}</span>`:''}</div>`:''}
   <div class="pubPreviewText">${esc(text)}</div>${type==='sortie'&&current.helloassoUrl?`<span class="pubHello">S’inscrire sur HelloAsso</span>`:''}</div></div></div>`;
 }
 function previewStage(){
   return `<div class="pubCard"><h2>Aperçu avant publication</h2><div class="pubLead">Voici le rendu tel qu’il doit apparaître sur le site. Rien n’est encore publié.</div>${previewMock()}
   <div class="pubEditGrid"><div><div class="pubField"><label>Titre</label><input name="generatedTitle" value="${esc(current.generatedTitle||current.title)}"></div><div class="pubField"><label>Texte</label><textarea name="generatedText">${esc(current.generatedText||current.text)}</textarea></div></div><div><div class="pubField"><label>Ajouter des photos</label><input type="file" name="images" accept="image/*" multiple></div>${photoRows(true)}</div></div>
   <div class="pubActions"><button class="pubBtn ghost" data-prev>← Étape précédente</button><button class="pubBtn danger" data-abandon>Abandonner</button><button class="pubBtn primary" data-to-publish>Continuer</button></div></div>`;
 }
 function finalStage(){
   return `<div class="pubCard"><h2>Dernière vérification</h2><div class="pubLead">La publication n’est toujours pas en ligne. Vous pouvez encore revenir modifier le texte ou les photos.</div>${previewMock()}
   <div class="pubActions"><button class="pubBtn ghost" data-prev>← Modifier</button><button class="pubBtn danger" data-abandon>Abandonner</button><button class="pubBtn primary" data-publish>Publier maintenant</button></div></div>`;
 }
 function doneStage(){
   return `<div class="pubCard pubDone"><div class="pubDoneIcon">✓</div><h2>Publication validée</h2><div class="pubLead">La publication a été enregistrée comme publiée dans l’administration.</div><button class="pubBtn primary" data-new>Créer une autre publication</button></div>`;
 }

 function bindCommon(){
   $('[data-home]',root)?.addEventListener('click',()=>window.HorticultureDrawer?.home?.());
   $$('[data-type]',root).forEach(b=>b.onclick=()=>reset(b.dataset.type));
   $$('input,textarea,select',root).forEach(el=>{
     if(el.type==='file'||el.name==='sourceSortieId'||el.name==='generatedTitle'||el.name==='generatedText'||el.name==='helloassoUrl')return;
     el.addEventListener('input',syncForm);
   });
   $('[name=sourceSortieId]',root)?.addEventListener('change',e=>{current.sourceSortieId=e.target.value;if(e.target.value)loadExisting(e.target.value);else{autosave();draw()}});
   $$('[data-source]',root).forEach(b=>b.onclick=()=>{current.sourceMode=b.dataset.source;current.sourceSortieId='';current.helloassoUrl='';current.title='';current.text='';current.date='';current.location='';autosave();draw()});
   $('[name=images]',root)?.addEventListener('change',e=>addImages(e.target.files));
   $$('[data-remove-photo]',root).forEach(b=>b.onclick=()=>{current.images.splice(Number(b.dataset.removePhoto),1);autosave();draw()});
   $$('[data-copy]',root).forEach(b=>b.onclick=()=>{const t=helloTexts()[b.dataset.copy]||'';navigator.clipboard?.writeText(t).then(()=>{const old=b.textContent;b.textContent='Copié ✓';setTimeout(()=>b.textContent=old,1000)}).catch(()=>{})});
   $('[data-prev]',root)?.addEventListener('click',()=>{stage=Math.max(1,stage-1);if(type==='sortie'&&current.sourceMode==='existing'&&stage===2)stage=1;current.stage=stage;autosave();draw()});
   $('[data-abandon]',root)?.addEventListener('click',()=>{if(confirm('Abandonner cette publication ? Le brouillon automatique sera supprimé.')){localStorage.removeItem(DRAFT_STORE);reset(type)}});
 }
 function bind(){
   bindCommon();
   $('[data-next]',root)?.addEventListener('click',()=>{
     syncForm();
     if(type==='news')return loadingThenPrepare();
     if(current.sourceMode==='existing'){
       if(!current.sourceSortieId)return alert('Choisissez une sortie.');
       if(!current.title)return alert('La sortie choisie est incomplète.');
       current.generatedTitle=current.title;current.generatedText=current.text;stage=3;current.stage=3;autosave();draw();return;
     }
     if(!current.title||!current.text||!current.date||!current.location)return alert('Complétez le nom, la description, la date et le lieu.');
     current.generatedTitle=current.title;current.generatedText=current.text;stage=2;current.stage=2;autosave();draw();
   });
   $('[data-hello-next]',root)?.addEventListener('click',()=>{
     const url=$('[name=helloassoUrl]',root)?.value.trim()||'';
     if(!/^https:\/\//i.test(url))return alert('Collez le lien HelloAsso complet avant de continuer.');
     current.helloassoUrl=url;current.helloDone=true;current.generatedTitle=current.title;current.generatedText=current.text;stage=3;current.stage=3;autosave();draw();
   });
   $('[name=generatedTitle]',root)?.addEventListener('input',e=>{current.generatedTitle=e.target.value;queueAutosave()});
   $('[name=generatedText]',root)?.addEventListener('input',e=>{current.generatedText=e.target.value;queueAutosave()});
   $('[data-to-publish]',root)?.addEventListener('click',()=>{current.generatedTitle=$('[name=generatedTitle]',root)?.value.trim()||current.generatedTitle;current.generatedText=$('[name=generatedText]',root)?.value.trim()||current.generatedText;if(!current.generatedTitle||!current.generatedText)return alert('Le titre et le texte ne peuvent pas être vides.');stage=4;current.stage=4;autosave();draw()});
   $('[data-publish]',root)?.addEventListener('click',()=>{current.status='published';current.publishedAt=new Date().toISOString();current.stage=4;savePublication(current);localStorage.removeItem(DRAFT_STORE);root.dataset.done='1';draw()});
   $('[data-new]',root)?.addEventListener('click',()=>{root.dataset.done='';reset('news')});
 }

 function draw(){
   root.innerHTML=head()+typePicker()+(root.dataset.done==='1'?doneStage():stage===1?(type==='news'?formNews():formSortie()):stage===2&&type==='sortie'&&current.sourceMode==='new'?helloStage():stage===3?previewStage():stage===4?finalStage():previewStage())+listHtml();
   bind();
 }
 function listHtml(){
   const rows=publications().slice(0,6);
   return `<div class="pubCard pubList"><h2>Publications récentes</h2><div class="pubLead">Les brouillons en cours sont enregistrés automatiquement.</div>${rows.length?rows.map(p=>`<div class="pubRow"><div><b>${esc(p.generatedTitle||p.title||'Sans titre')}</b><div class="pubSmall">${p.type==='sortie'?'Sortie':'Actualité'} • ${(p.updatedAt||'').slice(0,10)}</div></div><span>${p.status==='published'?'Publiée':'Brouillon'}</span><button class="pubBtn" data-open="${esc(p.id)}">Ouvrir</button></div>`).join(''):`<div class="pubLead">Aucune publication enregistrée.</div>`}</div>`;
 }
 root.addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(!b)return;const p=publications().find(x=>x.id===b.dataset.open);if(!p)return;current={...p,status:'draft',stage:3};type=current.type||'news';stage=3;root.dataset.done='';autosave();draw()});
 draw();
}
function boot(){const root=$('#publish');if(root)enhance();else setTimeout(boot,100)}
boot();
})();