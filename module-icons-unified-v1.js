(()=>{
'use strict';
if(window.__horticultureModuleIconsUnifiedV1)return;window.__horticultureModuleIconsUnifiedV1=true;
const CHAT=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h10a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-5l-5 3 .8-3H5a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4Z"/><circle cx="8" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="11.5" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r=".9" fill="currentColor" stroke="none"/></svg>`;
const IDEA=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.2 14.6c-1.5-1.1-2.4-2.8-2.4-4.7A6.2 6.2 0 0 1 12 3.7a6.2 6.2 0 0 1 6.2 6.2c0 1.9-.9 3.6-2.4 4.7-.9.7-1.4 1.6-1.5 2.6H9.7c-.1-1-.6-1.9-1.5-2.6Z"/><path d="M9.7 20h4.6M10 17.2h4"/><path d="M12 7.2c-1.1.4-1.9 1.2-2.3 2.3"/></svg>`;
function holder(btn){return btn?.querySelector?.('.ico,.dashIcon,.spaceIcon')||null}
function apply(){
  document.querySelectorAll('[data-module="messaging"]').forEach(btn=>{const h=holder(btn);if(!h)return;h.style.backgroundImage='none';h.style.padding='0';h.innerHTML=CHAT;h.dataset.unifiedIcon='messaging'});
  document.querySelectorAll('[data-permission="suggestions"],[data-module="suggestions"]').forEach(btn=>{const h=holder(btn);if(!h)return;h.style.backgroundImage='none';h.style.padding='0';h.innerHTML=IDEA;h.dataset.unifiedIcon='suggestions'});
  document.querySelectorAll('#messaging .m6EmptyIcon,#messaging .m6WelcomeCard span').forEach(h=>{h.style.backgroundImage='none';h.innerHTML=CHAT;});
}
const style=document.createElement('style');style.id='moduleIconsUnifiedV1Style';style.textContent=`
[data-module="messaging"] .ico,[data-module="messaging"] .dashIcon,[data-module="messaging"] .spaceIcon,[data-permission="suggestions"] .ico,[data-module="suggestions"] .ico{background:#edf6f0!important;color:#07583f!important;display:grid!important;place-items:center!important;}
[data-module="messaging"] .ico svg,[data-module="messaging"] .dashIcon svg,[data-module="messaging"] .spaceIcon svg,[data-permission="suggestions"] .ico svg,[data-module="suggestions"] .ico svg{width:27px!important;height:27px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;opacity:1!important;visibility:visible!important;}
`;
document.head.appendChild(style);
apply();setTimeout(apply,100);setTimeout(apply,500);window.addEventListener('horticulture-users-synced',apply);
new MutationObserver(apply).observe(document.documentElement,{subtree:true,childList:true});
})();