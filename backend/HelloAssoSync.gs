// HelloAssoSync.gs — synchronisation automatique HelloAsso -> Google Sheets + notifications app
// Propriétés du script requises : HELLOASSO_CLIENT_ID, HELLOASSO_CLIENT_SECRET, HELLOASSO_ORG_SLUG
// Une fois configuré, exécuter installerHelloAssoSync() une seule fois.

const HA_API='https://api.helloasso.com/v5';
const HA_TOKEN_URL='https://api.helloasso.com/oauth2/token';
const HA_PROP_LAST_SYNC='HELLOASSO_LAST_SYNC';
const HA_TRIGGER_FN='synchroniserHelloAssoAdherents';

function helloAssoConfig_(){
  const p=PropertiesService.getScriptProperties();
  const clientId=String(p.getProperty('HELLOASSO_CLIENT_ID')||'').trim();
  const clientSecret=String(p.getProperty('HELLOASSO_CLIENT_SECRET')||'').trim();
  const orgSlug=String(p.getProperty('HELLOASSO_ORG_SLUG')||'').trim();
  if(!clientId||!clientSecret||!orgSlug)return{ok:false,error:'Configuration HelloAsso incomplète. Ajoute HELLOASSO_CLIENT_ID, HELLOASSO_CLIENT_SECRET et HELLOASSO_ORG_SLUG dans les propriétés du script.'};
  return{ok:true,clientId:clientId,clientSecret:clientSecret,orgSlug:orgSlug};
}
function helloAssoToken_(){
  const cfg=helloAssoConfig_();if(!cfg.ok)throw new Error(cfg.error);
  const cache=CacheService.getScriptCache(),cached=cache.get('helloasso_access_token');if(cached)return cached;
  const r=UrlFetchApp.fetch(HA_TOKEN_URL,{method:'post',contentType:'application/x-www-form-urlencoded',payload:{grant_type:'client_credentials',client_id:cfg.clientId,client_secret:cfg.clientSecret},muteHttpExceptions:true});
  const code=r.getResponseCode(),text=r.getContentText();let j={};try{j=JSON.parse(text||'{}')}catch(_){}
  if(code<200||code>=300||!j.access_token)throw new Error('HelloAsso : '+(j.error_description||j.error||text||('HTTP '+code)));
  cache.put('helloasso_access_token',String(j.access_token),Math.max(60,Math.min(1500,Number(j.expires_in||1800)-60)));
  return String(j.access_token);
}
function helloAssoGet_(path,params){
  const q=Object.keys(params||{}).filter(k=>params[k]!==''&&params[k]!==null&&params[k]!==undefined).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
  const url=HA_API+path+(q?'?'+q:'');
  const r=UrlFetchApp.fetch(url,{method:'get',headers:{Authorization:'Bearer '+helloAssoToken_(),Accept:'application/json'},muteHttpExceptions:true});
  const code=r.getResponseCode(),text=r.getContentText();let j={};try{j=JSON.parse(text||'{}')}catch(_){}
  if(code<200||code>=300)throw new Error('HelloAsso : '+((j.error&&j.error.message)||j.message||text||('HTTP '+code)));
  return j;
}
function helloAssoSeasonStart_(){
  const now=new Date(),y=now.getFullYear(),m=now.getMonth(),start=m>=8?y:y-1;
  return new Date(start,8,1,0,0,0,0).toISOString();
}
function helloAssoNorm_(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()}
function helloAssoCustomMap_(item){
  const out={};(item&&item.customFields||[]).forEach(f=>{const k=helloAssoNorm_(f.name||f.label);const v=f.answer!==undefined?f.answer:(f.value!==undefined?f.value:'');if(k)out[k]=String(v||'').trim()});return out;
}
function helloAssoFindField_(map,words){
  const keys=Object.keys(map||{});for(let i=0;i<keys.length;i++)if(words.some(w=>keys[i].includes(w)))return map[keys[i]];return'';
}
function helloAssoAddress_(payer,map){
  const custom=helloAssoFindField_(map,['adresse','address']);if(custom)return custom;
  const parts=[payer&&payer.address,payer&&payer.zipCode,payer&&payer.city].filter(Boolean).map(String);return parts.join(' ').trim();
}
function helloAssoPhone_(payer,map){return String((payer&&(payer.phone||payer.phoneNumber))||helloAssoFindField_(map,['telephone','téléphone','portable','mobile','phone'])||'').trim()}
function helloAssoNotes_(order,item,detail,map){
  const bits=[];if(order&&order.id)bits.push('Commande HelloAsso #'+order.id);if(order&&order.formName)bits.push('Formulaire : '+order.formName);if(item&&item.name)bits.push('Tarif : '+item.name);if(item&&item.amount!==undefined)bits.push('Montant : '+(Number(item.amount||0)/100).toFixed(2)+' €');
  const reserved=['adresse','address','telephone','téléphone','portable','mobile','phone','email','e-mail','mail','prenom','prénom','firstname','nom','lastname'];
  Object.keys(map||{}).filter(k=>!reserved.some(x=>k.includes(x))&&map[k]).slice(0,20).forEach(k=>bits.push(k+' : '+map[k]));
  return bits.join(' | ');
}
function helloAssoOrderItems_(order){return (order&&order.items||[]).filter(i=>helloAssoNorm_(i.type)==='membership'&&helloAssoNorm_(i.state)!=='canceled'&&helloAssoNorm_(i.state)!=='refunded')}
function helloAssoBuildAdherent_(order,item,detail){
  detail=detail||{};const payer=order.payer||{},user=detail.user||item.user||{},map=helloAssoCustomMap_(detail);
  const firstName=String(user.firstName||payer.firstName||helloAssoFindField_(map,['prenom','prénom','firstname'])||'').trim();
  const lastName=String(user.lastName||payer.lastName||helloAssoFindField_(map,['nom','lastname'])||'').trim();
  const email=String(user.email||payer.email||helloAssoFindField_(map,['email','e-mail','mail'])||'').trim().toLowerCase();
  const date=String(order.date||detail.date||new Date().toISOString()).slice(0,10);
  return{firstName:firstName,lastName:lastName,email:email,phone:helloAssoPhone_(payer,map),address:helloAssoAddress_(payer,map),status:'Adhérent',source:'HelloAsso',dateAdhesion:date,season:adherentsAdminSeason_(),active:true,helloassoId:String(item.id||''),notes:helloAssoNotes_(order,item,detail,map)};
}
function helloAssoNotifyCreated_(a,order,item){
  if(typeof createNotification_!=='function')return null;
  const name=(a.firstName+' '+a.lastName).trim()||'Nouvel adhérent';
  return createNotification_({type:'helloasso-membership',title:'Nouvelle adhésion HelloAsso',message:name+' vient de rejoindre la saison '+a.season+'.',targetPermissions:['adherents','superadmin'],data:{view:'adherents',adherentId:a.id||'',helloassoItemId:String(item&&item.id||''),helloassoOrderId:String(order&&order.id||'')}});
}
function synchroniserHelloAssoAdherents(){
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return{ok:true,skipped:true,reason:'Synchronisation déjà en cours'};
  try{
    const cfg=helloAssoConfig_();if(!cfg.ok)return cfg;
    const props=PropertiesService.getScriptProperties();
    const last=String(props.getProperty(HA_PROP_LAST_SYNC)||'').trim();
    const from=last?new Date(Math.max(Date.parse(last)-24*60*60*1000,Date.parse(helloAssoSeasonStart_()))).toISOString():helloAssoSeasonStart_();
    let pageIndex=1,continuation='',created=0,updated=0,seen=0,errors=[],newest=last?Date.parse(last):Date.parse(from);
    do{
      const params={from:from,pageIndex:pageIndex,pageSize:100};if(continuation)params.continuationToken=continuation;
      const j=helloAssoGet_('/organizations/'+encodeURIComponent(cfg.orgSlug)+'/orders',params);const orders=Array.isArray(j.data)?j.data:(Array.isArray(j.items)?j.items:[]);
      orders.forEach(order=>{
        const t=Date.parse(order.date||order.meta&&order.meta.createdAt||'');if(t>newest)newest=t;
        helloAssoOrderItems_(order).forEach(item=>{seen++;try{
          let detail={};try{detail=helloAssoGet_('/items/'+encodeURIComponent(item.id),{withDetails:'true'})}catch(_){detail=item}
          const a=helloAssoBuildAdherent_(order,item,detail);if(!a.firstName||!a.lastName){errors.push('Item '+item.id+' : nom ou prénom manquant');return}
          const r=adherentsAdminSave_(a);if(!r.ok){errors.push('Item '+item.id+' : '+r.error);return}if(r.created){created++;helloAssoNotifyCreated_(r.adherent,order,item)}else updated++;
        }catch(e){errors.push('Item '+String(item.id||'?')+' : '+String(e.message||e))}})
      });
      const pag=j.pagination||{};continuation=String(pag.continuationToken||j.continuationToken||'');pageIndex++;
      if(!continuation&&orders.length<100)break;
    }while(pageIndex<=50);
    props.setProperty(HA_PROP_LAST_SYNC,new Date(Math.max(newest,Date.now()-60*1000)).toISOString());
    try{adherentsImportsSheet_().appendRow([Utilities.getUuid(),'HelloAsso automatique',new Date().toISOString(),seen,created,updated,errors.length,errors.slice(0,10).join(' | ')])}catch(_){}
    return{ok:true,from:from,seen:seen,created:created,updated:updated,errors:errors};
  }finally{lock.releaseLock()}
}
function installerHelloAssoSync(){
  const cfg=helloAssoConfig_();if(!cfg.ok)throw new Error(cfg.error);
  ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()===HA_TRIGGER_FN).forEach(t=>ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger(HA_TRIGGER_FN).timeBased().everyMinutes(5).create();
  const first=synchroniserHelloAssoAdherents();
  return 'Synchronisation HelloAsso installée toutes les 5 minutes. Premier passage : '+JSON.stringify(first);
}
function desinstallerHelloAssoSync(){ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()===HA_TRIGGER_FN).forEach(t=>ScriptApp.deleteTrigger(t));return 'Synchronisation HelloAsso désinstallée.'}
function reinitialiserHelloAssoSync(){PropertiesService.getScriptProperties().deleteProperty(HA_PROP_LAST_SYNC);return synchroniserHelloAssoAdherents()}
function diagnosticHelloAsso(){const cfg=helloAssoConfig_();if(!cfg.ok)return cfg;try{const j=helloAssoGet_('/organizations/'+encodeURIComponent(cfg.orgSlug)+'/orders',{pageIndex:1,pageSize:1});return{ok:true,organization:cfg.orgSlug,api:true,lastSync:PropertiesService.getScriptProperties().getProperty(HA_PROP_LAST_SYNC)||'',trigger:ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()===HA_TRIGGER_FN),sampleCount:(j.data||[]).length}}catch(e){return{ok:false,error:String(e.message||e)}}}
