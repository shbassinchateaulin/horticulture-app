(()=>{
'use strict';
if(window.__horticultureMessagingPolishV14)return;window.__horticultureMessagingPolishV14=true;
['messagingPolishV1Style','messagingPolishV2Style','messagingPolishV3Style','messagingPolishV4Style','messagingPolishV5Style','messagingPolishV6Style','messagingPolishV7Style','messagingPolishV8Style','messagingPolishV9Style','messagingPolishV10Style','messagingPolishV11Style','messagingPolishV12Style','messagingPolishV13Style'].forEach(id=>document.getElementById(id)?.remove());
const root=document.documentElement;let baseTop=0;
function messagingActive(){return !!document.querySelector('#messaging.view.active')}
function syncMode(){document.body.classList.toggle('m6MessagingActive',messagingActive())}
function syncViewport(){const vv=window.visualViewport,h=Math.round(vv?.height||innerHeight||root.clientHeight),top=Math.round(vv?.offsetTop||0),header=document.querySelector('#appShell>.top'),rect=header?.getBoundingClientRect(),headerH=Math.max(0,Math.round((rect?.bottom??(top+72))-top));root.style.setProperty('--m6-vh',h+'px');root.style.setProperty('--m6-vtop',top+'px');root.style.setProperty('--m6-header-h',(headerH||72)+'px');syncMode()}
function keepComposerVisible(){syncViewport();const ta=document.querySelector('#messaging .m6Composer textarea');if(!ta||document.activeElement!==ta)return;requestAnimationFrame(()=>{const list=document.querySelector('#messaging .m6Messages');if(list)list.scrollTop=list.scrollHeight})}
syncViewport();window.visualViewport?.addEventListener('resize',keepComposerVisible,{passive:true});window.visualViewport?.addEventListener('scroll',keepComposerVisible,{passive:true});window.addEventListener('resize',syncViewport,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(syncViewport,100),{passive:true});
document.addEventListener('focusin',e=>{if(!e.target?.closest?.('#messaging .m6Composer'))return;baseTop=scrollY||0;document.body.classList.add('m6KeyboardOpen');keepComposerVisible();setTimeout(keepComposerVisible,60);setTimeout(keepComposerVisible,180);setTimeout(keepComposerVisible,360)},true);
document.addEventListener('focusout',e=>{if(!e.target?.closest?.('#messaging .m6Composer'))return;document.body.classList.remove('m6KeyboardOpen');setTimeout(()=>{syncViewport();if(scrollY!==baseTop)scrollTo(0,baseTop)},120)},true);
let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;syncViewport()})}).observe(document.getElementById('appShell')||document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','style']});
const s=document.createElement('style');s.id='messagingPolishV14Style';s.textContent=`
#messaging .m6Home,#messaging .m6BackList{width:38px!important;height:38px!important;border-radius:11px!important;padding:10px!important;background:#ffffff10!important}
#messaging .m6Home svg,#messaging .m6BackList svg{width:100%!important;height:100%!important;stroke-width:1.35!important}
#messaging .m6Home:hover,#messaging .m6BackList:hover{background:#ffffff18!important}
@media(min-width:701px){
 html:has(body.m6MessagingActive),body.m6MessagingActive{height:100%!important;overflow:hidden!important;overscroll-behavior:none!important}
 body.m6MessagingActive #appShell{height:100dvh!important;overflow:hidden!important}
 #messaging.view.active{position:relative!important;left:auto!important;right:auto!important;transform:none!important;width:100%!important;max-width:100%!important;height:calc(100dvh - var(--m6-header-h,72px) - 46px)!important;min-height:420px!important;margin:0!important;padding:0!important;box-sizing:border-box!important;overflow:hidden!important}
 #messaging .m6Shell{width:100%!important;max-width:100%!important;height:100%!important;min-height:0!important;margin:0!important;border-radius:18px!important;box-sizing:border-box!important;overflow:hidden!important}
 #messaging .m6Layout{display:grid!important;width:100%!important;height:100%!important;min-height:0!important;grid-template-columns:minmax(300px,26%) minmax(0,1fr)!important;overflow:hidden!important}
 #messaging .m6Side,#messaging .m6Main{min-width:0!important;width:auto!important;height:100%!important;min-height:0!important;max-width:none!important}
 #messaging .m6Side{display:flex!important;flex-direction:column!important;overflow:hidden!important}
 #messaging .m6Head,#messaging .m6SearchWrap{flex:0 0 auto!important;min-width:0!important}
 #messaging .m6List{flex:1 1 0!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important}
 #messaging .m6Main{overflow:hidden!important}
 #messaging .m6Welcome,#messaging .m6Chat,#messaging .m6Info{width:100%!important;height:100%!important;min-height:0!important;max-height:none!important}
 #messaging .m6Chat{display:flex!important;flex-direction:column!important}
 #messaging .m6Messages{flex:1 1 0!important;min-height:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important}
 #messaging .m6Composer{flex:0 0 auto!important}
 #messaging .m6Tabs{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important;width:100%!important;overflow:hidden!important}
 #messaging .m6Tab{min-width:0!important;padding:7px 4px!important;white-space:nowrap!important;text-align:center!important;overflow:hidden!important;text-overflow:ellipsis!important}
}
@media(min-width:701px) and (max-width:900px){#messaging .m6Layout{grid-template-columns:minmax(260px,34%) minmax(0,1fr)!important}#messaging .m6Title{font-size:20px!important}#messaging .m6Tab{font-size:11px!important}}
@media(min-width:901px) and (max-width:1200px){#messaging .m6Layout{grid-template-columns:minmax(300px,30%) minmax(0,1fr)!important}}
@media(min-width:1201px){#messaging .m6Layout{grid-template-columns:minmax(340px,25%) minmax(0,1fr)!important}}
@media(max-height:700px) and (min-width:701px){#messaging.view.active{height:calc(100dvh - var(--m6-header-h,72px) - 24px)!important;min-height:340px!important}}
@media(max-width:700px){
 html,body{max-width:100%!important;overflow-x:hidden!important}body.m6MessagingActive{overflow:hidden!important;overscroll-behavior:none!important}
 body.m6MessagingActive #appShell>.top{position:fixed!important;top:var(--m6-vtop,0px)!important;left:0!important;right:0!important;z-index:60!important;display:flex!important;visibility:visible!important;opacity:1!important;transform:none!important}
 body.m6MessagingActive .bottom{display:none!important}body:not(.m6MessagingActive) .bottom{display:grid!important}
 #messaging.view.active{position:fixed!important;top:calc(var(--m6-vtop,0px) + var(--m6-header-h,72px))!important;left:0!important;right:0!important;bottom:auto!important;transform:none!important;width:100vw!important;height:calc(var(--m6-vh,100dvh) - var(--m6-header-h,72px))!important;max-width:none!important;margin:0!important;padding:0!important;overflow:hidden!important;z-index:9!important;background:#fff!important}
 #messaging .m6Shell{width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;overflow:hidden!important}
 #messaging .m6Layout,#messaging .m6Side{width:100%!important;max-width:none!important;height:100%!important;min-height:0!important;overflow:hidden!important}
 #messaging .m6Side{display:flex!important;flex-direction:column!important}#messaging .m6Head,#messaging .m6SearchWrap{width:100%!important;max-width:none!important;flex:0 0 auto!important}
 #messaging .m6List{width:100%!important;max-width:none!important;flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important}
 #messaging .m6Main{width:100%!important;height:100%!important;min-height:0!important;overflow:hidden!important}#messaging .m6Layout.chatOpen .m6Side{display:none!important}#messaging .m6Layout.chatOpen .m6Main{display:block!important}
 #messaging .m6Chat,#messaging .m6Info{width:100%!important;height:100%!important;min-height:0!important;max-height:none!important;overflow:hidden!important}#messaging .m6Chat{display:flex!important;flex-direction:column!important}
 #messaging .m6ChatHead{flex:0 0 66px!important;position:relative!important;top:auto!important}#messaging .m6Messages{flex:1 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch!important;overscroll-behavior:contain!important}
 #messaging .m6Composer{flex:0 0 auto!important;position:relative!important;bottom:auto!important;padding-bottom:max(9px,env(safe-area-inset-bottom))!important;background:#eef1ef!important}#messaging .m6Composer textarea{font-size:16px!important}
}
`;document.head.appendChild(s);
})();