// Sessions.gs — déconnexion synchronisée des autres appareils
// À ajouter dans le même projet Apps Script que Code.gs.

const SESSIONS_PROP_PREFIX='sessionGeneration:';

function sessionUser_(userId){
  return listUsers_().find(u=>String(u.id)===String(userId)&&u.active)||null;
}

function sessionStateRecord_(userId){
  const u=sessionUser_(userId);
  if(!u)return null;
  const props=PropertiesService.getScriptProperties();
  const key=SESSIONS_PROP_PREFIX+String(userId);
  const passwordFingerprint=sha256_(String(u.passwordHash||''));
  let raw=props.getProperty(key),record=null;
  if(raw){
    try{record=JSON.parse(raw)}catch{record={generation:String(raw),passwordFingerprint:''}}
  }
  if(!record||!record.generation){
    record={generation:Utilities.getUuid(),passwordFingerprint:passwordFingerprint};
    props.setProperty(key,JSON.stringify(record));
    return record;
  }
  if(String(record.passwordFingerprint||'')!==String(passwordFingerprint)){
    record={generation:Utilities.getUuid(),passwordFingerprint:passwordFingerprint};
    props.setProperty(key,JSON.stringify(record));
  }
  return record;
}

function sessionGeneration_(userId){
  const record=sessionStateRecord_(userId);
  return record?record.generation:null;
}

function getSessionState_(userId){
  const generation=sessionGeneration_(userId);
  if(!generation)return{ok:false,error:'Utilisateur introuvable ou inactif'};
  return{ok:true,generation:generation};
}

// Invalide toutes les sessions déjà ouvertes de CE compte uniquement.
// Utilisé par le bouton de déconnexion à distance.
function rotateSessionGeneration_(userId){
  const u=sessionUser_(userId);
  if(!u)return null;
  const record={generation:Utilities.getUuid(),passwordFingerprint:sha256_(String(u.passwordHash||''))};
  PropertiesService.getScriptProperties().setProperty(SESSIONS_PROP_PREFIX+String(userId),JSON.stringify(record));
  return record.generation;
}

function disconnectOtherSessions_(userId,currentGeneration){
  const u=sessionUser_(userId);
  if(!u)return{ok:false,error:'Utilisateur introuvable ou inactif'};
  const serverGeneration=sessionGeneration_(userId);
  if(currentGeneration&&String(currentGeneration)!==String(serverGeneration)){
    return{ok:false,error:'Cette session n’est plus valide.',sessionExpired:true,generation:serverGeneration};
  }
  const next=rotateSessionGeneration_(userId);
  return{ok:true,generation:next,message:'Tous les autres appareils ont été déconnectés.'};
}
