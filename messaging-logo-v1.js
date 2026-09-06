(()=>{
'use strict';
if(window.__horticultureMessagingLogoV2)return;window.__horticultureMessagingLogoV2=true;
const logo=`<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" style="width:100%;height:100%;display:block">
<path d="M14 15h24c7.7 0 14 5.8 14 13v2.5c0 7.2-6.3 13-14 13h-8.5L19 50l2-6.5h-7C7.4 43.5 2 38.1 2 31.5V27C2 20.4 7.4 15 14 15Z" fill="#0b6f4b"/>
<path d="M31 19h16c7.2 0 13 5.4 13 12v3c0 4.9-2.9 9.1-7.3 11.2l2.8 6.3-10.1-6.1H39c-1.6 0-3.2-.2-4.6-.7 3.8-3.4 6.1-8.1 6.1-13.2V28c0-3.4-.8-6.4-2.2-9Z" fill="#9bcfa7" opacity=".95"/>
<circle cx="15.8" cy="29.3" r="2.15" fill="#fff"/><circle cx="23.3" cy="29.3" r="2.15" fill="#fff"/><circle cx="30.8" cy="29.3" r="2.15" fill="#fff"/>
<path d="M27.5 51c7.3-2 12.5-7 15.4-14.8" fill="none" stroke="#2f8f49" stroke-width="3.8" stroke-linecap="round"/>
<path d="M41.2 38c2.4-7.6 7.7-11.9 16-12.7-.7 8.8-5.1 14.4-13.2 16.7-1.3.4-2.6-1.5-2.8-4Z" fill="#4fae55" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
<path d="M34 44.5c-6.8-.2-11.9-3.7-15.2-10.5 8-.2 13.2 3 15.5 9.7.4 1.1.2.8-.3.8Z" fill="#79be69" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>
<path d="M43 40.1c3.9-4.6 7.8-7.5 11.8-9.2M33.3 43.6c-3.8-3.9-7.2-6-10.5-6.4" fill="none" stroke="#e5f5e6" stroke-width="1.4" stroke-linecap="round"/>
</svg>`;
function apply(){document.querySelectorAll('[data-module="messaging"]').forEach(btn=>{const holder=btn.querySelector('.ico,.dashIcon,.spaceIcon')||btn.querySelector('span');if(holder){holder.innerHTML=logo;holder.style.padding='4px';holder.style.color='inherit'}});document.querySelectorAll('#messaging .m6EmptyIcon,#messaging .wmEmptyIcon,#messaging .msgWelcomeIcon,#messaging .m6WelcomeCard span').forEach(el=>{el.innerHTML=logo;el.style.padding='6px'})}
apply();setTimeout(apply,120);setTimeout(apply,600);setInterval(apply,2000);window.addEventListener('horticulture-users-synced',apply);document.addEventListener('click',e=>{if(e.target.closest?.('[data-module="messaging"],#messaging'))setTimeout(apply,30)},true);
})();