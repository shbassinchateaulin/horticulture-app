(()=>{
'use strict';
if(window.__horticultureModuleIconsUnifiedV2)return;window.__horticultureModuleIconsUnifiedV2=true;
const CHAT=`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7.5 8.5h12.6a5.4 5.4 0 0 1 5.4 5.4v3.5a5.4 5.4 0 0 1-5.4 5.4h-6.4l-6.1 4 .9-4H7.5a5 5 0 0 1-5-5v-4.3a5 5 0 0 1 5-5Z"/><circle cx="10.2" cy="15.6" r="1.15"/><circle cx="15.2" cy="15.6" r="1.15"/><circle cx="20.2" cy="15.6" r="1.15"/><path d="M22.7 7.8c2.2-2.3 4.5-3.2 6.8-2.8-.2 2.8-1.6 5-4.1 6.3-1.3.7-2.5 1-3.7.9.1-1.6.5-3.1 1-4.4Z" class="accent"/></svg>`;
const IDEA=`<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M10.5 20.2c-2.2-1.7-3.5-4.2-3.5-7A9 9 0 0 1 16 4.3a9 9 0 0 1 9 8.9c0 2.8-1.3 5.3-3.5 7-1.3 1-2.1 2.2-2.3 3.7h-6.4c-.2-1.5-1-2.7-2.3-3.7Z"/><path d="M12.8 27.6h6.4M13.7 24h4.6"/><path d="M16 8.3c-2.2.5-3.8 2-4.5 4"/><path d="M21.9 8.3c1.4-1.8 3.2-2.7 5.4-2.8-.2 2.4-1.4 4.2-3.4 5.3-1 .5-2 .7-3 .7.1-1.1.4-2.2 1-3.2Z" class="accent"/></svg>`;
function holder(btn){return btn?.querySelector?.('.ico,.dashIcon,.spaceIcon')||null}
function paint(btn,svg,key){const h=holder(btn);if(!h)return;h.removeAttribute('style');h.dataset.unifiedIcon=key;h.innerHTML=svg}
function apply(){
  document.querySelectorAll('[data-module="messaging"]').forEach(btn=>paint(btn,CHAT,'messaging'));
  document.querySelectorAll('[data-permission="suggestions"],[data-module="suggestions"]').forEach(btn=>paint(btn,IDEA,'suggestions'));
  document.querySelectorAll('#messaging .m6EmptyIcon,#messaging .m6WelcomeCard span').forEach(h=>{h.removeAttribute('style');h.innerHTML=CHAT;});
}
const old=document.getElementById('moduleIconsUnifiedV1Style');if(old)old.remove();
const style=document.createElement('style');style.id='moduleIconsUnifiedV2Style';style.textContent=`
[data-module="messaging"] .ico,[data-module="messaging"] .dashIcon,[data-module="messaging"] .spaceIcon,[data-permission="suggestions"] .ico,[data-module="suggestions"] .ico{background:transparent!important;color:#0b6b4b!important;display:grid!important;place-items:center!important;border-radius:0!important;box-shadow:none!important}
[data-module="messaging"] .ico svg,[data-module="messaging"] .dashIcon svg,[data-module="messaging"] .spaceIcon svg,[data-permission="suggestions"] .ico svg,[data-module="suggestions"] .ico svg{width:31px!important;height:31px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important;opacity:1!important;visibility:visible!important}
[data-module="messaging"] .ico svg .accent,[data-permission="suggestions"] .ico svg .accent,[data-module="suggestions"] .ico svg .accent{fill:#dff2e6!important;stroke:#2f8f49!important;stroke-width:1.45!important}
#messaging .m6EmptyIcon svg,#messaging .m6WelcomeCard span svg{width:36px!important;height:36px!important;fill:none!important;stroke:#0b6b4b!important;stroke-width:1.9!important;stroke-linecap:round!important;stroke-linejoin:round!important}
#messaging .m6EmptyIcon svg .accent,#messaging .m6WelcomeCard span svg .accent{fill:#dff2e6!important;stroke:#2f8f49!important;stroke-width:1.45!important}
`;
document.head.appendChild(style);
apply();setTimeout(apply,120);setTimeout(apply,700);window.addEventListener('horticulture-users-synced',apply);
})();