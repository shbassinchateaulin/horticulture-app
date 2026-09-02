// SortiesCapacity.gs — quota global : inscriptions manuelles + HelloAsso
// L'application reste la source de vérité. Les ajouts manuels sont bloqués au quota.
// Côté HelloAsso v5, l'API publique documentée permet maxEntries à la création mais
// ne documente pas de route pour modifier ensuite maxEntries. On ferme donc
// automatiquement le formulaire quand le quota global est atteint et on le rouvre
// quand une place se libère. Une future route HelloAsso de modification de quota
// pourra être branchée dans sortiesHelloAssoApplyRemaining_ sans changer le reste.
function sortiesCapacityConfig_(s){try{return JSON.parse(String(s&&s.pricing||'{}'))||{}}catch(_){return{}}}
function sortiesCapacityStats_(sortieId){
  const s=sortiesRows_().find(x=>String(x.id)===String(sortieId));
  if(!s)return{ok:false,error:'Sortie introuvable'};
  const cfg=sortiesCapacityConfig_(s),capacity=Math.max(0,Number(cfg.capacity||0));
  const participants=sortiesParticipantsRows_().filter(x=>String(x.sortieId)===String(sortieId));
  const manual=participants.filter(x=>String(x.source||'').toLowerCase()!=='helloasso').reduce((n,x)=>n+Math.max(1,Number(x.places||1)),0);
  const helloasso=participants.filter(x=>String(x.source||'').toLowerCase()==='helloasso').reduce((n,x)=>n+Math.max(1,Number(x.places||1)),0);
  const used=manual+helloasso,remaining=capacity?Math.max(0,capacity-used):null;
  return{ok:true,sortie:s,capacity:capacity,manual:manual,helloasso:helloasso,used:used,remaining:remaining,full:!!capacity&&used>=capacity};
}
function helloAssoPutJson_(path,payload){
  const r=UrlFetchApp.fetch(HA_API+path,{method:'put',contentType:'application/json',headers:{Authorization:'Bearer '+helloAssoToken_(),Accept:'application/json'},payload:JSON.stringify(payload||{}),muteHttpExceptions:true});
  const code=r.getResponseCode(),text=r.getContentText();let j={};try{j=JSON.parse(text||'{}')}catch(_){}
  if(code<200||code>=300)throw new Error('HelloAsso : '+((j.error&&j.error.message)||j.message||text||('HTTP '+code)));
  return j;
}
function sortiesHelloAssoApplyRemaining_(sortieId){
  const st=sortiesCapacityStats_(sortieId);if(!st.ok)return st;
  const s=st.sortie,slug=String(s.helloassoFormSlug||'').trim();
  if(!slug||!st.capacity)return Object.assign(st,{helloassoUpdated:false});
  const cfg=sortiesCapacityConfig_(s),previous=String(cfg.capacityHelloAssoState||'').toLowerCase();
  // Sécurité anti-survente : à 0 place, le formulaire HelloAsso est désactivé.
  // Dès qu'une place est libérée manuellement, il est republié.
  const desired=st.full?'Disabled':'Public';
  if(previous===desired.toLowerCase())return Object.assign(st,{helloassoUpdated:false,helloassoState:desired});
  try{
    const org=helloAssoConfig_();if(!org.ok)return Object.assign(st,{helloassoUpdated:false,warning:org.error});
    helloAssoPutJson_('/organizations/'+encodeURIComponent(org.orgSlug)+'/forms/Event/'+encodeURIComponent(slug)+'/state',{state:desired});
    cfg.capacityHelloAssoState=desired.toLowerCase();cfg.globalRemaining=st.remaining;cfg.globalUsed=st.used;
    const f=sortiesFindRow_(s.id);if(f){f.sh.getRange(f.row,6).setValue(JSON.stringify(cfg));f.sh.getRange(f.row,10).setValue(desired);f.sh.getRange(f.row,12).setValue(new Date().toISOString())}
    sortiesHistoryAdd_(s.id,st.full?'Quota atteint : inscriptions HelloAsso fermées':'Place libérée : inscriptions HelloAsso rouvertes');
    return Object.assign(st,{helloassoUpdated:true,helloassoState:desired});
  }catch(e){return Object.assign(st,{helloassoUpdated:false,warning:String(e.message||e)})}
}
function sortiesParticipantCapacitySave_(p){
  p=p||{};const sortieId=String(p.sortieId||'');if(!sortieId)return{ok:false,error:'Sortie manquante'};
  const st=sortiesCapacityStats_(sortieId);if(!st.ok)return st;
  if(st.capacity){
    const wanted=Math.max(1,Number(p.places||1));
    const old=sortiesParticipantsRows_().find(x=>String(x.id)===String(p.id||''));
    const oldPlaces=old?Math.max(1,Number(old.places||1)):0;
    const available=Math.max(0,st.capacity-(st.used-oldPlaces));
    if(wanted>available)return{ok:false,error:available?('Il ne reste que '+available+' place(s) disponible(s).'):'La sortie est complète.',capacity:st.capacity,used:st.used,remaining:available};
  }
  const r=sortiesAdminSaveParticipant_(p);if(r&&r.ok)r.capacitySync=sortiesHelloAssoApplyRemaining_(sortieId);return r;
}
function sortiesParticipantCapacityDelete_(id){
  const p=sortiesParticipantsRows_().find(x=>String(x.id)===String(id));
  const sortieId=p&&p.sortieId||'';const r=sortiesAdminDeleteParticipant_(id);
  if(r&&r.ok&&sortieId)r.capacitySync=sortiesHelloAssoApplyRemaining_(sortieId);return r;
}
function sortiesSyncAllCapacities_(){return sortiesRows_().map(s=>sortiesHelloAssoApplyRemaining_(s.id))}
