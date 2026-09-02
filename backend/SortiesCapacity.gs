// SortiesCapacity.gs — capacité commune HelloAsso + inscriptions manuelles
function sortiesParticipantCapacitySave_(p){
  p=p||{};
  const sortieId=String(p.sortieId||'');
  if(!sortieId)return{ok:false,error:'Sortie manquante'};
  const s=sortiesRows_().find(x=>String(x.id)===sortieId);
  if(!s)return{ok:false,error:'Sortie introuvable'};
  let cfg={};try{cfg=JSON.parse(String(s.pricing||'{}'))||{}}catch(_){}
  const capacity=Math.max(0,Number(cfg.capacity||0));
  if(capacity){
    const wanted=Math.max(1,Number(p.places||1));
    const used=sortiesParticipantsRows_().filter(x=>x.sortieId===sortieId&&String(x.id)!==String(p.id||'')).reduce((n,x)=>n+Math.max(1,Number(x.places||1)),0);
    const left=Math.max(0,capacity-used);
    if(wanted>left)return{ok:false,error:left?('Il ne reste que '+left+' place(s) disponible(s).'):'La sortie est complète.',capacity:capacity,used:used,remaining:left};
  }
  return sortiesAdminSaveParticipant_(p);
}
