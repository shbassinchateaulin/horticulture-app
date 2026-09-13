// PublicationAI.gs — préparation IA réelle des actualités et sorties avant aperçu Google Sites
function publicationGenerateAI_(p){
  p=p||{};
  if(typeof agAiCall_!=='function')return{ok:false,error:'Service IA non chargé'};
  const type=String(p.type||'news')==='sortie'?'sortie':'actualité';
  const schema={type:'OBJECT',required:['title','description','layout'],properties:{
    title:{type:'STRING'},
    description:{type:'STRING'},
    accessInfo:{type:'STRING'},
    layout:{type:'STRING'},
    ctaText:{type:'STRING'}
  }};
  const prompt=[
    "Tu prépares une publication pour le Google Sites de la Société d'Horticulture et d'Art Floral du Bassin de Châteaulin.",
    'Type de publication : '+type+'.',
    'Le rendu doit être chaleureux, élégant, lisible sur téléphone et donner envie de lire'+(type==='sortie'?' et de s’inscrire':'')+'.',
    'Tu dois rester STRICTEMENT dans ce qui est réalisable avec Google Sites : grand bandeau, titre, paragraphes, images en blocs/grilles simples et bouton de lien.',
    'N’invente aucune date, aucun lieu, aucun prix, aucune information pratique.',
    'Réécris le titre si nécessaire sans le rendre artificiel.',
    'Réécris le texte en français naturel, en 2 à 5 paragraphes courts, avec une vraie hiérarchie et sans répétitions.',
    'Pour layout, choisis uniquement parmi : hero, editorial, gallery, story.',
    'hero = une grande image puis le texte ; editorial = image principale + petites images ; gallery = plusieurs images mises en avant ; story = texte entrecoupé de photos.',
    type==='sortie'?'Si un lien HelloAsso existe, propose un ctaText court du type « S’inscrire / Payer sur HelloAsso ».':'Pour une actualité, laisse ctaText vide sauf si les données fournissent explicitement un lien utile.',
    type==='sortie'?'Génère accessInfo uniquement avec les informations certaines disponibles ; sinon reste général.':'Laisse accessInfo vide pour une actualité sauf nécessité évidente.',
    'Données fournies :',JSON.stringify(p)
  ].join('\n');
  try{
    const r=agAiCall_([{text:prompt}],schema);
    if(!r||!r.ok||!r.data)return{ok:false,error:(r&&r.error)||'L’IA n’a pas répondu'};
    return{ok:true,title:String(r.data.title||p.title||'').trim(),description:String(r.data.description||p.text||'').trim(),accessInfo:String(r.data.accessInfo||'').trim(),layout:String(r.data.layout||'editorial').trim(),ctaText:String(r.data.ctaText||'').trim(),model:r.model||''};
  }catch(e){return{ok:false,error:String(e&&e.message||e)}}
}
