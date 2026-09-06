(()=>{
'use strict';
if(window.__horticultureMessagingPolishV1)return;window.__horticultureMessagingPolishV1=true;
const ICON=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.8 5.2h10.7a4.1 4.1 0 0 1 4.1 4.1v2.1a4.1 4.1 0 0 1-4.1 4.1H11l-4.9 3.3 1-3.3H4.8a3.8 3.8 0 0 1-3.8-3.8V9a3.8 3.8 0 0 1 3.8-3.8Z"/><circle cx="7.2" cy="10.4" r=".9" fill="currentColor" stroke="none"/><circle cx="10.7" cy="10.4" r=".9" fill="currentColor" stroke="none"/><circle cx="14.2" cy="10.4" r=".9" fill="currentColor" stroke="none"/><path d="M15.2 3.2c1.7.2 3 1.2 3.7 2.7"/></svg>`;
const TILE_ICON=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5h10.2a4 4 0 0 1 4 4v2.4a4 4 0 0 1-4 4H11l-4.8 3.3 1-3.3H5a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4Z"/><path d="M7.1 9.6h7M7.1 12.4h4.8"/><path d="M16.7 4.6c1.3.4 2.2 1.2 2.8 2.4"/></svg>`;
function installStyle(){if(document.getElementById('messagingPolishV1Style'))return;const s=document.createElement('style');s.id='messagingPolishV1Style';s.textContent=`
@media(max-width:700px){
  html,body{max-width:100%;overflow-x:hidden}
  #messaging.view.active{position:relative!important;left:50%!important;width:100vw!important;max-width:none!important;margin-left:-50vw!important;margin-right:0!important;padding:0!important;overflow-x:hidden!important}
  #messaging .m6Shell,#messaging .wmShell,#messaging .waShell{width:100%!important;max-width:none!important;margin:0!important;border-left:0!important;border-right:0!important}
  #messaging .m6Layout,#messaging .wmLayout,#messaging .waLayout{width:100%!important;max-width:none!important}
  #messaging .m6Side,#messaging .wmSide,#messaging .waSide{width:100%!important;max-width:none!important}
  #messaging .m6Head,#messaging .wmHeader,#messaging .waHead{width:100%!important}
  #messaging .m6SearchWrap,#messaging .wmSearchWrap,#messaging .waSearchWrap{width:100%!important}
  #messaging .m6List,#messaging .wmList,#messaging .waList{width:100%!important}
}
[data-module="messaging"] .ico svg,[data-module="messaging"] .dashIcon svg{width:27px;height:27px;fill:none;stroke:currentColor;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}
#messaging .m6EmptyIcon svg,#messaging .wmEmptyIcon svg,#messaging .waWelcome span svg,#messaging .m6WelcomeCard span svg{width:30px!important;height:30px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.7!important;stroke-linecap:round;stroke-linejoin:round}
#messaging .m6EmptyIcon,#messaging .wmEmptyIcon{background:linear-gradient(145deg,#eaf5ee,#dcefe4)!important;box-shadow:inset 0 0 0 1px #d6e9dd}
`;document.head.appendChild(s)}
function replaceTile(){document.querySelectorAll('[data-module="messaging"]').forEach(b=>{const holder=b.querySelector('.ico,.dashIcon');if(holder&&holder.dataset.msgIconPolish!=='1'){holder.innerHTML=TILE_ICON;holder.dataset.msgIconPolish='1'}})}
function replaceInside(){const root=document.getElementById('messaging');if(!root)return;root.querySelectorAll('.m6EmptyIcon,.wmEmptyIcon,.m6WelcomeCard span,.waWelcome span').forEach(el=>{if(el.dataset.msgIconPolish==='1')return;el.innerHTML=ICON;el.dataset.msgIconPolish='1'})}
function refresh(){installStyle();replaceTile();replaceInside()}
refresh();setTimeout(refresh,120);setTimeout(refresh,600);setInterval(refresh,1600);window.addEventListener('horticulture-users-synced',refresh);document.addEventListener('click',e=>{if(e.target.closest?.('[data-module="messaging"],#messaging'))setTimeout(refresh,30)},true);
})();