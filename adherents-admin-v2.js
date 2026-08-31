(()=>{
'use strict';
// Charge la dernière version fonctionnelle directement depuis GitHub Pages.
// Le paramètre de version évite qu'un téléphone conserve une ancienne copie CDN.
if(window.HorticultureAdherents)return;
const s=document.createElement('script');
s.id='adherentsAdminRecoveredV2';
s.src='./adherents-admin-stable.js?v=1';
s.async=false;
s.onerror=()=>console.error('Impossible de charger le module Adhérents.');
document.head.appendChild(s);
})();