(()=>{
'use strict';
if(window.__sortiesScannerAudioV1)return;window.__sortiesScannerAudioV1=true;
let ctx=null,master=null,primed=false,lastKind='',lastAt=0;
function context(){try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;if(!ctx||ctx.state==='closed'){ctx=new A();master=ctx.createGain();master.gain.value=.9;master.connect(ctx.destination)}return ctx}catch(_){return null}}
async function prime(){const a=context();if(!a)return false;try{if(a.state!=='running')await a.resume();const b=a.createBuffer(1,1,a.sampleRate),s=a.createBufferSource(),g=a.createGain();s.buffer=b;g.gain.value=.00001;s.connect(g);g.connect(master);s.start(0);primed=a.state==='running';return primed}catch(_){return false}}
function note(freq,dur,delay=0,vol=.35,type='sine'){const a=context();if(!a||a.state!=='running')return;const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.012);g.gain.setValueAtTime(vol,t+Math.max(.02,dur-.045));g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03)}
async function play(kind){await prime();const a=context();if(!a||a.state!=='running')return;const now=Date.now();if(kind===lastKind&&now-lastAt<700)return;lastKind=kind;lastAt=now;
 if(kind==='ok'){note(740,.10,0,.42,'sine');note(990,.11,.105,.46,'sine');note(1320,.22,.22,.5,'sine');try{navigator.vibrate?.([45,35,95])}catch(_){}}
 else if(kind==='used'){note(520,.16,0,.42,'square');note(520,.16,.25,.42,'square');try{navigator.vibrate?.([130,75,130])}catch(_){}}
 else{note(300,.17,0,.46,'sawtooth');note(210,.22,.19,.48,'sawtooth');note(145,.34,.43,.5,'sawtooth');try{navigator.vibrate?.([220,80,220,80,300])}catch(_){}}
}
function primeFromGesture(e){const t=e.target?.closest?.('[data-go="check"],[data-scan],[data-sqr5-pick],.sfs-pickBtn,.sqr5-picker,button');if(t)prime()}
window.addEventListener('pointerdown',primeFromGesture,true);window.addEventListener('touchstart',primeFromGesture,{capture:true,passive:true});window.addEventListener('click',primeFromGesture,true);
const obs=new MutationObserver(()=>{const r=document.querySelector('.sqr5-result');if(!r)return;const kind=r.classList.contains('ok')?'ok':r.classList.contains('used')?'used':r.classList.contains('bad')?'bad':'';if(kind)play(kind)});obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
window.HorticultureSortiesScannerAudio={prime,play};
})();