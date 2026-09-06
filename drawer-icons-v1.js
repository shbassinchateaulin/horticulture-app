(()=>{
'use strict';
/* Ancien générateur d’icônes du menu neutralisé.
   Les icônes du drawer sont désormais gérées uniquement par module-icons-unified-v1.js. */
window.__horticultureLegacyDrawerIconsDisabled=true;
document.getElementById('drawer-icons-style')?.remove();
document.querySelectorAll('#drawer .drawerI').forEach(el=>el.remove());
})();