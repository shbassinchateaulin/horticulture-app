(()=>{
const style=document.createElement('style');
style.id='dashboard-tune-style';
style.textContent=`
/* Dashboard-only refinements. Login screen untouched. */
#home .dashTile{min-height:178px!important;padding:22px 12px!important}
#home .dashIcon{width:48px!important;height:48px!important;margin-bottom:12px!important}
#home .dashTile b{font-size:16px!important}
#home .dashTile small{font-size:12px!important;line-height:1.45!important}
#home .dashWelcome{min-height:184px!important}
#home .dashWelcome:after{background:linear-gradient(90deg,rgba(255,255,255,1) 0%,rgba(255,255,255,.5) 32%,rgba(255,255,255,.08) 100%),url('https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1000&q=86') center right/cover no-repeat!important;opacity:.72!important}
.admBell em{display:none!important}
@media(max-width:1120px){
 #home .dashGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
 #home .dashTile{min-height:164px!important}
 #home .dashIcon{width:44px!important;height:44px!important}
}
@media(max-width:760px){
 .top{height:60px!important;padding:0 10px!important}
 .admBrand{gap:8px!important}
 .admBrand img{width:34px!important;height:34px!important}
 .admBrand strong{font-size:16px!important}
 .menuBtn,.admBell{width:38px!important;height:38px!important;padding:9px!important}
 .app{padding:12px 10px 86px!important}
 #home .dashWelcome{min-height:126px!important;padding:14px 12px!important;margin-bottom:12px!important;border-radius:15px!important}
 #home .dashWelcome img{width:58px!important;height:58px!important}
 #home .dashWelcome .hello{font-size:11px!important}
 #home .dashWelcome .name{font-size:20px!important}
 #home .dashWelcome .sm{font-size:10px!important}
 #home .dashWelcome:after{inset:0 0 0 64%!important;opacity:.42!important}
 #home .dashGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important}
 #home .dashTile{min-height:118px!important;padding:12px 6px!important;border-radius:14px!important}
 #home .dashIcon{width:34px!important;height:34px!important;margin-bottom:7px!important}
 #home .dashTile b{font-size:13px!important;line-height:1.2!important}
 #home .dashTile small{font-size:9px!important;line-height:1.3!important;margin-top:5px!important}
 .mobileQuick{margin:12px 0!important}
}
@media(max-width:390px){
 #home .dashTile{min-height:112px!important}
 #home .dashIcon{width:31px!important;height:31px!important}
 #home .dashTile b{font-size:12px!important}
 #home .dashTile small{font-size:8.5px!important}
}
`;
document.head.appendChild(style);
const badge=document.querySelector('.admBell em'); if(badge) badge.remove();
})();