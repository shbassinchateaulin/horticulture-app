// Sessions.gs — déconnexion synchronisée des autres appareils
// À ajouter dans le même projet Apps Script que Code.gs.

const SESSION_PROP_PREFIX='sessionGeneration:';

function sessionUser_(userId){
  return listUsers_().find(u=>String(u.id)===String(userId)&&u.active)||null;
}

function sessionGeneration_(userId){
  const u=sessionUser_(userId);
  if(!u)return null;
  const props=PropertiesService.getScriptProperties();
  const key=SESSION_PROP_PREFIX+String(userId);
  let generation=props.getProperty(key);
  if(!generation){
    generation=Utilities.getUuid();
    props.setProperty(key,generation);
  }
  return generation;
}

function getSessionState_(userId){
  const generation=sessionGeneration_(userId);
  if(!generation)return{ok:false,error:'Utilisateur introuvable ou inactif'};
  return{ok:true,generation:generation};
}

// Invalide toutes les sessions déjà ouvertes de CE compte uniquement.
// Utilisé après un changement de mot de passe et par le bouton de déconnexion à distance.
function rotateSessionGeneration_(userId){
  const u=sessionUser_(userId);
  if(!u)return null;
  const next=Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty(SESSION_PROP_PREFIX+String(userId),next);
  return next;
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
