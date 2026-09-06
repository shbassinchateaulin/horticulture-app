(()=>{
'use strict';
if(window.__horticultureUnifiedModuleIconsV2)return;window.__horticultureUnifiedModuleIconsV2=true;
const CHAT=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h10a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4h-5l-5 3 .8-3H5a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4Z"/><circle cx="8" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="11.5" cy="10.5" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r=".9" fill="currentColor" stroke="none"/></svg>`;
const IDEA=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 17h6"/><path d="M10 20h4"/><path d="M8.3 14.7A6 6 0 1 1 15.7 14.7c-1 .8-1.7 1.7-1.8 2.3h-3.8c-.1-.6-.8-1.5-1.8-2.3Z"/><path d="M12 6.4v2.2M7.9 8.1l1.5 1.2M16.1 8.1l-1.5 1.2"/></svg>`;
function holder(btn){return btn?.querySelector?.('.ico,.dashIcon,.spaceIcon')||null}
function setIcon(el,svg,key){if(!el||el.dataset.iconFinal===key)return;el.dataset.iconFinal=key;el.style.backgroundImage='none';el.style.padding='0';el.innerHTML=svg}
function suggestionButtons(){const all=[...document.querySelectorAll('#home button,.space,.dashTile')];return all.filter(b=>String(b.dataset?.permission||'').toLowerCase()==='suggestions'||String(b.dataset?.module||'').toLowerCase()==='suggestions'||/suggestion/i.test(b.textContent||''))}
function apply(){
  document.querySelectorAll('[data-module="messaging"]').forEach(btn=>setIcon(holder(btn),CHAT,'messaging-v2'));
  suggestionButtons().forEach(btn=>setIcon(holder(btn),IDEA,'suggestions-v2'));
  document.querySelectorAll('#messaging .m6EmptyIcon,#messaging .m6WelcomeCard span').forEach(x=>setIcon(x,CHAT,'messaging-inside-v2'));
}
const old=document.getElementById('unifiedModuleIconsV1Style');if(old)old.remove();
const s=document.createElement('style');s.id='unifiedModuleIconsV2Style';s.textContent=`
[data-module="messaging"] .ico,[data-module="messaging"] .dashIcon,[data-module="messaging"] .spaceIcon{background:#edf6f0!important;color:#07583f!important;display:grid!important;place-items:center!important}
[data-module="messaging"] .ico svg,[data-module="messaging"] .dashIcon svg,[data-module="messaging"] .spaceIcon svg{width:27px!important;height:27px!important;fill:none!important;stroke:currentColor!important;stroke-width:1.8!important;stroke-linecap:round!important;stroke-linejoin:round!important;opacity:1!important;visibility:visible!important}
`;document.head.appendChild(s);
apply();setTimeout(apply,250);setTimeout(apply,1200);window.addEventListener('horticulture-users-synced',()=>setTimeout(apply,50));window.addEventListener('pageshow',()=>setTimeout(apply,50));
})();