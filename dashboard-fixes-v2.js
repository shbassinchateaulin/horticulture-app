(()=>{
const css=document.createElement('style');css.id='dashboard-fixes-v2';css.textContent=`
/* Fluid dashboard: use the available screen instead of a narrow fixed canvas. */
body{min-height:100vh}.appShell:has(#home.active){min-height:100vh!important;display:flex!important;flex-direction:column!important}.appShell:has(#home.active) .app{flex:1!important;width:100%!important;max-width:none!important;margin:0!important;padding-left:clamp(18px,2.2vw,42px)!important;padding-right:clamp(18px,2.2vw,42px)!important;padding-bottom:105px!important}.dashLayout{width:100%!important;grid-template-columns:minmax(0,2.25fr) minmax(330px,.95fr)!important;gap:clamp(16px,1.5vw,28px)!important}.dashGrid{gap:clamp(10px,1vw,18px)!important}.dashTile{min-height:clamp(140px,17vh,180px)!important;padding:18px 12px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important}.dashIcon{width:clamp(34px,2.6vw,44px)!important;height:clamp(34px,2.6vw,44px)!important;margin:0 auto 10px!important}.dashTile b{font-size:clamp(14px,1vw,16px)!important}.dashTile small{font-size:clamp(10px,.78vw,12px)!important;line-height:1.35!important;margin-top:5px!important;max-width:170px!important}.dashWelcome{min-height:clamp(150px,18vh,190px)!important;padding:24px 28px!important}.dashWelcome:after{background:linear-gradient(90deg,#fff 0%,rgba(255,255,255,.96) 43%,rgba(255,255,255,.38) 70%,rgba(255,255,255,.12) 100%),url('https://images.unsplash.com/photo-1446071103084-c257b5f70672?auto=format&fit=crop&w=1400&q=88') center 55%/cover no-repeat!important;opacity:.88!important}.dashWelcome img{width:82px!important;height:82px!important}.dashWelcome .name{font-size:25px!important}
/* Force iOS/Safari/PWA to keep the same dashboard text colors as desktop. */
#home .dashTile,#home .dashTile b,#home .dashTile span,#home .dashPanel,#home .quickBtn,#home .mobileQuick button,#home button,#home a{color:#111!important;-webkit-text-fill-color:#111!important;text-decoration:none!important}
#home .dashTile small,#home .dashPanel small,#home .draftItem small{color:#6d7d75!important;-webkit-text-fill-color:#6d7d75!important}
#home .dashIcon,#home .quickBtn svg,#home .dashTile svg{color:#07583f!important;-webkit-text-fill-color:#07583f!important}
/* On desktop this information strip is always at the physical bottom of the screen. */
@media(min-width:761px){.appShell:has(#home.active) .desktopFoot{position:fixed!important;left:0!important;right:0!important;bottom:0!important;z-index:30!important;width:100%!important;margin:0!important;border-radius:0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;box-shadow:0 -5px 22px rgba(16,50,39,.07)!important;background:rgba(255,255,255,.97)!important}}
@media(max-width:1180px) and (min-width:761px){.dashLayout{grid-template-columns:minmax(0,1.7fr) minmax(300px,.9fr)!important}.dashGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}.dashTile{min-height:135px!important}}
@media(max-width:760px){.app{padding:12px 11px 90px!important}.dashWelcome{min-height:122px!important;padding:14px 12px!important;margin-bottom:12px!important;border-radius:15px!important}.dashWelcome:after{inset:0 0 0 58%!important;background-position:center!important}.dashWelcome img{width:58px!important;height:58px!important}.dashWelcome .name{font-size:20px!important}.dashWelcome .hello,.dashWelcome .sm{font-size:10px!important}.dashGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}.dashTile{min-height:108px!important;padding:11px 7px!important;border-radius:14px!important}.dashIcon{width:28px!important;height:28px!important;margin-bottom:7px!important}.dashTile b{font-size:12.5px!important}.dashTile small{font-size:9px!important;line-height:1.25!important;margin-top:4px!important;max-width:120px!important}.top{height:60px!important}.admBrand img{width:35px!important;height:35px!important}.admBrand strong{font-size:16px!important}}
@media(max-width:390px){.dashTile{min-height:102px!important}.dashIcon{width:26px!important;height:26px!important}.dashTile small{display:none!important}}
`;
document.head.appendChild(css);
function refine(){
 document.querySelectorAll('.admBell em').forEach(e=>e.remove());
 const tiles=[...document.querySelectorAll('.dashTile')];
 const pub=tiles.find(t=>/Actualit|Publier/i.test(t.textContent));
 if(pub){const b=pub.querySelector('b');const s=pub.querySelector('small');if(b)b.textContent='Publier';if(s)s.textContent='Créer une actualité ou une sortie';pub.setAttribute('data-go','publish');}
 const sortie=tiles.find(t=>/^\s*Sorties/i.test(t.textContent));if(sortie){const s=sortie.querySelector('small');if(s)s.textContent='Inscriptions et suivi des sorties';}
 const suggestions=tiles.find(t=>/Suggestions/i.test(t.textContent));if(suggestions){const s=suggestions.querySelector('small');if(s)s.textContent='Consulter les suggestions reçues';}
 const panels=[...document.querySelectorAll('#home .dashPanel')];
 const drafts=panels.find(p=>p.querySelector('h3')?.textContent.trim()==='Brouillons');
 if(drafts){
   drafts.querySelectorAll('.draftItem').forEach(x=>x.remove());
   let empty=drafts.querySelector('.draftEmptyReal');
   if(!empty){empty=document.createElement('div');empty.className='draftItem draftEmptyReal';drafts.appendChild(empty);}
   empty.innerHTML='<div class="di">—</div><div><b>Aucun brouillon pour le moment</b><small>Les brouillons communs apparaîtront ici lorsqu’ils existeront.</small></div>';
 }
}
refine();setTimeout(refine,250);setTimeout(refine,1000);
})();