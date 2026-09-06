(()=>{
'use strict';
if(window.__horticultureMessagingPolishV4)return;window.__horticultureMessagingPolishV4=true;
['messagingPolishV1Style','messagingPolishV2Style','messagingPolishV3Style'].forEach(id=>document.getElementById(id)?.remove());
const s=document.createElement('style');s.id='messagingPolishV4Style';s.textContent=`
/* La messagerie doit occuper toute la zone utile de l'application sur ordinateur. */
@media(min-width:701px){
  #messaging.view.active{
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    padding:0!important;
  }
  #messaging .m6Shell{
    width:100%!important;
    max-width:none!important;
    min-height:clamp(620px,calc(100vh - 150px),860px)!important;
    margin:0!important;
  }
  #messaging .m6Layout{
    width:100%!important;
    grid-template-columns:clamp(320px,28%,390px) minmax(0,1fr)!important;
    min-height:clamp(620px,calc(100vh - 150px),860px)!important;
  }
  #messaging .m6Side,#messaging .m6Main{min-width:0!important}
  #messaging .m6Chat,#messaging .m6Info{height:clamp(620px,calc(100vh - 150px),860px)!important}
}
@media(min-width:1100px){
  #appShell main.app:has(#messaging.view.active){
    width:calc(100vw - 64px)!important;
    max-width:1440px!important;
    margin-left:auto!important;
    margin-right:auto!important;
    padding-left:0!important;
    padding-right:0!important;
  }
}
@media(max-width:700px){
  html,body{max-width:100%;overflow-x:hidden}
  #messaging.view.active{position:relative!important;left:50%!important;width:100vw!important;max-width:none!important;margin-left:-50vw!important;margin-right:0!important;padding:0!important;overflow-x:hidden!important}
  #messaging .m6Shell{width:100vw!important;max-width:100vw!important;margin:0!important;border-left:0!important;border-right:0!important}
  #messaging .m6Layout,#messaging .m6Side,#messaging .m6Head,#messaging .m6SearchWrap,#messaging .m6List{width:100%!important;max-width:100%!important}
}
`;document.head.appendChild(s);
})();