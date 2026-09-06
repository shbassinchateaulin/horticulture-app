(()=>{
'use strict';
if(window.__horticultureMessagingPolishV9)return;window.__horticultureMessagingPolishV9=true;
['messagingPolishV1Style','messagingPolishV2Style','messagingPolishV3Style','messagingPolishV4Style','messagingPolishV5Style','messagingPolishV6Style','messagingPolishV7Style','messagingPolishV8Style'].forEach(id=>document.getElementById(id)?.remove());
const root=document.documentElement;
let baseTop=0;
function messagingActive(){return !!document.querySelector('#messaging.view.active')}
function syncMode(){document.body.classList.toggle('m6MessagingActive',messagingActive())}
function syncViewport(){
  const vv=window.visualViewport;
  const h=Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight);
  const top=Math.round(vv?.offsetTop||0);
  root.style.setProperty('--m6-vh',h+'px');
  root.style.setProperty('--m6-vtop',top+'px');
  syncMode();
}
function keepComposerVisible(){
  syncViewport();
  const ta=document.querySelector('#messaging .m6Composer textarea');
  if(!ta||document.activeElement!==ta)return;
  requestAnimationFrame(()=>{
    const list=document.querySelector('#messaging .m6Messages');
    if(list)list.scrollTop=list.scrollHeight;
  });
}
syncViewport();
window.visualViewport?.addEventListener('resize',keepComposerVisible,{passive:true});
window.visualViewport?.addEventListener('scroll',keepComposerVisible,{passive:true});
window.addEventListener('resize',syncViewport,{passive:true});
window.addEventListener('orientationchange',()=>setTimeout(syncViewport,100),{passive:true});
document.addEventListener('focusin',e=>{
  if(!e.target?.closest?.('#messaging .m6Composer'))return;
  baseTop=window.scrollY||0;
  document.body.classList.add('m6KeyboardOpen');
  keepComposerVisible();
  setTimeout(keepComposerVisible,60);setTimeout(keepComposerVisible,180);setTimeout(keepComposerVisible,360);
},true);
document.addEventListener('focusout',e=>{
  if(!e.target?.closest?.('#messaging .m6Composer'))return;
  document.body.classList.remove('m6KeyboardOpen');
  setTimeout(()=>{syncViewport();if(window.scrollY!==baseTop)window.scrollTo(0,baseTop)},120);
},true);
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;syncMode()})}).observe(document.getElementById('appShell')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
const s=document.createElement('style');s.id='messagingPolishV9Style';s.textContent=`
@media(min-width:701px){
  body.m6MessagingActive{overflow:hidden!important}
  #messaging.view.active{position:relative!important;left:50%!important;transform:translateX(-50%)!important;width:calc(100vw - 48px)!important;max-width:none!important;margin:0!important;padding:0!important}
  #messaging .m6Shell{width:100%!important;max-width:none!important;height:calc(100dvh - 138px)!important;min-height:520px!important;margin:0!important;border-radius:22px!important}
  #messaging .m6Layout{width:100%!important;height:100%!important;min-height:0!important;grid-template-columns:clamp(380px,25vw,470px) minmax(0,1fr)!important}
  #messaging .m6Side,#messaging .m6Main{min-width:0!important;height:100%!important}
  #messaging .m6Side{overflow:hidden!important;display:flex!important;flex-direction:column!important}
  #messaging .m6List{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important}
  #messaging .m6Main{overflow:hidden!important}
  #messaging .m6Welcome,#messaging .m6Chat,#messaging .m6Info{width:100%!important;height:100%!important;min-height:0!important}
  #messaging .m6Head{padding:clamp(12px,1vw,18px)!important}
  #messaging .m6Title{font-size:clamp(20px,1.55vw,28px)!important}
  #messaging .m6Search input{font-size:clamp(13px,.9vw,16px)!important}
  #messaging .m6Tabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:7px!important;overflow:visible!important;width:100%!important}
  #messaging .m6Tab{min-width:0!important;padding:7px 8px!important;text-align:center!important;overflow:hidden!important;text-overflow:ellipsis!important}
}
@media(min-width:1600px){
  #messaging.view.active{width:calc(100vw - 72px)!important}
  #messaging .m6Layout{grid-template-columns:clamp(400px,24vw,500px) minmax(0,1fr)!important}
}
@media(max-width:700px){
  html,body{max-width:100%!important;overflow-x:hidden!important}
  body.m6MessagingActive{overflow:hidden!important;overscroll-behavior:none!important}
  body.m6MessagingActive #appShell>.top{position:fixed!important;top:var(--m6-vtop,0px)!important;left:0!important;right:0!important;z-index:60!important;display:flex!important;visibility:visible!important;opacity:1!important;transform:none!important}
  body.m6MessagingActive .bottom{display:none!important}
  body:not(.m6MessagingActive) .bottom{display:grid!important}
  #messaging.view.active{position:fixed!important;top:calc(var(--m6-vtop,0px) + 72px)!important;left:0!important;right:0!important;bottom:auto!important;transform:none!important;width:100vw!important;height:calc(var(--m6-vh,100dvh) - 72px)!important;max-width:none!important;margin:0!important;padding:0!important;overflow:hidden!important;z-index:9!important;background:#fff!important}
  #messaging .m6Shell{width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:hidden!important}
  #messaging .m6Layout{width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;overflow:hidden!important}
  #messaging .m6Side{width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;display:flex!important;flex-direction:column!important;overflow:hidden!important}
  #messaging .m6Head,#messaging .m6SearchWrap{width:100%!important;max-width:none!important;flex:0 0 auto!important}
  #messaging .m6List{width:100%!important;max-width:none!important;flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}
  #messaging .m6Main{width:100%!important;height:100%!important;min-height:0!important;overflow:hidden!important}
  #messaging .m6Layout.chatOpen .m6Side{display:none!important}
  #messaging .m6Layout.chatOpen .m6Main{display:block!important}
  #messaging .m6Chat,#messaging .m6Info{width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;overflow:hidden!important}
  #messaging .m6Chat{display:flex!important;flex-direction:column!important}
  #messaging .m6ChatHead{flex:0 0 66px!important;position:relative!important;top:auto!important}
  #messaging .m6Messages{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important}
  #messaging .m6Composer{flex:0 0 auto!important;position:relative!important;bottom:auto!important;padding-bottom:max(9px,env(safe-area-inset-bottom))!important;background:#eef1ef!important}
  #messaging .m6Composer textarea{font-size:16px!important}
}
`;document.head.appendChild(s);
})();