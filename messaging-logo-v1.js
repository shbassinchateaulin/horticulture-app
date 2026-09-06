(()=>{
'use strict';
if(window.__horticultureMessagingLogoV1)return;window.__horticultureMessagingLogoV1=true;
const logo=`<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false" style="width:100%;height:100%;display:block">
<defs><linearGradient id="msgLeafG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8ccf72"/><stop offset="1" stop-color="#2f8d4f"/></linearGradient></defs>
<path d="M11 15.5C11 10.8 14.8 7 19.5 7h20C44.2 7 48 10.8 48 15.5v11c0 4.7-3.8 8.5-8.5 8.5H29l-9.8 7.1 1.9-7.1h-1.6C14.8 35 11 31.2 11 26.5v-11Z" fill="#07583f"/>
<path d="M34 22.5c3.8-6 9.8-9.3 17.8-9.5-.1 7.9-3.4 14-9.5 17.7-2.6 1.6-5.4 2.7-8.3 3.1 1.5-3.7 1.5-7.5 0-11.3Z" fill="url(#msgLeafG)" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/>
<path d="M29.5 31.5c-1.2 5.7-4.4 10.5-9.7 14.3 6.2.2 11.5-2.2 15.7-7.1 3-3.5 4.8-7.5 5.5-12" fill="none" stroke="#4fae60" stroke-width="3" stroke-linecap="round"/>
<path d="M25.5 35.5c-4.4-4.3-9.5-6.2-15.4-5.7 1.4 5.8 4.8 9.9 10 12.3 2.5 1.1 5 1.6 7.5 1.4" fill="url(#msgLeafG)" stroke="#fff" stroke-width="2.2" stroke-linejoin="round"/>
<circle cx="21" cy="20.5" r="2.3" fill="#fff"/><circle cx="29.5" cy="20.5" r="2.3" fill="#fff"/><circle cx="38" cy="20.5" r="2.3" fill="#fff"/>
</svg>`;
function apply(){
  document.querySelectorAll('[data-module="messaging"]').forEach(btn=>{
    const holder=btn.querySelector('.ico,.dashIcon,.spaceIcon')||btn.querySelector('span');
    if(holder&&!holder.dataset.msgLogoV1){holder.dataset.msgLogoV1='1';holder.innerHTML=logo;holder.style.padding='6px';holder.style.color='inherit';}
  });
  document.querySelectorAll('#messaging .m6EmptyIcon,#messaging .wmEmptyIcon,#messaging .msgWelcomeIcon,#messaging .m6WelcomeCard span').forEach(el=>{if(!el.dataset.msgLogoV1){el.dataset.msgLogoV1='1';el.innerHTML=logo;el.style.padding='10px'}});
}
apply();setTimeout(apply,200);setTimeout(apply,800);setInterval(apply,2500);window.addEventListener('horticulture-users-synced',apply);
})();