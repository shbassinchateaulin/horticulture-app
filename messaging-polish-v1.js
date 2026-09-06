(()=>{
'use strict';
if(window.__horticultureMessagingPolishV5)return;window.__horticultureMessagingPolishV5=true;
['messagingPolishV1Style','messagingPolishV2Style','messagingPolishV3Style','messagingPolishV4Style'].forEach(id=>document.getElementById(id)?.remove());
const s=document.createElement('style');s.id='messagingPolishV5Style';s.textContent=`
@media(min-width:701px){
  #messaging.view.active{
    position:relative!important;
    left:50%!important;
    transform:translateX(-50%)!important;
    width:calc(100vw - 48px)!important;
    max-width:none!important;
    margin:0!important;
    padding:0!important;
  }
  #messaging .m6Shell{
    width:100%!important;
    max-width:none!important;
    height:calc(100dvh - 118px)!important;
    min-height:560px!important;
    margin:0!important;
    border-radius:22px!important;
  }
  #messaging .m6Layout{
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    grid-template-columns:clamp(300px,22vw,420px) minmax(0,1fr)!important;
  }
  #messaging .m6Side,
  #messaging .m6Main{
    min-width:0!important;
    height:100%!important;
  }
  #messaging .m6Side{
    overflow:hidden!important;
    display:flex!important;
    flex-direction:column!important;
  }
  #messaging .m6List{
    flex:1 1 auto!important;
    min-height:0!important;
    overflow:auto!important;
  }
  #messaging .m6Main{
    overflow:hidden!important;
  }
  #messaging .m6Welcome,
  #messaging .m6Chat,
  #messaging .m6Info{
    width:100%!important;
    height:100%!important;
    min-height:0!important;
  }
  #messaging .m6Head{padding:clamp(12px,1vw,18px)!important}
  #messaging .m6Title{font-size:clamp(20px,1.55vw,28px)!important}
  #messaging .m6Search input{font-size:clamp(13px,.9vw,16px)!important}
}
@media(min-width:1600px){
  #messaging.view.active{width:calc(100vw - 72px)!important}
  #messaging .m6Layout{grid-template-columns:clamp(340px,20vw,460px) minmax(0,1fr)!important}
}
@media(max-width:700px){
  html,body{max-width:100%;overflow-x:hidden}
  #messaging.view.active{position:relative!important;left:50%!important;transform:none!important;width:100vw!important;max-width:none!important;margin-left:-50vw!important;margin-right:0!important;padding:0!important;overflow-x:hidden!important}
  #messaging .m6Shell{width:100vw!important;max-width:100vw!important;height:auto!important;min-height:calc(100vh - 72px)!important;margin:0!important;border-left:0!important;border-right:0!important}
  #messaging .m6Layout,#messaging .m6Side,#messaging .m6Head,#messaging .m6SearchWrap,#messaging .m6List{width:100%!important;max-width:100%!important}
}
`;document.head.appendChild(s);
})();