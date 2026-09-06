(()=>{
'use strict';
if(window.__horticultureMessagingPolishV2)return;window.__horticultureMessagingPolishV2=true;
const LOGO=`<svg viewBox="0 0 64 64" aria-hidden="true">
  <path d="M17 16h23c8 0 14 5.7 14 13v3c0 7.3-6 13-14 13h-8l-11 7 2.1-7H17C9.8 45 4 39.2 4 32V29c0-7.2 5.8-13 13-13Z" fill="#0b6f4b" stroke="none"/>
  <path d="M30 20h17c7.2 0 13 5.4 13 12v3c0 4.7-2.8 8.9-7.1 11.1l3.1 7.1-10.7-6.7H38c-1.7 0-3.4-.3-4.9-.8 4.2-3.6 6.9-8.7 6.9-14.4v-3c0-3.1-.7-5.9-2.1-8.3Z" fill="#95cfa5" stroke="none" opacity=".92"/>
  <circle cx="17.5" cy="29.8" r="2.2" fill="#fff" stroke="none"/><circle cx="24.8" cy="29.8" r="2.2" fill="#fff" stroke="none"/><circle cx="32.1" cy="29.8" r="2.2" fill="#fff" stroke="none"/>
  <path d="M28.5 50.7c7.6-2.2 12.7-7.4 15.2-15.7" fill="none" stroke="#2f8f49" stroke-width="3.8" stroke-linecap="round"/>
  <path d="M41.7 37.7c2.2-7.2 7.4-11.2 15.8-12-1 8.6-5.4 13.9-13.4 16.1-1.1.3-2.4-1.5-2.4-4.1Z" fill="#4fae55" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M34.2 44.5c-6.5-.2-11.4-3.6-14.7-10.2 7.8-.3 12.8 2.9 15 9.5.4 1.2.2.7-.3.7Z" fill="#75bd68" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M43.2 40c3.8-4.5 7.6-7.2 11.6-9M33.4 43.4c-3.7-3.8-7.1-5.8-10.4-6.3" fill="none" stroke="#dff4df" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;
function installStyle(){let s=document.getElementById('messagingPolishV1Style');if(s)s.remove();s=document.createElement('style');s.id='messagingPolishV2Style';s.textContent=`
@media(max-width:700px){html,body{max-width:100%;overflow-x:hidden}#messaging.view.active{position:relative!important;left:50%!important;width:100vw!important;max-width:none!important;margin-left:-50vw!important;margin-right:0!important;padding:0!important;overflow-x:hidden!important}#messaging .m6Shell{width:100vw!important;max-width:100vw!important;margin:0!important;border-left:0!important;border-right:0!important}#messaging .m6Layout,#messaging .m6Side,#messaging .m6Head,#messaging .m6SearchWrap,#messaging .m6List{width:100%!important;max-width:100%!important}}
[data-module="messaging"] .ico svg,[data-module="messaging"] .dashIcon svg{width:38px!important;height:38px!important;display:block}.msgPlantLogoBox{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;background:linear-gradient(145deg,#edf7f1,#dff1e5);box-shadow:inset 0 0 0 1px #d4e8db}.msgPlantLogoBox svg{width:38px!important;height:38px!important}.m6EmptyIcon.msgPlantLogoBox{width:72px!important;height:72px!important;border-radius:22px!important;padding:0!important;margin:0 auto 14px!important;background:linear-gradient(145deg,#edf7f1,#dff1e5)!important}.m6EmptyIcon.msgPlantLogoBox svg{width:58px!important;height:58px!important}.m6WelcomeCard .msgPlantLogoBox{width:72px;height:72px;border-radius:22px;margin:0 auto 14px}.m6WelcomeCard .msgPlantLogoBox svg{width:58px!important;height:58px!important}
`;document.head.appendChild(s)}
function replaceTile(){document.querySelectorAll('[data-module="messaging"]').forEach(b=>{const holder=b.querySelector('.ico,.dashIcon');if(!holder)return;holder.classList.add('msgPlantLogoBox');holder.innerHTML=LOGO})}
function replaceInside(){const root=document.getElementById('messaging');if(!root)return;root.querySelectorAll('.m6EmptyIcon,.m6WelcomeCard span').forEach(el=>{el.classList.add('msgPlantLogoBox');el.innerHTML=LOGO})}
function refresh(){installStyle();replaceTile();replaceInside()}
refresh();setTimeout(refresh,120);setTimeout(refresh,600);setInterval(refresh,1800);window.addEventListener('horticulture-users-synced',refresh);document.addEventListener('click',e=>{if(e.target.closest?.('[data-module="messaging"],#messaging'))setTimeout(refresh,30)},true);
})();