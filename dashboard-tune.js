(()=>{
const style=document.createElement('style');
style.id='dashboard-tune-style';
style.textContent=`
/* Dashboard-only refinements. Login screen untouched. */
.appShell{min-height:100vh!important}
.appShell:has(#home.active){display:flex!important;flex-direction:column!important;min-height:100vh!important}
.appShell:has(#home.active) .app{flex:1!important;width:100%!important}
#home .dashTile{min-height:158px!important;padding:18px 12px!important}
#home .dashIcon{width:38px!important;height:38px!important;margin-bottom:10px!important}
#home .dashTile b{font-size:15px!important}
#home .dashTile small{font-size:11px!important;line-height:1.4!important}
#home .dashWelcome{min-height:170px!important}
#home .dashWelcome:after{background:linear-gradient(90deg,rgba(255,255,255,1) 0%,rgba(255,255,255,.52) 34%,rgba(255,255,255,.08) 100%),url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=88') center right/cover no-repeat!important;opacity:.82!important}
.admBell em{display:none!important}
.admSearch kbd{display:none!important}
.desktopFoot{margin-top:auto!important}
@media(min-width:761px){
 .appShell:has(#home.active) .desktopFoot{margin-top:auto!important;border-radius:0!important;border-left:0!important;border-right:0!important;border-bottom:0!important;width:100%!important}
}
@media(max-width:1120px){
 #home .dashGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 #home .dashTile{min-height:148px!important}
 #home .dashIcon{width:35px!important;height:35px!important}
}
@media(max-width:760px){
 .top{height:60px!important;padding:0 10px!important}
 .admBrand{gap:8px!important}
 .admBrand img{width:34px!important;height:34px!important}
 .admBrand strong{font-size:16px!important}
 .menuBtn,.admBell{width:38px!important;height:38px!important;padding:9px!important}
 .app{padding:12px 10px 86px!important}
 #home .dashWelcome{min-height:120px!important;padding:13px 11px!important;margin-bottom:11px!important;border-radius:15px!important}
 #home .dashWelcome img{width:54px!important;height:54px!important}
 #home .dashWelcome .hello{font-size:10px!important}
 #home .dashWelcome .name{font-size:19px!important}
 #home .dashWelcome .sm{font-size:9px!important}
 #home .dashWelcome:after{inset:0 0 0 65%!important;opacity:.34!important}
 #home .dashGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 #home .dashTile{min-height:105px!important;padding:10px 6px!important;border-radius:14px!important}
 #home .dashIcon{width:28px!important;height:28px!important;margin-bottom:6px!important}
 #home .dashTile b{font-size:12px!important;line-height:1.2!important}
 #home .dashTile small{font-size:8.5px!important;line-height:1.25!important;margin-top:4px!important}
 .mobileQuick{margin:10px 0!important}
 .mobileQuick .quickBtn,.mobileQuick button{color:#07583f!important}
}
`;
document.head.appendChild(style);
const badge=document.querySelector('.admBell em'); if(badge) badge.remove();
const kbd=document.querySelector('.admSearch kbd'); if(kbd) kbd.remove();
/* Until shared persistence exists, never show invented/sample drafts. */
const draftPanel=[...document.querySelectorAll('#home .dashPanel')].find(p=>p.querySelector('h3')?.textContent.trim()==='Brouillons');
if(draftPanel){
 const title=draftPanel.querySelector('h3');
 draftPanel.innerHTML='';
 if(title) draftPanel.appendChild(title);
 const empty=document.createElement('div');
 empty.className='draftItem';
 empty.innerHTML='<div class="di">—</div><div><b>Aucun brouillon pour le moment</b><small>Les publications enregistrées en brouillon apparaîtront ici.</small></div>';
 draftPanel.appendChild(empty);
}
})();