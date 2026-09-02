// SortiesHelloAssoAuto.gs — création HelloAsso automatique et idempotente pour toute nouvelle sortie
function sortiesHelloAssoExisting_(s){
  s=s||{};
  const slug=String(s.helloassoFormSlug||'').trim();
  if(!slug)return null;
  const p=sortiesPricingData_(s);
  const cfg=helloAssoConfig_();
  const url=String(p.helloassoUrl||('https://www.helloasso.com/associations/'+(cfg.ok?cfg.orgSlug:'')+'/evenements/'+slug));
  return{ok:true,alreadyCreated:true,helloasso:{id:String(s.helloassoFormId||''),slug:slug,url:url,state:String(s.helloassoState||'')},sortie:s};
}

function sortiesCreateHelloAssoSafe_(s){
  s=s||{};
  const current=String(s.id||'')?sortiesAdminList_().sorties.find(x=>String(x.id)===String(s.id)):null;
  const existing=sortiesHelloAssoExisting_(current||s);
  if(existing)return existing;
  return sortiesCreateHelloAsso_(current||s);
}

function sortiesAdminSaveAutoHelloAsso_(s){
  s=s||{};
  const id=String(s.id||'');
  const before=id?sortiesRows_().find(x=>String(x.id)===id):null;
  const saved=sortiesAdminSave_(s);
  if(!saved||!saved.ok)return saved;

  // Une modification d'une sortie existante ne recrée jamais une billetterie.
  if(before)return saved;

  // Toute nouvelle sortie est immédiatement envoyée à HelloAsso.
  const created=sortiesCreateHelloAssoSafe_(saved.sortie||s);
  if(created&&created.ok){
    return Object.assign({},saved,{sortie:created.sortie||saved.sortie,helloasso:created.helloasso||null,helloassoCreated:true});
  }

  // La sortie reste sauvegardée dans l'application, mais l'erreur HelloAsso est renvoyée
  // afin que le client puisse retenter immédiatement et afficher la vraie raison.
  return Object.assign({},saved,{helloassoCreated:false,helloassoError:String(created&&created.error||'Création HelloAsso impossible')});
}
