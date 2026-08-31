// NotificationTests.gs — tests sûrs du centre de notifications interne
// À copier dans le même projet Apps Script que Notifications.gs.

function testerNotificationAdhesionInterneTousAdherents(){
  if(typeof createNotification_!=='function')return{ok:false,error:'Notifications.gs indisponible'};
  return createNotification_({
    push:false,
    type:'helloasso-membership',
    title:'Nouvelle adhésion HelloAsso',
    message:'TEST — Camille Jardin vient de rejoindre l’association.',
    targetPermissions:['adherents','superadmin'],
    data:{view:'adherents',test:true,source:'internal-permission-test'}
  });
}

function testerNotificationSuperAdminEtTresorier(){
  if(typeof createNotification_!=='function')return{ok:false,error:'Notifications.gs indisponible'};
  if(typeof listUsers_!=='function')return{ok:false,error:'Liste des utilisateurs indisponible'};
  const users=listUsers_().filter(u=>u&&u.active);
  const key=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const superAdmin=users.find(u=>key(u.role).includes('superadmin')||key(u.function).includes('superadmin')||key(u.username)==='superadmin');
  const tresorier=users.find(u=>key(u.role).includes('tresorier')||key(u.function).includes('tresorier')||key(u.username).includes('tresorier'));
  if(!superAdmin)return{ok:false,error:'Aucun Super Admin actif trouvé'};
  if(!tresorier)return{ok:false,error:'Aucun trésorier actif trouvé'};
  const ids=Array.from(new Set([String(superAdmin.id),String(tresorier.id)]));
  return createNotification_({
    type:'helloasso-membership',
    title:'TEST — notification partagée',
    message:'Ce test doit apparaître chez le Super Admin et le trésorier. La lecture de l’un ne doit pas supprimer celle de l’autre.',
    targetUsers:ids,
    data:{view:'adherents',test:true,source:'shared-read-isolation-test',recipients:ids}
  });
}
