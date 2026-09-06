(()=>{
'use strict';
if(window.__horticultureMessagingBrandFinalV1)return;window.__horticultureMessagingBrandFinalV1=true;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M13 15h24c7 0 13 5.4 13 12.2v3.1c0 6.8-6 12.2-13 12.2h-8.7L18 49l2-6.5h-7C6.9 42.5 2 37.6 2 31.5v-5C2 20.1 6.9 15 13 15Z" fill="#0b6f4b"/><circle cx="16" cy="28.8" r="2.2" fill="#fff"/><circle cx="23.5" cy="28.8" r="2.2" fill="#fff"/><circle cx="31" cy="28.8" r="2.2" fill="#fff"/><path d="M28 51c7.7-2.2 13.2-7.5 16.2-15.9" fill="none" stroke="#2f8f49" stroke-width="4" stroke-linecap="round"/><path d="M42.2 37c2.7-7.8 8.2-12.1 16.8-12.7-.9 9-5.5 14.6-13.8 16.7-1.5.4-2.6-1.6-3-4Z" fill="#4fae55" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><path d="M34.2 44.6c-7-.3-12.1-4-15.3-11 8.1-.2 13.3 3.2 15.8 10.1.3.9 0 .9-.5.9Z" fill="#79be69" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></svg>`;
const uri='url("data:image/svg+xml,'+encodeURIComponent(svg).replace(/%20/g,' ')+ '")';
const style=document.createElement('style');style.id='messagingBrandFinalV1Style';style.textContent=`
[data-module="messaging"] .ico,[data-module="messaging"] .dashIcon,[data-module="messaging"] .spaceIcon{position:relative!important;background-image:${uri}!important;background-repeat:no-repeat!important;background-position:center!important;background-size:78%!important;}
[data-module="messaging"] .ico>*,[data-module="messaging"] .dashIcon>*,[data-module="messaging"] .spaceIcon>*{opacity:0!important;visibility:hidden!important;pointer-events:none!important;}
#messaging .m6EmptyIcon,#messaging .m6WelcomeCard span{position:relative!important;background-image:${uri}!important;background-repeat:no-repeat!important;background-position:center!important;background-size:70%!important;}
#messaging .m6EmptyIcon>*,#messaging .m6WelcomeCard span>*{opacity:0!important;visibility:hidden!important;pointer-events:none!important;}
[data-module="messaging"] .ico::before,[data-module="messaging"] .dashIcon::before,[data-module="messaging"] .spaceIcon::before{content:"";position:absolute;inset:0;pointer-events:none;}
`;document.head.appendChild(style);
})();