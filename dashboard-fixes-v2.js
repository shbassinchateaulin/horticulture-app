(()=>{
const css=document.createElement('style');css.id='dashboard-fixes-v2';css.textContent=`
/* Compact dashboard proportions */
.dashGrid{gap:14px!important}.dashTile{min-height:158px!important;padding:20px 12px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important}.dashIcon{width:38px!important;height:38px!important;margin:0 auto 11px!important}.dashTile b{font-size:15px!important}.dashTile small{font-size:11px!important;line-height:1.35!important;margin-top:5px!important;max-width:150px!important}.dashWelcome{min-height:172px!important;padding:24px 28px!important}.dashWelcome:after{background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.96) 43%,rgba(255,255,255,.38) 70%,rgba(255,255,255,.12) 100%),url('https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=1100&q=88') center 48%/cover no-repeat!important;opacity:.9!important}.dashWelcome img{width:82px!important;height:82px!important}.dashWelcome .name{font-size:25px!important}
@media(max-width:1120px){.dashTile{min-height:148px!important}.dashIcon{width:35px!important;height:35px!important}}
@media(max-width:760px){.app{padding:12px 11px 90px!important}.dashWelcome{min-height:122px!important;padding:14px 12px!important;margin-bottom:12px!important;border-radius:15px!important}.dashWelcome:after{inset:0 0 0 53%!important;background-position:center!important}.dashWelcome img{width:58px!important;height:58px!important}.dashWelcome .name{font-size:20px!important}.dashWelcome .hello,.dashWelcome .sm{font-size:10px!important}.dashGrid{gap:8px!important}.dashTile{min-height:112px!important;padding:12px 7px!important;border-radius:14px!important}.dashIcon{width:29px!important;height:29px!important;margin-bottom:7px!important}.dashTile b{font-size:12.5px!important}.dashTile small{font-size:9px!important;line-height:1.25!important;margin-top:4px!important;max-width:120px!important}.top{height:60px!important}.admBrand img{width:35px!important;height:35px!important}.admBrand strong{font-size:16px!important}}
@media(max-width:390px){.dashTile{min-height:104px!important}.dashIcon{width:26px!important;height:26px!important}.dashTile small{display:none!important}}
`;
document.head.appendChild(css);
function refine(){
 document.querySelectorAll('.admBell em').forEach(e=>e.remove());
 const tiles=[...document.querySelectorAll('.dashTile')];
 const pub=tiles.find(t=>/Actualit/i.test(t.textContent));
 if(pub){const b=pub.querySelector('b');const s=pub.querySelector('small');if(b)b.textContent='Publier';if(s)s.textContent='Créer une actualité ou une sortie';pub.setAttribute('data-go','publish');}
 const sortie=tiles.find(t=>/^\s*Sorties/i.test(t.textContent));
 if(sortie){const s=sortie.querySelector('small');if(s)s.textContent='Inscriptions et suivi des sorties';}
 const suggestions=tiles.find(t=>/Suggestions/i.test(t.textContent));
 if(suggestions){const s=suggestions.querySelector('small');if(s)s.textContent='Consulter les suggestions reçues';}
}
refine();setTimeout(refine,250);setTimeout(refine,1000);
})();