(()=>{
'use strict';
if(window.__dashboardFooterFlowV1)return;window.__dashboardFooterFlowV1=true;
const style=document.createElement('style');style.id='dashboardFooterFlowStyle';style.textContent=`
@media(min-width:761px){
  #home .desktopFoot,.desktopFoot{position:static!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;width:100%!important;max-width:none!important;margin:28px 0 0!important;z-index:auto!important;}
  #home{overflow:visible!important;}
  #appShell main.app{padding-bottom:42px!important;}
}
`;
document.head.appendChild(style);
function place(){const home=document.getElementById('home'),foot=document.querySelector('.desktopFoot');if(!home||!foot)return false;if(foot.parentElement!==home)home.appendChild(foot);return true}
if(!place()){let n=0;const t=setInterval(()=>{if(place()||++n>100)clearInterval(t)},50)}
})();
