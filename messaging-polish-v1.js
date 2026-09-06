(()=>{
'use strict';
if(window.__horticultureMessagingPolishV3)return;window.__horticultureMessagingPolishV3=true;
const old=document.getElementById('messagingPolishV1Style');if(old)old.remove();const old2=document.getElementById('messagingPolishV2Style');if(old2)old2.remove();
const s=document.createElement('style');s.id='messagingPolishV3Style';s.textContent=`
@media(max-width:700px){
  html,body{max-width:100%;overflow-x:hidden}
  #messaging.view.active{position:relative!important;left:50%!important;width:100vw!important;max-width:none!important;margin-left:-50vw!important;margin-right:0!important;padding:0!important;overflow-x:hidden!important}
  #messaging .m6Shell{width:100vw!important;max-width:100vw!important;margin:0!important;border-left:0!important;border-right:0!important}
  #messaging .m6Layout,#messaging .m6Side,#messaging .m6Head,#messaging .m6SearchWrap,#messaging .m6List{width:100%!important;max-width:100%!important}
}
`;document.head.appendChild(s);
})();