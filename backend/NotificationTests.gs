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
