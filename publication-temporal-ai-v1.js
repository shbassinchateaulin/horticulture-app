(()=>{
'use strict';
if(window.__horticulturePublicationTemporalAIV1)return;
window.__horticulturePublicationTemporalAIV1=true;
const DRAFT='horticulture-publication-autosave-v4';
const API_HINT='script.google.com/macros/s/';
const nativeFetch=window.fetch.bind(window);
const emojiRE=/[\u{1F1E6}-\u{1F1FF}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
const clean=s=>String(s||'').replace(emojiRE,'').replace(/[ \t]{2,}/g,' ').replace(/ *\n */g,'\n').trim();
function readDraft(){try{return JSON.parse(localStorage.getItem(DRAFT)||'null')}catch(_){return null}}
function temporalInfo(dateValue){
  if(!dateValue)return{status:'unknown',label:'date non renseignée'};
  const t=Date.parse(dateValue);if(!Number.isFinite(t))return{status:'unknown',label:'date non interprétable'};
  const delta=t-Date.now();
  if(Math.abs(delta)<12*3600000)return{status:'today',label:'événement aujourd’hui'};
  return delta>0?{status:'future',label:'événement futur'}:{status:'past',label:'événement passé'};
}
function temporalInstruction(sortie){
  const type=String(sortie.publicationType||'sortie').toLowerCase();
  const raw=String(sortie.description||'').trim();
  const eventDate=sortie.startDateTime||'';
  const temporal=temporalInfo(eventDate);
  const now=new Date().toISOString();
  const isNews=type==='actualite'||type==='actualité'||type==='news';
  const rules=[
    'RÈGLES OBLIGATOIRES POUR LA PUBLICATION :',
    '- Date actuelle de référence : '+now+'.',
    '- Type de publication : '+(isNews?'ACTUALITÉ':'SORTIE')+'.',
    '- Date de l’événement : '+(eventDate||'non renseignée')+'.',
    '- Situation temporelle calculée : '+temporal.label+'.',
    '- N’utilise AUCUN emoji.',
    '- N’invente aucune information, aucun lieu, aucun horaire, aucun tarif, aucun fait ni aucune activité.',
    '- Le texte doit être naturel, chaleureux, crédible et adapté au site de la Société d’Horticulture et d’Art Floral du Bassin de Châteaulin.',
    '- Ne parle jamais d’un événement futur comme s’il avait déjà eu lieu, et ne propose jamais de venir à un événement déjà terminé.'
  ];
  if(temporal.status==='future')rules.push('- L’événement est FUTUR : rédige au futur ou au présent d’annonce, donne envie de participer et mets en valeur ce que les visiteurs pourront découvrir, sans exagération.');
  else if(temporal.status==='past')rules.push('- L’événement est PASSÉ : rédige comme un compte rendu au passé, valorise ce qui s’est déroulé à partir des seules informations fournies et ne demande pas de s’inscrire.');
  else if(temporal.status==='today')rules.push('- L’événement a lieu AUJOURD’HUI : rédige au présent, de façon informative et attractive, sans prétendre qu’il est déjà terminé.');
  else rules.push('- La date est absente ou incertaine : déduis passé/futur uniquement si le texte le permet clairement. Sinon reste temporellement neutre et n’invente rien.');
  if(isNews)rules.push('- Une ACTUALITÉ peut annoncer un événement futur, relater un événement passé ou transmettre une information générale : choisis automatiquement le bon angle selon la date et le contenu.');
  else rules.push('- Pour une SORTIE future, le texte doit donner envie de participer. Pour une sortie passée, transforme-la en compte rendu et n’incite plus au paiement ou à l’inscription.');
  return rules.join('\n')+'\n\nINFORMATIONS BRUTES À RETRAVAILLER :\n'+raw;
}
window.fetch=async function(input,init){
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(url.includes(API_HINT)&&init&&typeof init.body==='string'){
      let body=null;try{body=JSON.parse(init.body)}catch(_){body=null}
      if(body&&body.action==='generateSortieDescriptionAI'&&body.sortie){
        const s={...body.sortie};
        s.currentDateTime=new Date().toISOString();
        s.temporalStatus=temporalInfo(s.startDateTime).status;
        s.description=temporalInstruction(s);
        body={...body,sortie:s};
        init={...init,body:JSON.stringify(body)};
        const response=await nativeFetch(input,init);
        const text=await response.clone().text();
        let json=null;try{json=JSON.parse(text)}catch(_){return response}
        if(json&&typeof json==='object'){
          if(typeof json.description==='string')json.description=clean(json.description);
          if(typeof json.accessInfo==='string')json.accessInfo=clean(json.accessInfo);
          return new Response(JSON.stringify(json),{status:response.status,statusText:response.statusText,headers:response.headers});
        }
        return response;
      }
    }
  }catch(e){console.warn('Publication temporal AI bridge',e)}
  return nativeFetch(input,init);
};
function addNewsDateField(){
  const root=document.querySelector('#publish.pubV4');if(!root)return;
  const draft=readDraft();if(!draft||draft.type!=='news'||Number(draft.stage||1)!==1)return;
  if(root.querySelector('[data-news-event-date]'))return;
  const text=root.querySelector('textarea[name="text"]');
  if(!text)return;
  const field=document.createElement('div');field.className='p4Field';field.dataset.newsEventDate='1';
  field.innerHTML='<label>Date / heure de l’événement <span style="font-weight:500;color:#78857e">(facultatif)</span></label><input name="date" type="datetime-local" value="'+String(draft.date||'').slice(0,16)+'"><div class="p4Lead" style="margin:6px 0 0">Si vous la renseignez, l’IA saura automatiquement s’il faut annoncer un événement à venir ou raconter un événement passé.</div>';
  const textField=text.closest('.p4Field');textField?.insertAdjacentElement('afterend',field);
}
let timer=0;function refresh(){clearTimeout(timer);timer=setTimeout(addNewsDateField,20)}
new MutationObserver(refresh).observe(document.documentElement,{childList:true,subtree:true});
document.addEventListener('focusin',refresh);refresh();
})();