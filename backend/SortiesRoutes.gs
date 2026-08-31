// SortiesRoutes.gs — aide d’intégration pour Code.gs
// Ces fonctions n'ajoutent pas un second doGet/doPost : elles regroupent seulement les routes Sorties.
// Dans Code.gs, doGet doit appeler sortiesRouteGet_(a) avant "Action inconnue".
// Dans Code.gs, doPost doit appeler sortiesRoutePost_(b) avant "Action inconnue".

function sortiesRouteGet_(a){
  if(a==='listSortiesAdmin')return sortiesAdminList_();
  return null;
}

function sortiesRoutePost_(b){
  if(b.action==='syncSortiesHelloAsso')return sortiesAdminSync_();
  if(b.action==='saveSortieAdmin')return sortiesAdminSave_(b.sortie||{});
  if(b.action==='deleteSortieAdmin')return sortiesAdminDelete_(b.id||'');
  if(b.action==='saveSortieParticipant')return sortiesAdminSaveParticipant_(b.participant||{});
  if(b.action==='deleteSortieParticipant')return sortiesAdminDeleteParticipant_(b.id||'');
  if(b.action==='checkSortieTicket')return sortiesAdminCheckTicket_(b.sortieId||'',b.code||'');
  return null;
}
