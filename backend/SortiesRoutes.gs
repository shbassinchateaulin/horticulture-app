// SortiesRoutes.gs — aide d’intégration pour Code.gs
// Ces fonctions n'ajoutent pas un second doGet/doPost : elles regroupent seulement les routes Sorties.
function sortiesRouteGet_(a,params){
  if(a==='listSortiesAdmin')return sortiesAdminList_();
  if(a==='listSortieAttendance')return sortiesAttendanceList_(params&&params.sortieId||'');
  return null;
}
function sortiesRoutePost_(b){
  if(b.action==='syncSortiesHelloAsso')return sortiesAdminSync_();
  if(b.action==='saveSortieAdmin')return sortiesAdminSaveAutoHelloAsso_(b.sortie||{});
  if(b.action==='deleteSortieAdmin')return sortiesAdminDelete_(b.id||'');
  if(b.action==='deleteSortieEverywhere')return sortiesDeleteEverywhere_(b.id||'');
  if(b.action==='saveSortieParticipant')return sortiesParticipantCapacitySave_(b.participant||{});
  if(b.action==='deleteSortieParticipant')return sortiesParticipantCapacityDelete_(b.id||'');
  if(b.action==='checkSortieTicket')return sortiesAdminCheckTicket_(b.sortieId||'',b.code||'');
  if(b.action==='setSortieAttendance')return sortiesAttendanceSet_(b.sortieId||'',b.participantId||'',b.status||'pending');
  if(b.action==='importSortieParticipantsAI')return sortiesImportAiSave_(b.sortieId||'',b.payload||{});
  if(b.action==='generateSortieDescriptionAI')return sortiesGenerateDescriptionAI_(b.sortie||{});
  if(b.action==='createSortieHelloAsso')return sortiesCreateHelloAssoSafe_(b.sortie||{});
  if(b.action==='syncSortieCapacity')return sortiesHelloAssoApplyRemaining_(b.sortieId||'');
  return null;
}
